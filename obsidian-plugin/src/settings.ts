import {
  App,
  PluginSettingTab,
  Setting,
  Notice,
  TextComponent,
  ButtonComponent,
} from "obsidian";
import type NLRPlugin from "./main";
import * as fs from "fs";
import * as path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export interface HarnessConfig {
  name: string;
  type: string;
  status: string;
  url: string;
  apiKeyEnv: string;
  role: string;
  capabilities: string[];
}

export interface NLRSettings {
  nlrRoot: string;
  nlrBinaryPath: string;
  vaultPath: string;
  apiKeys: Record<string, string>;
  harnesses: HarnessConfig[];
  mcpServerMode: string;
  mcp2cliProfilePath: string;
  apiRouterPort: number;
  ngrokDomain: string;
  sessionLogging: boolean;
  scoreHistory: boolean;
  autoGrade: boolean;
  chatbotModel: string;
  chatbotSystemPrompt: string;
  apiRoutes: Array<{ keyName: string; provider: string; endpoint: string }>;
}

const API_KEY_DEFS: Array<{ key: string; label: string; desc: string; defaultVal?: string; test: string }> = [
  // LLM Providers (for your agents to call through neuro-link's /llm/v1 proxy)
  { key: "OPENROUTER_API_KEY", label: "OpenRouter API Key", desc: "LLM routing for chatbot and LLM passthrough proxy", test: "openrouter" },
  { key: "ANTHROPIC_API_KEY", label: "Anthropic API Key", desc: "Direct Anthropic access for /llm/v1/messages passthrough (optional if using OpenRouter)", test: "key-saved" },
  // Knowledge & Research
  { key: "PARALLEL_API_KEY", label: "Parallel Web API Key", desc: "Web scraping, search, and deep research for crawl-ingest pipeline", test: "key-saved" },
  { key: "INFRANODUS_API_KEY", label: "InfraNodus API Key", desc: "Knowledge graphs, gap analysis, ontology queries (MCP via mcporter)", test: "key-saved" },
  // Local Infrastructure
  { key: "EMBEDDING_API_URL", label: "Embedding Server URL", desc: "Octen-Embedding-8B — start with: ./scripts/embedding-server.sh", defaultVal: "http://localhost:8400/v1/embeddings", test: "local-url" },
  { key: "QDRANT_URL", label: "Qdrant URL", desc: "Vector database for semantic search", defaultVal: "http://localhost:6333", test: "local-url" },
  { key: "NEO4J_URI", label: "Neo4j Bolt URI", desc: "Graph database for temporal knowledge (Graphiti)", defaultVal: "bolt://localhost:7687", test: "format:bolt://" },
  { key: "NEO4J_HTTP_URL", label: "Neo4j HTTP URL", desc: "Neo4j HTTP API for Cypher queries", defaultVal: "http://localhost:7474", test: "local-url" },
  { key: "NEO4J_PASSWORD", label: "Neo4j Password", desc: "Neo4j auth password (user: neo4j, min 8 chars)", defaultVal: "neurolink1234", test: "key-saved" },
  // Tunneling
  { key: "NGROK_AUTH_TOKEN", label: "Ngrok Auth Token", desc: "Tunnel for remote MCP/API access (get from ngrok.com/dashboard)", test: "ngrok" },
];

export const DEFAULT_SETTINGS: NLRSettings = {
  nlrRoot: "",
  nlrBinaryPath: "neuro-link",
  vaultPath: "",
  apiKeys: {},
  harnesses: [],
  mcpServerMode: "stdio",
  mcp2cliProfilePath: "",
  apiRouterPort: 8080,
  ngrokDomain: "",
  sessionLogging: true,
  scoreHistory: true,
  autoGrade: false,
  chatbotModel: "anthropic/claude-sonnet-4-20250514",
  chatbotSystemPrompt: "You are an assistant with access to the neuro-link-recursive knowledge base. Use the provided wiki context to answer questions accurately.",
  apiRoutes: [],
};

export class NLRSettingTab extends PluginSettingTab {
  plugin: NLRPlugin;

  constructor(app: App, plugin: NLRPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    this.renderPathsSection(containerEl);
    this.renderFolderAccessSection(containerEl);
    this.renderApiKeysSection(containerEl);
    this.renderHarnessSection(containerEl);
    this.renderMcpSection(containerEl);
    this.renderLoggingSection(containerEl);
    this.renderChatbotSection(containerEl);
  }

  private renderPathsSection(containerEl: HTMLElement): void {
    containerEl.createEl("h2", { text: "Paths" });

    new Setting(containerEl)
      .setName("NLR Root")
      .setDesc("Path to neuro-link-recursive project root")
      .addText((text) =>
        text
          .setPlaceholder("/path/to/neuro-link-recursive")
          .setValue(this.plugin.settings.nlrRoot)
          .onChange(async (value) => {
            this.plugin.settings.nlrRoot = value;
            await this.plugin.saveSettings();
          })
      )
      .addButton((btn) =>
        btn.setButtonText("Auto-detect").onClick(async () => {
          const detected = this.plugin.detectNlrRoot();
          if (detected) {
            this.plugin.settings.nlrRoot = detected;
            await this.plugin.saveSettings();
            this.display();
            new Notice(`NLR root detected: ${detected}`);
          } else {
            new Notice("Could not auto-detect NLR root");
          }
        })
      );

    new Setting(containerEl)
      .setName("Neuro-Link Binary Path")
      .setDesc("Full path to the neuro-link CLI binary (auto-resolved if left default)")
      .addText((text) =>
        text
          .setPlaceholder("/usr/local/bin/neuro-link")
          .setValue(this.plugin.settings.nlrBinaryPath)
          .onChange(async (value) => {
            this.plugin.settings.nlrBinaryPath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Obsidian Vault Path")
      .setDesc("Auto-detected from current vault")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.vaultPath)
          .setDisabled(true)
      );
  }

  private renderFolderAccessSection(containerEl: HTMLElement): void {
    containerEl.createEl("h2", { text: "Folder Access" });
    containerEl.createEl("p", {
      text: "Select which folders the MCP server exposes to external clients. Default: all knowledge base folders.",
      cls: "setting-item-description",
    });

    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) {
      new Setting(containerEl)
        .setName("Set NLR Root first")
        .setDesc("Configure the NLR Root path above to manage folder access");
      return;
    }

    const ALL_FOLDERS = [
      { name: "00-raw", desc: "Raw ingested sources" },
      { name: "01-sorted", desc: "Classified raw material by domain" },
      { name: "02-KB-main", desc: "Wiki pages (sources of truth)" },
      { name: "03-ontology-main", desc: "Reasoning ontologies" },
      { name: "04-KB-agents-workflows", desc: "Per-agent/workflow knowledge" },
      { name: "05-insights-gaps", desc: "Knowledge gap reports" },
      { name: "05-self-improvement-HITL", desc: "Human-in-loop improvement" },
      { name: "06-self-improvement-recursive", desc: "Automated improvement" },
      { name: "06-progress-reports", desc: "Daily/weekly/monthly reports" },
      { name: "07-neuro-link-task", desc: "Task queue" },
      { name: "08-code-docs", desc: "Code documentation" },
      { name: "09-business-docs", desc: "Business documents" },
      { name: "config", desc: "Configuration files" },
    ];

    // Read current allowed_paths from config
    const configPath = path.join(nlrRoot, "config", "neuro-link.md");
    let currentAllowed: string[] = ALL_FOLDERS.map((f) => f.name); // default: all
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");
      const match = content.match(/allowed_paths:\s*(.+)/);
      if (match && match[1].trim() !== "all") {
        currentAllowed = match[1].split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    for (const folder of ALL_FOLDERS) {
      const isEnabled = currentAllowed.includes(folder.name);
      new Setting(containerEl)
        .setName(folder.name)
        .setDesc(folder.desc)
        .addToggle((toggle) =>
          toggle.setValue(isEnabled).onChange(async (value) => {
            if (value && !currentAllowed.includes(folder.name)) {
              currentAllowed.push(folder.name);
            } else if (!value) {
              const idx = currentAllowed.indexOf(folder.name);
              if (idx >= 0) currentAllowed.splice(idx, 1);
            }
          })
        );
    }

    new Setting(containerEl)
      .addButton((btn) =>
        btn
          .setButtonText("Save Folder Access")
          .setCta()
          .onClick(async () => {
            await this.saveFolderAccess(currentAllowed);
          })
      );
  }

  private async saveFolderAccess(allowed: string[]): Promise<void> {
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) return;

    const configPath = path.join(nlrRoot, "config", "neuro-link.md");
    if (!fs.existsSync(configPath)) {
      new Notice("neuro-link.md not found");
      return;
    }

    let content = fs.readFileSync(configPath, "utf-8");
    const allowedStr = allowed.join(", ");

    if (content.includes("allowed_paths:")) {
      content = content.replace(/allowed_paths:\s*.+/, `allowed_paths: ${allowedStr}`);
    } else {
      // Insert before closing ---
      content = content.replace(/\n---/, `\nallowed_paths: ${allowedStr}\n---`);
    }

    fs.writeFileSync(configPath, content, "utf-8");
    new Notice(`Folder access updated: ${allowed.length} folders enabled`);
  }

  private renderApiKeysSection(containerEl: HTMLElement): void {
    containerEl.createEl("h2", { text: "API Keys & Services" });

    // Auto-populate defaults on first load
    for (const def of API_KEY_DEFS) {
      if (def.defaultVal && !this.plugin.settings.apiKeys[def.key]) {
        this.plugin.settings.apiKeys[def.key] = def.defaultVal;
      }
    }

    let lastSection = "";
    for (const def of API_KEY_DEFS) {
      // Section headers
      const section =
        def.key.includes("OPENROUTER") || def.key.includes("ANTHROPIC") ? "LLM Providers" :
        def.key.includes("INFRANODUS") || def.key.includes("PARALLEL") ? "Knowledge & Research" :
        def.key.includes("EMBEDDING") || def.key.includes("QDRANT") || def.key.includes("NEO4J") ? "Local Infrastructure" :
        "Tunneling";
      if (section !== lastSection) {
        containerEl.createEl("h3", { text: section });
        lastSection = section;
      }

      const isPassword = !def.key.includes("URL") && !def.key.includes("URI");
      const setting = new Setting(containerEl)
        .setName(def.label)
        .setDesc(def.desc);

      setting.addText((text) => {
        const placeholder = def.defaultVal || def.key;
        text
          .setPlaceholder(placeholder)
          .setValue(this.plugin.settings.apiKeys[def.key] || "");
        if (isPassword) {
          text.inputEl.type = "password";
        }
        text.onChange(async (value) => {
          this.plugin.settings.apiKeys[def.key] = value;
          await this.plugin.saveSettings();
        });
      });

      setting.addButton((btn: ButtonComponent) =>
        btn
          .setButtonText("Test")
          .setCta()
          .onClick(async () => {
            await this.testApiKey(def.key);
          })
      );
    }

    new Setting(containerEl)
      .setName("Save to secrets/.env")
      .setDesc("Write all configured API keys to NLR_ROOT/secrets/.env")
      .addButton((btn) =>
        btn
          .setButtonText("Save")
          .setWarning()
          .onClick(async () => {
            await this.saveSecretsEnv();
          })
      );

    new Setting(containerEl)
      .setName("Load from secrets/.env")
      .setDesc("Read existing keys from NLR_ROOT/secrets/.env")
      .addButton((btn) =>
        btn
          .setButtonText("Load")
          .onClick(async () => {
            await this.loadSecretsEnv();
            this.display();
          })
      );
  }

  private renderHarnessSection(containerEl: HTMLElement): void {
    containerEl.createEl("h2", { text: "Harness Connections" });

    const harnesses = this.plugin.settings.harnesses;

    if (harnesses.length === 0) {
      new Setting(containerEl)
        .setName("No harnesses configured")
        .setDesc("Load from config or add manually")
        .addButton((btn) =>
          btn.setButtonText("Load from config").onClick(async () => {
            await this.loadHarnessesFromConfig();
            this.display();
          })
        );
    }

    for (let i = 0; i < harnesses.length; i++) {
      const h = harnesses[i];
      const setting = new Setting(containerEl)
        .setName(h.name)
        .setDesc(`${h.type} | ${h.role} | ${h.status}`);

      if (h.url) {
        setting.addButton((btn) =>
          btn.setButtonText("Test").setCta().onClick(async () => {
            await this.testHarnessConnection(h);
          })
        );
      }

      setting.addButton((btn) =>
        btn
          .setButtonText("Remove")
          .setWarning()
          .onClick(async () => {
            harnesses.splice(i, 1);
            await this.plugin.saveSettings();
            this.display();
          })
      );
    }

    new Setting(containerEl).addButton((btn) =>
      btn.setButtonText("Add Harness").onClick(() => {
        harnesses.push({
          name: "",
          type: "api",
          status: "disabled",
          url: "",
          apiKeyEnv: "",
          role: "",
          capabilities: [],
        });
        this.plugin.saveSettings();
        this.display();
      })
    );
  }

  private renderMcpSection(containerEl: HTMLElement): void {
    containerEl.createEl("h2", { text: "MCP Setup" });

    // Auto-populate mcp2cli profile path
    if (!this.plugin.settings.mcp2cliProfilePath && this.plugin.settings.nlrRoot) {
      this.plugin.settings.mcp2cliProfilePath = path.join(this.plugin.settings.nlrRoot, "mcp2cli-profile.json");
    }

    new Setting(containerEl)
      .setName("MCP Server Mode")
      .setDesc("Transport mode for MCP server")
      .addDropdown((drop) =>
        drop
          .addOption("stdio", "stdio")
          .addOption("http", "HTTP/SSE")
          .setValue(this.plugin.settings.mcpServerMode)
          .onChange(async (value) => {
            this.plugin.settings.mcpServerMode = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("mcp2cli-rs Profile Path")
      .setDesc("Path to mcp2cli-rs profile JSON (auto-generated by MCP Setup wizard)")
      .addText((text) =>
        text
          .setPlaceholder(path.join(this.plugin.settings.nlrRoot || "/path/to/neuro-link", "mcp2cli-profile.json"))
          .setValue(this.plugin.settings.mcp2cliProfilePath)
          .onChange(async (value) => {
            this.plugin.settings.mcp2cliProfilePath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("API Router Port")
      .setDesc("Port for the NLR API router")
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.apiRouterPort))
          .onChange(async (value) => {
            const parsed = parseInt(value, 10);
            if (!isNaN(parsed) && parsed > 0 && parsed < 65536) {
              this.plugin.settings.apiRouterPort = parsed;
              await this.plugin.saveSettings();
            }
          })
      );

    new Setting(containerEl)
      .setName("Ngrok Domain")
      .setDesc("Custom Ngrok domain for stable remote URL (requires paid plan)")
      .addText((text) =>
        text
          .setPlaceholder("your-domain.ngrok-free.app")
          .setValue(this.plugin.settings.ngrokDomain)
          .onChange(async (value) => {
            this.plugin.settings.ngrokDomain = value;
            await this.plugin.saveSettings();
          })
      );

    // ── MCP Connection Info ──
    containerEl.createEl("h3", { text: "Connect External Services" });
    containerEl.createEl("p", {
      text: "Copy the config below into your AI tool's MCP settings to connect to this neuro-link instance.",
      cls: "setting-item-description",
    });

    const port = this.plugin.settings.apiRouterPort || 8080;
    const nlrRoot = this.plugin.settings.nlrRoot;
    let token = "";
    if (nlrRoot) {
      const envPath = path.join(nlrRoot, "secrets", ".env");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        const match = content.match(/NLR_API_TOKEN=(.+)/);
        if (match) token = match[1].trim();
      }
    }

    const binPath = this.plugin.resolveBinaryPath();

    // stdio config (Claude Code, Cursor, etc.)
    const stdioConfig = JSON.stringify({
      mcpServers: {
        "neuro-link": {
          type: "stdio",
          command: binPath,
          args: ["mcp"],
          env: { NLR_ROOT: nlrRoot || "/path/to/neuro-link" },
        },
      },
    }, null, 2);

    // HTTP config (remote clients, K-Dense, web-based tools)
    const baseUrl = this.plugin.settings.ngrokDomain
      ? `https://${this.plugin.settings.ngrokDomain}`
      : `http://localhost:${port}`;
    const httpConfig = JSON.stringify({
      mcpServers: {
        "neuro-link": {
          type: "http",
          url: `${baseUrl}/mcp`,
          headers: { Authorization: `Bearer ${token || "YOUR_TOKEN_HERE"}` },
        },
      },
    }, null, 2);

    const stdioPre = containerEl.createEl("div", { cls: "nlr-setup-step" });
    stdioPre.createEl("h4", { text: "For CLI tools (Claude Code, Cursor, Cline)" });
    stdioPre.createEl("pre", { cls: "nlr-result-pre" }).createEl("code", { text: stdioConfig });
    new Setting(stdioPre).addButton((btn) =>
      btn.setButtonText("Copy stdio config").setCta().onClick(async () => {
        await navigator.clipboard.writeText(stdioConfig);
        new Notice("stdio MCP config copied");
      })
    );

    const httpPre = containerEl.createEl("div", { cls: "nlr-setup-step" });
    httpPre.createEl("h4", { text: "For web/remote tools (K-Dense, ChatGPT Actions, remote CLI)" });
    httpPre.createEl("pre", { cls: "nlr-result-pre" }).createEl("code", { text: httpConfig });
    new Setting(httpPre).addButton((btn) =>
      btn.setButtonText("Copy HTTP config").setCta().onClick(async () => {
        await navigator.clipboard.writeText(httpConfig);
        new Notice("HTTP MCP config copied");
      })
    );

    // REST API info
    const restPre = containerEl.createEl("div", { cls: "nlr-setup-step" });
    restPre.createEl("h4", { text: "REST API (OpenAPI-compatible)" });
    restPre.createEl("pre", { cls: "nlr-result-pre" }).createEl("code", {
      text: `Base URL: ${baseUrl}/api/v1\nAuth: Bearer ${token ? token.substring(0, 8) + "..." : "YOUR_TOKEN"}\nHealth: ${baseUrl}/health (no auth)\nDocs: ${baseUrl}/api/v1/openapi.json`,
    });
  }

  private renderLoggingSection(containerEl: HTMLElement): void {
    containerEl.createEl("h2", { text: "Logging" });

    new Setting(containerEl)
      .setName("Session Logging")
      .setDesc("Log tool calls and responses to state/session_log.jsonl")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.sessionLogging).onChange(async (value) => {
          this.plugin.settings.sessionLogging = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Score History")
      .setDesc("Record session grading scores to state/score_history.jsonl")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.scoreHistory).onChange(async (value) => {
          this.plugin.settings.scoreHistory = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Auto Grade")
      .setDesc("Automatically grade sessions on completion")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.autoGrade).onChange(async (value) => {
          this.plugin.settings.autoGrade = value;
          await this.plugin.saveSettings();
        })
      );
  }

  private renderChatbotSection(containerEl: HTMLElement): void {
    containerEl.createEl("h2", { text: "Chatbot" });

    new Setting(containerEl)
      .setName("Model")
      .setDesc("OpenRouter model identifier for chatbot")
      .addText((text) =>
        text
          .setPlaceholder("anthropic/claude-sonnet-4-20250514")
          .setValue(this.plugin.settings.chatbotModel)
          .onChange(async (value) => {
            this.plugin.settings.chatbotModel = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("System Prompt")
      .setDesc("System prompt prepended to chatbot conversations")
      .addTextArea((text) =>
        text
          .setPlaceholder("You are an assistant...")
          .setValue(this.plugin.settings.chatbotSystemPrompt)
          .onChange(async (value) => {
            this.plugin.settings.chatbotSystemPrompt = value;
            await this.plugin.saveSettings();
          })
      );
  }

  private async testApiKey(keyName: string): Promise<void> {
    const value = this.plugin.settings.apiKeys[keyName];
    const def = API_KEY_DEFS.find((d) => d.key === keyName);
    const label = def?.label || keyName;
    const test = def?.test || "key-saved";

    if (!value) {
      new Notice(`${label}: not set`);
      return;
    }

    try {
      // ── key-saved: no test possible, just confirm saved ──
      if (test === "key-saved") {
        new Notice(`${label}: saved \u2713`);
        return;
      }

      // ── key-format:prefix — validate key starts with expected prefix ──
      if (test.startsWith("key-format:")) {
        const prefix = test.substring(11);
        if (value.startsWith(prefix)) {
          new Notice(`${label}: format valid (${prefix}...) \u2713`);
        } else {
          new Notice(`${label}: saved (expected prefix: ${prefix})`);
        }
        return;
      }

      // ── format:prefix — validate URL/URI format ──
      if (test.startsWith("format:")) {
        const prefix = test.substring(7);
        new Notice(value.startsWith(prefix)
          ? `${label}: ${value} \u2713`
          : `${label}: expected ${prefix} prefix`);
        return;
      }

      // ── local-url: test local service connectivity ──
      if (test === "local-url") {
        let url = value;
        // Qdrant has /healthz
        if (keyName === "QDRANT_URL") url = value.replace(/\/$/, "") + "/healthz";
        // Embedding server: strip /v1/embeddings, try base
        else if (keyName === "EMBEDDING_API_URL") url = value.replace(/\/v1\/embeddings\/?$/, "");
        // Neo4j HTTP: test root
        // else use value as-is

        try {
          const resp = await fetch(url);
          new Notice(`${label}: connected (${resp.status}) \u2713`);
        } catch {
          const hint = keyName === "EMBEDDING_API_URL"
            ? " — start with: ./scripts/embedding-server.sh"
            : keyName === "QDRANT_URL"
            ? " — run: docker start qdrant-nlr"
            : keyName === "NEO4J_HTTP_URL"
            ? " — run: docker start neo4j-nlr"
            : "";
          new Notice(`${label}: not reachable${hint}`);
        }
        return;
      }

      // ── openrouter: known working test endpoint ──
      if (test === "openrouter") {
        const resp = await fetch("https://openrouter.ai/api/v1/models", {
          headers: { Authorization: `Bearer ${value}` },
        });
        if (resp.ok) {
          new Notice(`${label}: connected \u2713`);
        } else {
          new Notice(`${label}: HTTP ${resp.status} — check your key at openrouter.ai/settings/keys`);
        }
        return;
      }

      // ── firecrawl: POST-only API, test with a minimal scrape ──
      if (test === "firecrawl") {
        const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${value}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: "https://example.com", formats: ["markdown"], onlyMainContent: true }),
        });
        if (resp.ok || resp.status === 200 || resp.status === 201) {
          new Notice(`${label}: connected \u2713`);
        } else if (resp.status === 401 || resp.status === 403) {
          new Notice(`${label}: invalid key (${resp.status})`);
        } else if (resp.status === 402) {
          new Notice(`${label}: key valid but out of credits (${resp.status})`);
        } else {
          new Notice(`${label}: HTTP ${resp.status}`);
        }
        return;
      }

      // ── ngrok: configure auth token via CLI ──
      if (test === "ngrok") {
        try {
          await execFileAsync("ngrok", ["config", "add-authtoken", value]);
          new Notice(`${label}: configured \u2713`);
        } catch {
          // ngrok not on Electron PATH, try common locations
          const ngrokPaths = ["/usr/local/bin/ngrok", "/opt/homebrew/bin/ngrok"];
          let configured = false;
          for (const p of ngrokPaths) {
            if (fs.existsSync(p)) {
              try {
                await execFileAsync(p, ["config", "add-authtoken", value]);
                new Notice(`${label}: configured \u2713`);
                configured = true;
                break;
              } catch { /* try next */ }
            }
          }
          if (!configured) {
            new Notice(`${label}: saved — run in terminal: ngrok config add-authtoken ${value.substring(0, 8)}...`);
          }
        }
        return;
      }

      new Notice(`${label}: saved \u2713`);
    } catch (e: unknown) {
      const err = e as Error;
      new Notice(`${label}: error — ${err.message}`);
    }
  }

  private async testHarnessConnection(harness: HarnessConfig): Promise<void> {
    if (!harness.url) {
      new Notice(`${harness.name}: no URL configured`);
      return;
    }
    try {
      const response = await fetch(harness.url);
      new Notice(`${harness.name}: ${response.ok ? "OK" : response.status}`);
    } catch (e: unknown) {
      const err = e as Error;
      new Notice(`${harness.name}: unreachable - ${err.message}`);
    }
  }

  private async saveSecretsEnv(): Promise<void> {
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) {
      new Notice("NLR Root path not set");
      return;
    }

    const secretsDir = path.join(nlrRoot, "secrets");
    if (!fs.existsSync(secretsDir)) {
      fs.mkdirSync(secretsDir, { recursive: true });
    }

    const envPath = path.join(secretsDir, ".env");
    const lines: string[] = [
      "# neuro-link-recursive secrets",
      `# Generated by Obsidian plugin at ${new Date().toISOString()}`,
      "",
    ];

    for (const def of API_KEY_DEFS) {
      const value = this.plugin.settings.apiKeys[def.key] || "";
      if (value) {
        lines.push(`${def.key}=${value}`);
      }
    }

    fs.writeFileSync(envPath, lines.join("\n") + "\n", "utf-8");
    new Notice(`Saved ${lines.length - 3} keys to ${envPath}`);
  }

  private async loadSecretsEnv(): Promise<void> {
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) {
      new Notice("NLR Root path not set");
      return;
    }

    const envPath = path.join(nlrRoot, "secrets", ".env");
    if (!fs.existsSync(envPath)) {
      new Notice("secrets/.env not found");
      return;
    }

    const content = fs.readFileSync(envPath, "utf-8");
    let loaded = 0;

    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.substring(0, eqIdx).trim();
      const value = trimmed.substring(eqIdx + 1).trim();
      if (API_KEY_DEFS.some((d) => d.key === key)) {
        this.plugin.settings.apiKeys[key] = value;
        loaded++;
      }
    }

    await this.plugin.saveSettings();
    new Notice(`Loaded ${loaded} keys from secrets/.env`);
  }

  private async loadHarnessesFromConfig(): Promise<void> {
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) {
      new Notice("NLR Root path not set");
      return;
    }

    const configPath = path.join(nlrRoot, "config", "harness-harness-comms.md");
    if (!fs.existsSync(configPath)) {
      new Notice("harness-harness-comms.md not found");
      return;
    }

    const content = fs.readFileSync(configPath, "utf-8");
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) {
      new Notice("No frontmatter found in harness config");
      return;
    }

    const fm = fmMatch[1];
    const harnesses: HarnessConfig[] = [];
    const harnessBlock = fm.match(/harnesses:\n([\s\S]*?)(?=routing_rules:|$)/);

    if (harnessBlock) {
      const entries = harnessBlock[1].matchAll(
        /\s{2}(\S+):\n([\s\S]*?)(?=\n\s{2}\S+:|\n[a-z]|$)/g
      );
      for (const entry of entries) {
        const name = entry[1];
        const block = entry[2];
        const getVal = (key: string): string => {
          const m = block.match(new RegExp(`${key}:\\s*(.+)`));
          return m ? m[1].trim() : "";
        };
        const capsMatch = block.match(/capabilities:\n((?:\s+-\s+.+\n?)*)/);
        const capabilities = capsMatch
          ? capsMatch[1]
              .split("\n")
              .map((l) => l.replace(/^\s+-\s+/, "").trim())
              .filter(Boolean)
          : [];

        harnesses.push({
          name,
          type: getVal("type"),
          status: getVal("status"),
          url: getVal("url") || "",
          apiKeyEnv: getVal("api_key_env"),
          role: getVal("role"),
          capabilities,
        });
      }
    }

    this.plugin.settings.harnesses = harnesses;
    await this.plugin.saveSettings();
    new Notice(`Loaded ${harnesses.length} harnesses from config`);
  }
}
