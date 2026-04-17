var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => NLRPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian8 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var import_child_process = require("child_process");
var import_util = require("util");
var execFileAsync = (0, import_util.promisify)(import_child_process.execFile);
var API_KEY_DEFS = [
  // LLM Providers (for your agents to call through neuro-link's /llm/v1 proxy)
  { key: "OPENROUTER_API_KEY", label: "OpenRouter API Key", desc: "LLM routing for chatbot and LLM passthrough proxy", test: "openrouter" },
  { key: "ANTHROPIC_API_KEY", label: "Anthropic API Key", desc: "Direct Anthropic access for /llm/v1/messages passthrough (optional if using OpenRouter)", test: "key-saved" },
  // Knowledge & Research
  { key: "PARALLEL_API_KEY", label: "Parallel Web API Key", desc: "Web scraping, search, and deep research for crawl-ingest pipeline", test: "key-saved" },
  { key: "INFRANODUS_API_KEY", label: "InfraNodus API Key", desc: "Knowledge graphs, gap analysis, ontology queries (MCP via mcporter)", test: "key-saved" },
  // Local Infrastructure
  { key: "EMBEDDING_API_URL", label: "Embedding Server URL", desc: "Octen-Embedding-8B \u2014 start with: ./scripts/embedding-server.sh", defaultVal: "http://localhost:8400/v1/embeddings", test: "local-url" },
  { key: "QDRANT_URL", label: "Qdrant URL", desc: "Vector database for semantic search", defaultVal: "http://localhost:6333", test: "local-url" },
  { key: "NEO4J_URI", label: "Neo4j Bolt URI", desc: "Graph database for temporal knowledge (Graphiti)", defaultVal: "bolt://localhost:7687", test: "format:bolt://" },
  { key: "NEO4J_HTTP_URL", label: "Neo4j HTTP URL", desc: "Neo4j HTTP API for Cypher queries", defaultVal: "http://localhost:7474", test: "local-url" },
  { key: "NEO4J_PASSWORD", label: "Neo4j Password", desc: "Neo4j auth password (user: neo4j, min 8 chars)", defaultVal: "neurolink1234", test: "key-saved" },
  // Tunneling
  { key: "NGROK_AUTH_TOKEN", label: "Ngrok Auth Token", desc: "Tunnel for remote MCP/API access (get from ngrok.com/dashboard)", test: "ngrok" }
];
var DEFAULT_SETTINGS = {
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
  apiRoutes: []
};
var NLRSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
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
  renderPathsSection(containerEl) {
    containerEl.createEl("h2", { text: "Paths" });
    new import_obsidian.Setting(containerEl).setName("NLR Root").setDesc("Path to neuro-link-recursive project root").addText(
      (text) => text.setPlaceholder("/path/to/neuro-link-recursive").setValue(this.plugin.settings.nlrRoot).onChange(async (value) => {
        this.plugin.settings.nlrRoot = value;
        await this.plugin.saveSettings();
      })
    ).addButton(
      (btn) => btn.setButtonText("Auto-detect").onClick(async () => {
        const detected = this.plugin.detectNlrRoot();
        if (detected) {
          this.plugin.settings.nlrRoot = detected;
          await this.plugin.saveSettings();
          this.display();
          new import_obsidian.Notice(`NLR root detected: ${detected}`);
        } else {
          new import_obsidian.Notice("Could not auto-detect NLR root");
        }
      })
    );
    new import_obsidian.Setting(containerEl).setName("Neuro-Link Binary Path").setDesc("Full path to the neuro-link CLI binary (auto-resolved if left default)").addText(
      (text) => text.setPlaceholder("/usr/local/bin/neuro-link").setValue(this.plugin.settings.nlrBinaryPath).onChange(async (value) => {
        this.plugin.settings.nlrBinaryPath = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Obsidian Vault Path").setDesc("Auto-detected from current vault").addText(
      (text) => text.setValue(this.plugin.settings.vaultPath).setDisabled(true)
    );
  }
  renderFolderAccessSection(containerEl) {
    containerEl.createEl("h2", { text: "Folder Access" });
    containerEl.createEl("p", {
      text: "Select which folders the MCP server exposes to external clients. Default: all knowledge base folders.",
      cls: "setting-item-description"
    });
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) {
      new import_obsidian.Setting(containerEl).setName("Set NLR Root first").setDesc("Configure the NLR Root path above to manage folder access");
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
      { name: "config", desc: "Configuration files" }
    ];
    const configPath = path.join(nlrRoot, "config", "neuro-link.md");
    let currentAllowed = ALL_FOLDERS.map((f) => f.name);
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");
      const match = content.match(/allowed_paths:\s*(.+)/);
      if (match && match[1].trim() !== "all") {
        currentAllowed = match[1].split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    for (const folder of ALL_FOLDERS) {
      const isEnabled = currentAllowed.includes(folder.name);
      new import_obsidian.Setting(containerEl).setName(folder.name).setDesc(folder.desc).addToggle(
        (toggle) => toggle.setValue(isEnabled).onChange(async (value) => {
          if (value && !currentAllowed.includes(folder.name)) {
            currentAllowed.push(folder.name);
          } else if (!value) {
            const idx = currentAllowed.indexOf(folder.name);
            if (idx >= 0)
              currentAllowed.splice(idx, 1);
          }
        })
      );
    }
    new import_obsidian.Setting(containerEl).addButton(
      (btn) => btn.setButtonText("Save Folder Access").setCta().onClick(async () => {
        await this.saveFolderAccess(currentAllowed);
      })
    );
  }
  async saveFolderAccess(allowed) {
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot)
      return;
    const configPath = path.join(nlrRoot, "config", "neuro-link.md");
    if (!fs.existsSync(configPath)) {
      new import_obsidian.Notice("neuro-link.md not found");
      return;
    }
    let content = fs.readFileSync(configPath, "utf-8");
    const allowedStr = allowed.join(", ");
    if (content.includes("allowed_paths:")) {
      content = content.replace(/allowed_paths:\s*.+/, `allowed_paths: ${allowedStr}`);
    } else {
      content = content.replace(/\n---/, `
allowed_paths: ${allowedStr}
---`);
    }
    fs.writeFileSync(configPath, content, "utf-8");
    new import_obsidian.Notice(`Folder access updated: ${allowed.length} folders enabled`);
  }
  renderApiKeysSection(containerEl) {
    containerEl.createEl("h2", { text: "API Keys & Services" });
    for (const def of API_KEY_DEFS) {
      if (def.defaultVal && !this.plugin.settings.apiKeys[def.key]) {
        this.plugin.settings.apiKeys[def.key] = def.defaultVal;
      }
    }
    let lastSection = "";
    for (const def of API_KEY_DEFS) {
      const section = def.key.includes("OPENROUTER") || def.key.includes("ANTHROPIC") ? "LLM Providers" : def.key.includes("INFRANODUS") || def.key.includes("PARALLEL") ? "Knowledge & Research" : def.key.includes("EMBEDDING") || def.key.includes("QDRANT") || def.key.includes("NEO4J") ? "Local Infrastructure" : "Tunneling";
      if (section !== lastSection) {
        containerEl.createEl("h3", { text: section });
        lastSection = section;
      }
      const isPassword = !def.key.includes("URL") && !def.key.includes("URI");
      const setting = new import_obsidian.Setting(containerEl).setName(def.label).setDesc(def.desc);
      setting.addText((text) => {
        const placeholder = def.defaultVal || def.key;
        text.setPlaceholder(placeholder).setValue(this.plugin.settings.apiKeys[def.key] || "");
        if (isPassword) {
          text.inputEl.type = "password";
        }
        text.onChange(async (value) => {
          this.plugin.settings.apiKeys[def.key] = value;
          await this.plugin.saveSettings();
        });
      });
      setting.addButton(
        (btn) => btn.setButtonText("Test").setCta().onClick(async () => {
          await this.testApiKey(def.key);
        })
      );
    }
    new import_obsidian.Setting(containerEl).setName("Save to secrets/.env").setDesc("Write all configured API keys to NLR_ROOT/secrets/.env").addButton(
      (btn) => btn.setButtonText("Save").setWarning().onClick(async () => {
        await this.saveSecretsEnv();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Load from secrets/.env").setDesc("Read existing keys from NLR_ROOT/secrets/.env").addButton(
      (btn) => btn.setButtonText("Load").onClick(async () => {
        await this.loadSecretsEnv();
        this.display();
      })
    );
  }
  renderHarnessSection(containerEl) {
    containerEl.createEl("h2", { text: "Harness Connections" });
    const harnesses = this.plugin.settings.harnesses;
    if (harnesses.length === 0) {
      new import_obsidian.Setting(containerEl).setName("No harnesses configured").setDesc("Load from config or add manually").addButton(
        (btn) => btn.setButtonText("Load from config").onClick(async () => {
          await this.loadHarnessesFromConfig();
          this.display();
        })
      );
    }
    for (let i = 0; i < harnesses.length; i++) {
      const h = harnesses[i];
      const setting = new import_obsidian.Setting(containerEl).setName(h.name).setDesc(`${h.type} | ${h.role} | ${h.status}`);
      if (h.url) {
        setting.addButton(
          (btn) => btn.setButtonText("Test").setCta().onClick(async () => {
            await this.testHarnessConnection(h);
          })
        );
      }
      setting.addButton(
        (btn) => btn.setButtonText("Remove").setWarning().onClick(async () => {
          harnesses.splice(i, 1);
          await this.plugin.saveSettings();
          this.display();
        })
      );
    }
    new import_obsidian.Setting(containerEl).addButton(
      (btn) => btn.setButtonText("Add Harness").onClick(() => {
        harnesses.push({
          name: "",
          type: "api",
          status: "disabled",
          url: "",
          apiKeyEnv: "",
          role: "",
          capabilities: []
        });
        this.plugin.saveSettings();
        this.display();
      })
    );
  }
  renderMcpSection(containerEl) {
    containerEl.createEl("h2", { text: "MCP Setup" });
    if (!this.plugin.settings.mcp2cliProfilePath && this.plugin.settings.nlrRoot) {
      this.plugin.settings.mcp2cliProfilePath = path.join(this.plugin.settings.nlrRoot, "mcp2cli-profile.json");
    }
    new import_obsidian.Setting(containerEl).setName("MCP Server Mode").setDesc("Transport mode for MCP server").addDropdown(
      (drop) => drop.addOption("stdio", "stdio").addOption("http", "HTTP/SSE").setValue(this.plugin.settings.mcpServerMode).onChange(async (value) => {
        this.plugin.settings.mcpServerMode = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("mcp2cli-rs Profile Path").setDesc("Path to mcp2cli-rs profile JSON (auto-generated by MCP Setup wizard)").addText(
      (text) => text.setPlaceholder(path.join(this.plugin.settings.nlrRoot || "/path/to/neuro-link", "mcp2cli-profile.json")).setValue(this.plugin.settings.mcp2cliProfilePath).onChange(async (value) => {
        this.plugin.settings.mcp2cliProfilePath = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("API Router Port").setDesc("Port for the NLR API router").addText(
      (text) => text.setValue(String(this.plugin.settings.apiRouterPort)).onChange(async (value) => {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed < 65536) {
          this.plugin.settings.apiRouterPort = parsed;
          await this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian.Setting(containerEl).setName("Ngrok Domain").setDesc("Custom Ngrok domain for stable remote URL (requires paid plan)").addText(
      (text) => text.setPlaceholder("your-domain.ngrok-free.app").setValue(this.plugin.settings.ngrokDomain).onChange(async (value) => {
        this.plugin.settings.ngrokDomain = value;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "Connect External Services" });
    containerEl.createEl("p", {
      text: "Copy the config below into your AI tool's MCP settings to connect to this neuro-link instance.",
      cls: "setting-item-description"
    });
    const port = this.plugin.settings.apiRouterPort || 8080;
    const nlrRoot = this.plugin.settings.nlrRoot;
    let token = "";
    if (nlrRoot) {
      const envPath = path.join(nlrRoot, "secrets", ".env");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        const match = content.match(/NLR_API_TOKEN=(.+)/);
        if (match)
          token = match[1].trim();
      }
    }
    const binPath = this.plugin.resolveBinaryPath();
    const stdioConfig = JSON.stringify({
      mcpServers: {
        "neuro-link": {
          type: "stdio",
          command: binPath,
          args: ["mcp"],
          env: { NLR_ROOT: nlrRoot || "/path/to/neuro-link" }
        }
      }
    }, null, 2);
    const baseUrl = this.plugin.settings.ngrokDomain ? `https://${this.plugin.settings.ngrokDomain}` : `http://localhost:${port}`;
    const httpConfig = JSON.stringify({
      mcpServers: {
        "neuro-link": {
          type: "http",
          url: `${baseUrl}/mcp`,
          headers: { Authorization: `Bearer ${token || "YOUR_TOKEN_HERE"}` }
        }
      }
    }, null, 2);
    const stdioPre = containerEl.createEl("div", { cls: "nlr-setup-step" });
    stdioPre.createEl("h4", { text: "For CLI tools (Claude Code, Cursor, Cline)" });
    stdioPre.createEl("pre", { cls: "nlr-result-pre" }).createEl("code", { text: stdioConfig });
    new import_obsidian.Setting(stdioPre).addButton(
      (btn) => btn.setButtonText("Copy stdio config").setCta().onClick(async () => {
        await navigator.clipboard.writeText(stdioConfig);
        new import_obsidian.Notice("stdio MCP config copied");
      })
    );
    const httpPre = containerEl.createEl("div", { cls: "nlr-setup-step" });
    httpPre.createEl("h4", { text: "For web/remote tools (K-Dense, ChatGPT Actions, remote CLI)" });
    httpPre.createEl("pre", { cls: "nlr-result-pre" }).createEl("code", { text: httpConfig });
    new import_obsidian.Setting(httpPre).addButton(
      (btn) => btn.setButtonText("Copy HTTP config").setCta().onClick(async () => {
        await navigator.clipboard.writeText(httpConfig);
        new import_obsidian.Notice("HTTP MCP config copied");
      })
    );
    const restPre = containerEl.createEl("div", { cls: "nlr-setup-step" });
    restPre.createEl("h4", { text: "REST API (OpenAPI-compatible)" });
    restPre.createEl("pre", { cls: "nlr-result-pre" }).createEl("code", {
      text: `Base URL: ${baseUrl}/api/v1
Auth: Bearer ${token ? token.substring(0, 8) + "..." : "YOUR_TOKEN"}
Health: ${baseUrl}/health (no auth)
Docs: ${baseUrl}/api/v1/openapi.json`
    });
  }
  renderLoggingSection(containerEl) {
    containerEl.createEl("h2", { text: "Logging" });
    new import_obsidian.Setting(containerEl).setName("Session Logging").setDesc("Log tool calls and responses to state/session_log.jsonl").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.sessionLogging).onChange(async (value) => {
        this.plugin.settings.sessionLogging = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Score History").setDesc("Record session grading scores to state/score_history.jsonl").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.scoreHistory).onChange(async (value) => {
        this.plugin.settings.scoreHistory = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Auto Grade").setDesc("Automatically grade sessions on completion").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.autoGrade).onChange(async (value) => {
        this.plugin.settings.autoGrade = value;
        await this.plugin.saveSettings();
      })
    );
  }
  renderChatbotSection(containerEl) {
    containerEl.createEl("h2", { text: "Chatbot" });
    new import_obsidian.Setting(containerEl).setName("Model").setDesc("OpenRouter model identifier for chatbot").addText(
      (text) => text.setPlaceholder("anthropic/claude-sonnet-4-20250514").setValue(this.plugin.settings.chatbotModel).onChange(async (value) => {
        this.plugin.settings.chatbotModel = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("System Prompt").setDesc("System prompt prepended to chatbot conversations").addTextArea(
      (text) => text.setPlaceholder("You are an assistant...").setValue(this.plugin.settings.chatbotSystemPrompt).onChange(async (value) => {
        this.plugin.settings.chatbotSystemPrompt = value;
        await this.plugin.saveSettings();
      })
    );
  }
  async testApiKey(keyName) {
    const value = this.plugin.settings.apiKeys[keyName];
    const def = API_KEY_DEFS.find((d) => d.key === keyName);
    const label = def?.label || keyName;
    const test = def?.test || "key-saved";
    if (!value) {
      new import_obsidian.Notice(`${label}: not set`);
      return;
    }
    try {
      if (test === "key-saved") {
        new import_obsidian.Notice(`${label}: saved \u2713`);
        return;
      }
      if (test.startsWith("key-format:")) {
        const prefix = test.substring(11);
        if (value.startsWith(prefix)) {
          new import_obsidian.Notice(`${label}: format valid (${prefix}...) \u2713`);
        } else {
          new import_obsidian.Notice(`${label}: saved (expected prefix: ${prefix})`);
        }
        return;
      }
      if (test.startsWith("format:")) {
        const prefix = test.substring(7);
        new import_obsidian.Notice(value.startsWith(prefix) ? `${label}: ${value} \u2713` : `${label}: expected ${prefix} prefix`);
        return;
      }
      if (test === "local-url") {
        let url = value;
        if (keyName === "QDRANT_URL")
          url = value.replace(/\/$/, "") + "/healthz";
        else if (keyName === "EMBEDDING_API_URL")
          url = value.replace(/\/v1\/embeddings\/?$/, "");
        try {
          const resp = await fetch(url);
          new import_obsidian.Notice(`${label}: connected (${resp.status}) \u2713`);
        } catch {
          const hint = keyName === "EMBEDDING_API_URL" ? " \u2014 start with: ./scripts/embedding-server.sh" : keyName === "QDRANT_URL" ? " \u2014 run: docker start qdrant-nlr" : keyName === "NEO4J_HTTP_URL" ? " \u2014 run: docker start neo4j-nlr" : "";
          new import_obsidian.Notice(`${label}: not reachable${hint}`);
        }
        return;
      }
      if (test === "openrouter") {
        const resp = await fetch("https://openrouter.ai/api/v1/models", {
          headers: { Authorization: `Bearer ${value}` }
        });
        if (resp.ok) {
          new import_obsidian.Notice(`${label}: connected \u2713`);
        } else {
          new import_obsidian.Notice(`${label}: HTTP ${resp.status} \u2014 check your key at openrouter.ai/settings/keys`);
        }
        return;
      }
      if (test === "firecrawl") {
        const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${value}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: "https://example.com", formats: ["markdown"], onlyMainContent: true })
        });
        if (resp.ok || resp.status === 200 || resp.status === 201) {
          new import_obsidian.Notice(`${label}: connected \u2713`);
        } else if (resp.status === 401 || resp.status === 403) {
          new import_obsidian.Notice(`${label}: invalid key (${resp.status})`);
        } else if (resp.status === 402) {
          new import_obsidian.Notice(`${label}: key valid but out of credits (${resp.status})`);
        } else {
          new import_obsidian.Notice(`${label}: HTTP ${resp.status}`);
        }
        return;
      }
      if (test === "ngrok") {
        try {
          await execFileAsync("ngrok", ["config", "add-authtoken", value]);
          new import_obsidian.Notice(`${label}: configured \u2713`);
        } catch {
          const ngrokPaths = ["/usr/local/bin/ngrok", "/opt/homebrew/bin/ngrok"];
          let configured = false;
          for (const p of ngrokPaths) {
            if (fs.existsSync(p)) {
              try {
                await execFileAsync(p, ["config", "add-authtoken", value]);
                new import_obsidian.Notice(`${label}: configured \u2713`);
                configured = true;
                break;
              } catch {
              }
            }
          }
          if (!configured) {
            new import_obsidian.Notice(`${label}: saved \u2014 run in terminal: ngrok config add-authtoken ${value.substring(0, 8)}...`);
          }
        }
        return;
      }
      new import_obsidian.Notice(`${label}: saved \u2713`);
    } catch (e) {
      const err = e;
      new import_obsidian.Notice(`${label}: error \u2014 ${err.message}`);
    }
  }
  async testHarnessConnection(harness) {
    if (!harness.url) {
      new import_obsidian.Notice(`${harness.name}: no URL configured`);
      return;
    }
    try {
      const response = await fetch(harness.url);
      new import_obsidian.Notice(`${harness.name}: ${response.ok ? "OK" : response.status}`);
    } catch (e) {
      const err = e;
      new import_obsidian.Notice(`${harness.name}: unreachable - ${err.message}`);
    }
  }
  async saveSecretsEnv() {
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) {
      new import_obsidian.Notice("NLR Root path not set");
      return;
    }
    const secretsDir = path.join(nlrRoot, "secrets");
    if (!fs.existsSync(secretsDir)) {
      fs.mkdirSync(secretsDir, { recursive: true });
    }
    const envPath = path.join(secretsDir, ".env");
    const lines = [
      "# neuro-link-recursive secrets",
      `# Generated by Obsidian plugin at ${(/* @__PURE__ */ new Date()).toISOString()}`,
      ""
    ];
    for (const def of API_KEY_DEFS) {
      const value = this.plugin.settings.apiKeys[def.key] || "";
      if (value) {
        lines.push(`${def.key}=${value}`);
      }
    }
    fs.writeFileSync(envPath, lines.join("\n") + "\n", "utf-8");
    new import_obsidian.Notice(`Saved ${lines.length - 3} keys to ${envPath}`);
  }
  async loadSecretsEnv() {
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) {
      new import_obsidian.Notice("NLR Root path not set");
      return;
    }
    const envPath = path.join(nlrRoot, "secrets", ".env");
    if (!fs.existsSync(envPath)) {
      new import_obsidian.Notice("secrets/.env not found");
      return;
    }
    const content = fs.readFileSync(envPath, "utf-8");
    let loaded = 0;
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#"))
        continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1)
        continue;
      const key = trimmed.substring(0, eqIdx).trim();
      const value = trimmed.substring(eqIdx + 1).trim();
      if (API_KEY_DEFS.some((d) => d.key === key)) {
        this.plugin.settings.apiKeys[key] = value;
        loaded++;
      }
    }
    await this.plugin.saveSettings();
    new import_obsidian.Notice(`Loaded ${loaded} keys from secrets/.env`);
  }
  async loadHarnessesFromConfig() {
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) {
      new import_obsidian.Notice("NLR Root path not set");
      return;
    }
    const configPath = path.join(nlrRoot, "config", "harness-harness-comms.md");
    if (!fs.existsSync(configPath)) {
      new import_obsidian.Notice("harness-harness-comms.md not found");
      return;
    }
    const content = fs.readFileSync(configPath, "utf-8");
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) {
      new import_obsidian.Notice("No frontmatter found in harness config");
      return;
    }
    const fm = fmMatch[1];
    const harnesses = [];
    const harnessBlock = fm.match(/harnesses:\n([\s\S]*?)(?=routing_rules:|$)/);
    if (harnessBlock) {
      const entries = harnessBlock[1].matchAll(
        /\s{2}(\S+):\n([\s\S]*?)(?=\n\s{2}\S+:|\n[a-z]|$)/g
      );
      for (const entry of entries) {
        const name = entry[1];
        const block = entry[2];
        const getVal = (key) => {
          const m = block.match(new RegExp(`${key}:\\s*(.+)`));
          return m ? m[1].trim() : "";
        };
        const capsMatch = block.match(/capabilities:\n((?:\s+-\s+.+\n?)*)/);
        const capabilities = capsMatch ? capsMatch[1].split("\n").map((l) => l.replace(/^\s+-\s+/, "").trim()).filter(Boolean) : [];
        harnesses.push({
          name,
          type: getVal("type"),
          status: getVal("status"),
          url: getVal("url") || "",
          apiKeyEnv: getVal("api_key_env"),
          role: getVal("role"),
          capabilities
        });
      }
    }
    this.plugin.settings.harnesses = harnesses;
    await this.plugin.saveSettings();
    new import_obsidian.Notice(`Loaded ${harnesses.length} harnesses from config`);
  }
};

// src/commands.ts
var import_obsidian7 = require("obsidian");

// src/harness-setup.ts
var import_obsidian2 = require("obsidian");
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var HarnessSetupModal = class extends import_obsidian2.Modal {
  constructor(app, plugin, harness) {
    super(app);
    this.plugin = plugin;
    this.isNew = !harness;
    this.harness = harness ? { ...harness } : {
      name: "",
      type: "api",
      status: "disabled",
      url: "",
      apiKeyEnv: "",
      role: "",
      capabilities: []
    };
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: this.isNew ? "Add Harness" : `Edit: ${this.harness.name}` });
    new import_obsidian2.Setting(contentEl).setName("Name").setDesc("Unique identifier for this harness").addText(
      (text) => text.setPlaceholder("my-harness").setValue(this.harness.name).onChange((v) => {
        this.harness.name = v;
      })
    );
    new import_obsidian2.Setting(contentEl).setName("Type").addDropdown(
      (drop) => drop.addOption("local", "Local CLI").addOption("api", "API (HTTP)").addOption("mcp", "MCP Server").setValue(this.harness.type).onChange((v) => {
        this.harness.type = v;
      })
    );
    new import_obsidian2.Setting(contentEl).setName("Status").addDropdown(
      (drop) => drop.addOption("active", "Active").addOption("disabled", "Disabled").addOption("error", "Error").setValue(this.harness.status).onChange((v) => {
        this.harness.status = v;
      })
    );
    new import_obsidian2.Setting(contentEl).setName("URL").setDesc("API endpoint or MCP server URL (leave empty for local CLI)").addText(
      (text) => text.setPlaceholder("http://localhost:8000").setValue(this.harness.url).onChange((v) => {
        this.harness.url = v;
      })
    );
    new import_obsidian2.Setting(contentEl).setName("API Key Env Variable").setDesc("Environment variable name for the API key").addText(
      (text) => text.setPlaceholder("MY_HARNESS_API_KEY").setValue(this.harness.apiKeyEnv).onChange((v) => {
        this.harness.apiKeyEnv = v;
      })
    );
    new import_obsidian2.Setting(contentEl).setName("Role").addDropdown(
      (drop) => drop.addOption("primary", "Primary").addOption("research", "Research").addOption("implementation", "Implementation").addOption("review", "Review").addOption("monitoring", "Monitoring").setValue(this.harness.role || "research").onChange((v) => {
        this.harness.role = v;
      })
    );
    new import_obsidian2.Setting(contentEl).setName("Capabilities").setDesc("Comma-separated list of capabilities").addText(
      (text) => text.setPlaceholder("code_generation, testing, review").setValue(this.harness.capabilities.join(", ")).onChange((v) => {
        this.harness.capabilities = v.split(",").map((s) => s.trim()).filter(Boolean);
      })
    );
    const btnRow = contentEl.createDiv({ cls: "nlr-modal-btn-row" });
    if (this.harness.url) {
      new import_obsidian2.Setting(btnRow).addButton(
        (btn) => btn.setButtonText("Test Connection").setCta().onClick(async () => {
          await this.testConnection();
        })
      );
    }
    new import_obsidian2.Setting(btnRow).addButton(
      (btn) => btn.setButtonText("Save").setCta().onClick(async () => {
        await this.save();
      })
    );
    new import_obsidian2.Setting(btnRow).addButton(
      (btn) => btn.setButtonText("Save to Config").setWarning().onClick(async () => {
        await this.save();
        await this.writeToConfig();
      })
    );
    this.renderRoutingRules(contentEl);
  }
  renderRoutingRules(contentEl) {
    contentEl.createEl("h4", { text: "Routing Rules" });
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) {
      contentEl.createEl("p", { text: "Set NLR Root to view routing rules", cls: "nlr-stats-muted" });
      return;
    }
    const configPath = path2.join(nlrRoot, "config", "harness-harness-comms.md");
    if (!fs2.existsSync(configPath)) {
      contentEl.createEl("p", { text: "harness-harness-comms.md not found", cls: "nlr-stats-muted" });
      return;
    }
    const content = fs2.readFileSync(configPath, "utf-8");
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch)
      return;
    const rulesMatch = fmMatch[1].match(/routing_rules:\n([\s\S]*?)$/);
    if (!rulesMatch)
      return;
    const rules = [];
    const ruleEntries = rulesMatch[1].matchAll(/- pattern:\s*"([^"]+)"\n\s+route_to:\s*(\S+)/g);
    for (const m of ruleEntries) {
      rules.push({ pattern: m[1], route_to: m[2] });
    }
    if (rules.length === 0) {
      contentEl.createEl("p", { text: "No routing rules defined", cls: "nlr-stats-muted" });
      return;
    }
    const table = contentEl.createEl("table", { cls: "nlr-stats-table" });
    const thead = table.createEl("thead");
    const headerRow = thead.createEl("tr");
    headerRow.createEl("th", { text: "Pattern" });
    headerRow.createEl("th", { text: "Route To" });
    const tbody = table.createEl("tbody");
    for (const rule of rules) {
      const row = tbody.createEl("tr");
      row.createEl("td", { text: rule.pattern });
      const routeCell = row.createEl("td", { text: rule.route_to });
      if (rule.route_to === this.harness.name) {
        routeCell.addClass("nlr-stats-highlight");
      }
    }
  }
  async testConnection() {
    if (!this.harness.url) {
      new import_obsidian2.Notice("No URL configured");
      return;
    }
    try {
      const response = await fetch(this.harness.url);
      new import_obsidian2.Notice(`${this.harness.name}: ${response.ok ? "Connected" : `HTTP ${response.status}`}`);
    } catch (e) {
      const err = e;
      new import_obsidian2.Notice(`${this.harness.name}: unreachable - ${err.message}`);
    }
  }
  async save() {
    if (!this.harness.name) {
      new import_obsidian2.Notice("Harness name is required");
      return;
    }
    const harnesses = this.plugin.settings.harnesses;
    const existingIdx = harnesses.findIndex((h) => h.name === this.harness.name);
    if (existingIdx >= 0) {
      harnesses[existingIdx] = { ...this.harness };
    } else {
      harnesses.push({ ...this.harness });
    }
    await this.plugin.saveSettings();
    new import_obsidian2.Notice(`Harness "${this.harness.name}" saved`);
    this.close();
  }
  async writeToConfig() {
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) {
      new import_obsidian2.Notice("NLR Root not set");
      return;
    }
    const configPath = path2.join(nlrRoot, "config", "harness-harness-comms.md");
    if (!fs2.existsSync(configPath)) {
      new import_obsidian2.Notice("harness-harness-comms.md not found");
      return;
    }
    const content = fs2.readFileSync(configPath, "utf-8");
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) {
      new import_obsidian2.Notice("No frontmatter found in config");
      return;
    }
    const h = this.harness;
    const yamlBlock = [
      `  ${h.name}:`,
      `    type: ${h.type}`,
      `    status: ${h.status}`,
      `    role: ${h.role}`
    ];
    if (h.url)
      yamlBlock.push(`    url: ${h.url}`);
    if (h.apiKeyEnv)
      yamlBlock.push(`    api_key_env: ${h.apiKeyEnv}`);
    if (h.capabilities.length > 0) {
      yamlBlock.push("    capabilities:");
      for (const cap of h.capabilities) {
        yamlBlock.push(`      - ${cap}`);
      }
    }
    const newBlock = yamlBlock.join("\n");
    let fm = fmMatch[1];
    const existingPattern = new RegExp(`  ${h.name}:\\n(?:    .+\\n)*`, "g");
    if (existingPattern.test(fm)) {
      fm = fm.replace(existingPattern, newBlock + "\n");
    } else {
      const routingIdx = fm.indexOf("routing_rules:");
      if (routingIdx >= 0) {
        fm = fm.substring(0, routingIdx) + newBlock + "\n" + fm.substring(routingIdx);
      } else {
        fm += "\n" + newBlock;
      }
    }
    const body = content.substring(fmMatch[0].length);
    fs2.writeFileSync(configPath, `---
${fm}
---${body}`, "utf-8");
    new import_obsidian2.Notice(`Written ${h.name} to harness config`);
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/mcp-setup.ts
var import_obsidian3 = require("obsidian");
var fs3 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
var McpSetupModal = class extends import_obsidian3.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("nlr-mcp-setup-modal");
    contentEl.createEl("h3", { text: "MCP Server Setup" });
    this.renderStep1(contentEl);
    this.renderStep2(contentEl);
    this.renderStep3(contentEl);
    this.renderStep4(contentEl);
    this.renderStep5(contentEl);
  }
  renderStep1(contentEl) {
    const section = contentEl.createDiv({ cls: "nlr-setup-step" });
    section.createEl("h4", { text: "Step 1: Install NLR Binary" });
    const nlrBin = this.plugin.settings.nlrBinaryPath || "neuro-link";
    const statusEl = section.createDiv({ cls: "nlr-setup-status" });
    new import_obsidian3.Setting(section).setName("Check Installation").setDesc(`Current binary path: ${nlrBin}`).addButton(
      (btn) => btn.setButtonText("Verify").setCta().onClick(async () => {
        try {
          await this.plugin.runNlrCommand(["--version"]);
          statusEl.empty();
          statusEl.createEl("span", { text: "\u2713 neuro-link binary found", cls: "nlr-stats-success" });
        } catch {
          statusEl.empty();
          statusEl.createEl("span", { text: "\u2717 neuro-link binary not found", cls: "nlr-stats-failure" });
        }
      })
    );
    const installInstructions = section.createDiv({ cls: "nlr-setup-instructions" });
    installInstructions.createEl("p", { text: "Install via Cargo:" });
    const codeBlock = installInstructions.createEl("pre", { cls: "nlr-result-pre" });
    codeBlock.createEl("code", {
      text: "cargo install neuro-link-mcp\n\n# Or build from source:\ncd server && cargo build --release\ncp target/release/neuro-link ~/.cargo/bin/neuro-link"
    });
  }
  renderStep2(contentEl) {
    const section = contentEl.createDiv({ cls: "nlr-setup-step" });
    section.createEl("h4", { text: "Step 2: Configure Claude Code MCP Server" });
    const nlrRoot = this.plugin.settings.nlrRoot || "/path/to/neuro-link-recursive";
    const nlrBin = this.plugin.settings.nlrBinaryPath || "neuro-link";
    const mcpConfig = JSON.stringify(
      {
        mcpServers: {
          "neuro-link-recursive": {
            type: "stdio",
            command: nlrBin,
            args: ["mcp"],
            env: { NLR_ROOT: nlrRoot }
          }
        }
      },
      null,
      2
    );
    section.createEl("p", { text: "Add this to ~/.claude.json:" });
    const codeBlock = section.createEl("pre", { cls: "nlr-result-pre" });
    codeBlock.createEl("code", { text: mcpConfig });
    new import_obsidian3.Setting(section).addButton(
      (btn) => btn.setButtonText("Copy to Clipboard").setCta().onClick(async () => {
        await navigator.clipboard.writeText(mcpConfig);
        new import_obsidian3.Notice("MCP config copied to clipboard");
      })
    );
    new import_obsidian3.Setting(section).addButton(
      (btn) => btn.setButtonText("Auto-add to ~/.claude.json").setWarning().onClick(async () => {
        await this.addToClaudeJson(nlrBin, nlrRoot);
      })
    );
  }
  renderStep3(contentEl) {
    const section = contentEl.createDiv({ cls: "nlr-setup-step" });
    section.createEl("h4", { text: "Step 3: mcp2cli-rs Profile" });
    section.createEl("p", {
      text: "mcp2cli-rs converts MCP tool calls to CLI commands. Generate a profile for NLR:"
    });
    const profilePath = this.plugin.settings.mcp2cliProfilePath || path3.join(this.plugin.settings.nlrRoot || "", "mcp2cli-profile.json");
    new import_obsidian3.Setting(section).setName("Profile Path").addText(
      (text) => text.setValue(profilePath).setDisabled(true)
    );
    const statusEl = section.createDiv({ cls: "nlr-setup-status" });
    new import_obsidian3.Setting(section).addButton(
      (btn) => btn.setButtonText("Generate Profile").setCta().onClick(async () => {
        await this.generateMcp2cliProfile(profilePath);
        statusEl.empty();
        statusEl.createEl("span", { text: "\u2713 Profile generated", cls: "nlr-stats-success" });
      })
    );
    new import_obsidian3.Setting(section).addButton(
      (btn) => btn.setButtonText("View Current Profile").onClick(async () => {
        if (fs3.existsSync(profilePath)) {
          const content = fs3.readFileSync(profilePath, "utf-8");
          const pre = section.createEl("pre", { cls: "nlr-result-pre" });
          pre.createEl("code", { text: content });
        } else {
          new import_obsidian3.Notice("Profile not found at " + profilePath);
        }
      })
    );
  }
  renderStep4(contentEl) {
    const section = contentEl.createDiv({ cls: "nlr-setup-step" });
    section.createEl("h4", { text: "Step 4: Connect External MCP Clients" });
    section.createEl("p", {
      text: "The server auto-starts when the plugin loads. External MCP clients connect via HTTP."
    });
    const port = this.plugin.settings.apiRouterPort || 8080;
    let token = "(not set)";
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (nlrRoot) {
      const envPath = path3.join(nlrRoot, "secrets", ".env");
      if (fs3.existsSync(envPath)) {
        const content = fs3.readFileSync(envPath, "utf-8");
        const match = content.match(/NLR_API_TOKEN=(.+)/);
        if (match)
          token = match[1].trim();
      }
    }
    section.createEl("p", { text: `Server: http://localhost:${port}` });
    section.createEl("p", { text: `Token: ${token.substring(0, 8)}...` });
    const mcpClientConfig = JSON.stringify({
      mcpServers: {
        "neuro-link-recursive": {
          type: "http",
          url: `http://localhost:${port}/mcp`,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    }, null, 2);
    section.createEl("p", { text: "For HTTP MCP clients (add to their config):" });
    const codeBlock = section.createEl("pre", { cls: "nlr-result-pre" });
    codeBlock.createEl("code", { text: mcpClientConfig });
    new import_obsidian3.Setting(section).addButton(
      (btn) => btn.setButtonText("Copy MCP Config").setCta().onClick(async () => {
        await navigator.clipboard.writeText(mcpClientConfig);
        new import_obsidian3.Notice("MCP client config copied to clipboard");
      })
    );
    new import_obsidian3.Setting(section).setName("Port").addText(
      (text) => text.setValue(String(port)).onChange(async (v) => {
        const p = parseInt(v, 10);
        if (!isNaN(p) && p > 0 && p < 65536) {
          this.plugin.settings.apiRouterPort = p;
          await this.plugin.saveSettings();
        }
      })
    );
  }
  renderStep5(contentEl) {
    const section = contentEl.createDiv({ cls: "nlr-setup-step" });
    section.createEl("h4", { text: "Step 5: Ngrok Tunnel (Optional)" });
    section.createEl("p", {
      text: "Expose the API router over HTTPS for remote harness communication."
    });
    new import_obsidian3.Setting(section).setName("Ngrok Domain").addText(
      (text) => text.setPlaceholder("your-domain.ngrok-free.app").setValue(this.plugin.settings.ngrokDomain).onChange(async (v) => {
        this.plugin.settings.ngrokDomain = v;
        await this.plugin.saveSettings();
      })
    );
    const ngrokCmd = this.plugin.settings.ngrokDomain ? `ngrok http ${this.plugin.settings.apiRouterPort} --domain=${this.plugin.settings.ngrokDomain}` : `ngrok http ${this.plugin.settings.apiRouterPort}`;
    const pre = section.createEl("pre", { cls: "nlr-result-pre" });
    pre.createEl("code", { text: ngrokCmd });
    new import_obsidian3.Setting(section).addButton(
      (btn) => btn.setButtonText("Copy Command").onClick(async () => {
        await navigator.clipboard.writeText(ngrokCmd);
        new import_obsidian3.Notice("Ngrok command copied");
      })
    );
    new import_obsidian3.Setting(section).addButton(
      (btn) => btn.setButtonText("Start via NLR").setCta().onClick(async () => {
        try {
          const result = await this.plugin.runNlrCommand(["ngrok"]);
          new import_obsidian3.Notice("Ngrok started");
          section.createEl("pre", { cls: "nlr-result-pre" }).createEl("code", { text: result });
        } catch (e) {
          const err = e;
          new import_obsidian3.Notice(`Ngrok failed: ${err.message}`);
        }
      })
    );
  }
  async addToClaudeJson(nlrBin, nlrRoot) {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    const claudeJsonPath = path3.join(home, ".claude.json");
    let existing = {};
    if (fs3.existsSync(claudeJsonPath)) {
      try {
        existing = JSON.parse(fs3.readFileSync(claudeJsonPath, "utf-8"));
      } catch {
        new import_obsidian3.Notice("Failed to parse existing ~/.claude.json");
        return;
      }
    }
    const mcpServers = existing["mcpServers"] || {};
    mcpServers["neuro-link-recursive"] = {
      type: "stdio",
      command: nlrBin,
      args: ["mcp"],
      env: { NLR_ROOT: nlrRoot }
    };
    existing["mcpServers"] = mcpServers;
    fs3.writeFileSync(claudeJsonPath, JSON.stringify(existing, null, 2) + "\n", "utf-8");
    new import_obsidian3.Notice("Added neuro-link-recursive to ~/.claude.json");
  }
  async generateMcp2cliProfile(profilePath) {
    const profile = {
      profile: "neuro-link-recursive",
      version: 1,
      transport: {
        type: "stdio",
        command: this.plugin.settings.nlrBinaryPath || "nlr",
        args: ["mcp"]
      },
      tools: [
        { mcp_name: "nlr_wiki_create", cli_name: "wiki-create" },
        { mcp_name: "nlr_wiki_read", cli_name: "wiki-read" },
        { mcp_name: "nlr_wiki_update", cli_name: "wiki-update" },
        { mcp_name: "nlr_wiki_list", cli_name: "wiki-list" },
        { mcp_name: "nlr_wiki_search", cli_name: "wiki-search" },
        { mcp_name: "nlr_rag_query", cli_name: "rag-query" },
        { mcp_name: "nlr_rag_rebuild_index", cli_name: "rag-rebuild" },
        { mcp_name: "nlr_ontology_generate", cli_name: "ontology-generate" },
        { mcp_name: "nlr_ontology_query", cli_name: "ontology-query" },
        { mcp_name: "nlr_ontology_gaps", cli_name: "ontology-gaps" },
        { mcp_name: "nlr_ingest", cli_name: "ingest" },
        { mcp_name: "nlr_ingest_classify", cli_name: "ingest-classify" },
        { mcp_name: "nlr_ingest_dedup", cli_name: "ingest-dedup" },
        { mcp_name: "nlr_task_list", cli_name: "task-list" },
        { mcp_name: "nlr_task_create", cli_name: "task-create" },
        { mcp_name: "nlr_task_update", cli_name: "task-update" },
        { mcp_name: "nlr_harness_dispatch", cli_name: "harness-dispatch" },
        { mcp_name: "nlr_harness_list", cli_name: "harness-list" },
        { mcp_name: "nlr_scan_health", cli_name: "scan-health" },
        { mcp_name: "nlr_scan_staleness", cli_name: "scan-staleness" },
        { mcp_name: "nlr_state_heartbeat", cli_name: "state-heartbeat" },
        { mcp_name: "nlr_state_log", cli_name: "state-log" },
        { mcp_name: "nlr_config_read", cli_name: "config-read" }
      ]
    };
    const dir = path3.dirname(profilePath);
    if (!fs3.existsSync(dir)) {
      fs3.mkdirSync(dir, { recursive: true });
    }
    fs3.writeFileSync(profilePath, JSON.stringify(profile, null, 2) + "\n", "utf-8");
    new import_obsidian3.Notice(`mcp2cli profile written to ${profilePath}`);
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/api-router.ts
var import_obsidian4 = require("obsidian");
var fs4 = __toESM(require("fs"));
var path4 = __toESM(require("path"));
var PROVIDERS = [
  { value: "openrouter", label: "OpenRouter", endpoint: "https://openrouter.ai/api/v1" },
  { value: "anthropic", label: "Anthropic", endpoint: "https://api.anthropic.com/v1" },
  { value: "openai", label: "OpenAI", endpoint: "https://api.openai.com/v1" },
  { value: "kdense", label: "K-Dense", endpoint: "http://localhost:8000" },
  { value: "modal", label: "Modal", endpoint: "https://api.modal.com" },
  { value: "custom", label: "Custom", endpoint: "" }
];
var ApiRouterModal = class extends import_obsidian4.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.routes = [...this.plugin.settings.apiRoutes || []];
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("nlr-api-router-modal");
    contentEl.createEl("h3", { text: "API Key Routing" });
    contentEl.createEl("p", {
      text: "Map API keys to provider endpoints. Routes determine where requests are forwarded.",
      cls: "nlr-stats-muted"
    });
    this.renderRoutes(contentEl);
    this.renderAddRoute(contentEl);
    this.renderActions(contentEl);
  }
  renderRoutes(contentEl) {
    const routesContainer = contentEl.createDiv({ cls: "nlr-api-routes" });
    if (this.routes.length === 0) {
      routesContainer.createEl("p", { text: "No routes configured", cls: "nlr-stats-muted" });
      return;
    }
    const table = routesContainer.createEl("table", { cls: "nlr-stats-table" });
    const thead = table.createEl("thead");
    const headerRow = thead.createEl("tr");
    headerRow.createEl("th", { text: "Key" });
    headerRow.createEl("th", { text: "Provider" });
    headerRow.createEl("th", { text: "Endpoint" });
    headerRow.createEl("th", { text: "Status" });
    headerRow.createEl("th", { text: "" });
    const tbody = table.createEl("tbody");
    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];
      const row = tbody.createEl("tr");
      row.createEl("td", { text: route.keyName });
      row.createEl("td", { text: route.provider });
      row.createEl("td", { text: truncateUrl(route.endpoint) });
      const statusCell = row.createEl("td");
      const hasKey = !!this.plugin.settings.apiKeys[route.keyName];
      statusCell.createEl("span", {
        text: hasKey ? "\u2713 Key set" : "\u2717 No key",
        cls: hasKey ? "nlr-stats-success" : "nlr-stats-failure"
      });
      const actionCell = row.createEl("td");
      const testBtn = actionCell.createEl("button", {
        text: "Test",
        cls: "nlr-chatbot-btn nlr-chatbot-btn-small"
      });
      testBtn.addEventListener("click", () => this.testRoute(route));
      const removeBtn = actionCell.createEl("button", {
        text: "\u2717",
        cls: "nlr-chatbot-btn nlr-chatbot-btn-small"
      });
      removeBtn.addEventListener("click", () => {
        this.routes.splice(i, 1);
        this.refreshDisplay();
      });
    }
  }
  renderAddRoute(contentEl) {
    contentEl.createEl("h4", { text: "Add Route" });
    const newRoute = { keyName: "", provider: "", endpoint: "" };
    new import_obsidian4.Setting(contentEl).setName("API Key Variable").addText(
      (text) => text.setPlaceholder("OPENROUTER_API_KEY").onChange((v) => {
        newRoute.keyName = v;
      })
    );
    new import_obsidian4.Setting(contentEl).setName("Provider").addDropdown((drop) => {
      for (const p of PROVIDERS) {
        drop.addOption(p.value, p.label);
      }
      drop.onChange((v) => {
        newRoute.provider = v;
        const match = PROVIDERS.find((p) => p.value === v);
        if (match && match.endpoint) {
          newRoute.endpoint = match.endpoint;
        }
      });
    });
    new import_obsidian4.Setting(contentEl).setName("Endpoint").addText(
      (text) => text.setPlaceholder("https://api.example.com/v1").onChange((v) => {
        newRoute.endpoint = v;
      })
    );
    new import_obsidian4.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Add Route").setCta().onClick(() => {
        if (!newRoute.keyName || !newRoute.provider) {
          new import_obsidian4.Notice("Key name and provider are required");
          return;
        }
        if (!newRoute.endpoint) {
          const match = PROVIDERS.find((p) => p.value === newRoute.provider);
          newRoute.endpoint = match?.endpoint || "";
        }
        this.routes.push({ ...newRoute });
        this.refreshDisplay();
      })
    );
  }
  renderActions(contentEl) {
    const actions = contentEl.createDiv({ cls: "nlr-modal-btn-row" });
    new import_obsidian4.Setting(actions).addButton(
      (btn) => btn.setButtonText("Save Routes").setCta().onClick(async () => {
        this.plugin.settings.apiRoutes = [...this.routes];
        await this.plugin.saveSettings();
        new import_obsidian4.Notice(`Saved ${this.routes.length} routes`);
      })
    );
    new import_obsidian4.Setting(actions).addButton(
      (btn) => btn.setButtonText("Write to Config").setWarning().onClick(async () => {
        await this.writeToConfig();
      })
    );
    new import_obsidian4.Setting(actions).addButton(
      (btn) => btn.setButtonText("Load from Config").onClick(async () => {
        await this.loadFromConfig();
        this.refreshDisplay();
      })
    );
  }
  async testRoute(route) {
    const key = this.plugin.settings.apiKeys[route.keyName];
    if (!key) {
      new import_obsidian4.Notice(`No key set for ${route.keyName}`);
      return;
    }
    try {
      const headers = {
        Authorization: `Bearer ${key}`
      };
      if (route.provider === "anthropic") {
        headers["x-api-key"] = key;
        headers["anthropic-version"] = "2023-06-01";
        delete headers["Authorization"];
      }
      const testUrl = route.endpoint.replace(/\/+$/, "");
      let url = testUrl;
      if (route.provider === "openrouter")
        url = "https://openrouter.ai/api/v1/models";
      else if (route.provider === "anthropic")
        url = "https://api.anthropic.com/v1/models";
      else if (route.provider === "openai")
        url = "https://api.openai.com/v1/models";
      const response = await fetch(url, { headers });
      if (response.ok) {
        new import_obsidian4.Notice(`${route.provider}: Connected`);
      } else {
        new import_obsidian4.Notice(`${route.provider}: HTTP ${response.status}`);
      }
    } catch (e) {
      const err = e;
      new import_obsidian4.Notice(`${route.provider}: ${err.message}`);
    }
  }
  async writeToConfig() {
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) {
      new import_obsidian4.Notice("NLR Root not set");
      return;
    }
    const configPath = path4.join(nlrRoot, "config", "neuro-link-config.md");
    if (!fs4.existsSync(configPath)) {
      new import_obsidian4.Notice("neuro-link-config.md not found");
      return;
    }
    const content = fs4.readFileSync(configPath, "utf-8");
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) {
      new import_obsidian4.Notice("No frontmatter in config");
      return;
    }
    let fm = fmMatch[1];
    const routeYaml = ["api_routes:"];
    for (const route of this.routes) {
      routeYaml.push(`  - key: ${route.keyName}`);
      routeYaml.push(`    provider: ${route.provider}`);
      routeYaml.push(`    endpoint: ${route.endpoint}`);
    }
    const routeBlock = routeYaml.join("\n");
    const existingRoutes = fm.match(/api_routes:[\s\S]*?(?=\n[a-z]|\n---$|$)/);
    if (existingRoutes) {
      fm = fm.replace(existingRoutes[0], routeBlock);
    } else {
      fm += "\n" + routeBlock;
    }
    const body = content.substring(fmMatch[0].length);
    fs4.writeFileSync(configPath, `---
${fm}
---${body}`, "utf-8");
    this.plugin.settings.apiRoutes = [...this.routes];
    await this.plugin.saveSettings();
    new import_obsidian4.Notice(`Wrote ${this.routes.length} routes to config`);
  }
  async loadFromConfig() {
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) {
      new import_obsidian4.Notice("NLR Root not set");
      return;
    }
    const configPath = path4.join(nlrRoot, "config", "neuro-link-config.md");
    if (!fs4.existsSync(configPath)) {
      new import_obsidian4.Notice("neuro-link-config.md not found");
      return;
    }
    const content = fs4.readFileSync(configPath, "utf-8");
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch)
      return;
    const fm = fmMatch[1];
    const routesBlock = fm.match(/api_routes:\n([\s\S]*?)(?=\n[a-z]|\n$|$)/);
    if (!routesBlock) {
      new import_obsidian4.Notice("No api_routes found in config");
      return;
    }
    const loaded = [];
    const entries = routesBlock[1].matchAll(
      /- key:\s*(\S+)\n\s+provider:\s*(\S+)\n\s+endpoint:\s*(\S+)/g
    );
    for (const m of entries) {
      loaded.push({ keyName: m[1], provider: m[2], endpoint: m[3] });
    }
    this.routes = loaded;
    this.plugin.settings.apiRoutes = loaded;
    await this.plugin.saveSettings();
    new import_obsidian4.Notice(`Loaded ${loaded.length} routes from config`);
  }
  refreshDisplay() {
    this.contentEl.empty();
    this.onOpen();
  }
  onClose() {
    this.contentEl.empty();
  }
};
function truncateUrl(url) {
  if (url.length <= 40)
    return url;
  return url.substring(0, 37) + "...";
}

// src/chatbot.ts
var import_obsidian5 = require("obsidian");
var VIEW_TYPE_CHATBOT = "nlr-chatbot-view";
var ChatbotView = class extends import_obsidian5.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.messages = [];
    this.isStreaming = false;
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_CHATBOT;
  }
  getDisplayText() {
    return "NLR Chatbot";
  }
  getIcon() {
    return "nlr-brain";
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("nlr-chatbot-container");
    const header = container.createDiv({ cls: "nlr-chatbot-header" });
    header.createEl("h4", { text: "NLR Chatbot" });
    const headerActions = header.createDiv({ cls: "nlr-chatbot-header-actions" });
    const clearBtn = headerActions.createEl("button", {
      cls: "nlr-chatbot-btn nlr-chatbot-btn-small",
      attr: { "aria-label": "Clear chat" }
    });
    (0, import_obsidian5.setIcon)(clearBtn, "trash-2");
    clearBtn.addEventListener("click", () => {
      this.messages = [];
      this.renderMessages();
    });
    const modelInfo = header.createDiv({ cls: "nlr-chatbot-model-info" });
    modelInfo.createEl("span", {
      text: this.plugin.settings.chatbotModel.split("/").pop() || "unknown",
      cls: "nlr-chatbot-model-badge"
    });
    this.messagesEl = container.createDiv({ cls: "nlr-chatbot-messages" });
    const inputArea = container.createDiv({ cls: "nlr-chatbot-input-area" });
    this.inputEl = inputArea.createEl("textarea", {
      cls: "nlr-chatbot-input",
      attr: { placeholder: "Ask about your knowledge base...", rows: "3" }
    });
    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    const btnRow = inputArea.createDiv({ cls: "nlr-chatbot-btn-row" });
    const sendBtn = btnRow.createEl("button", {
      text: "Send",
      cls: "nlr-chatbot-btn nlr-chatbot-btn-primary"
    });
    sendBtn.addEventListener("click", () => this.sendMessage());
    const wikiBtn = btnRow.createEl("button", {
      text: "Save to Wiki",
      cls: "nlr-chatbot-btn"
    });
    wikiBtn.addEventListener("click", () => this.saveToWiki());
    const kdenseBtn = btnRow.createEl("button", {
      text: "Send to K-Dense",
      cls: "nlr-chatbot-btn"
    });
    kdenseBtn.addEventListener("click", () => this.dispatchToHarness("k-dense-byok"));
    const forgeBtn = btnRow.createEl("button", {
      text: "Send to ForgeCode",
      cls: "nlr-chatbot-btn"
    });
    forgeBtn.addEventListener("click", () => this.dispatchToHarness("forgecode"));
    this.renderMessages();
  }
  async onClose() {
  }
  renderMessages() {
    this.messagesEl.empty();
    if (this.messages.length === 0) {
      this.messagesEl.createDiv({ cls: "nlr-chatbot-empty" }).createEl("p", {
        text: "Ask questions about your neuro-link knowledge base. Wiki context is automatically injected via RAG."
      });
      return;
    }
    for (const msg of this.messages) {
      const msgEl = this.messagesEl.createDiv({
        cls: `nlr-chatbot-message nlr-chatbot-message-${msg.role}`
      });
      const roleEl = msgEl.createDiv({ cls: "nlr-chatbot-message-role" });
      roleEl.createEl("span", {
        text: msg.role === "user" ? "You" : "Assistant",
        cls: "nlr-chatbot-role-label"
      });
      roleEl.createEl("span", {
        text: new Date(msg.timestamp).toLocaleTimeString(),
        cls: "nlr-chatbot-timestamp"
      });
      msgEl.createDiv({ cls: "nlr-chatbot-message-content", text: msg.content });
      if (msg.contextPages && msg.contextPages.length > 0) {
        const ctxEl = msgEl.createDiv({ cls: "nlr-chatbot-context" });
        ctxEl.createEl("span", { text: "Context: ", cls: "nlr-chatbot-context-label" });
        for (const page of msg.contextPages) {
          const link = ctxEl.createEl("a", {
            text: page,
            cls: "nlr-chatbot-context-link",
            href: "#"
          });
          link.addEventListener("click", (e) => {
            e.preventDefault();
            this.app.workspace.openLinkText(page, "", false);
          });
        }
      }
    }
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }
  async sendMessage() {
    const content = this.inputEl.value.trim();
    if (!content || this.isStreaming)
      return;
    this.inputEl.value = "";
    this.isStreaming = true;
    this.messages.push({
      role: "user",
      content,
      timestamp: Date.now()
    });
    this.renderMessages();
    let contextPages = [];
    let ragContext = "";
    try {
      const ragResult = await this.plugin.runNlrCommand(["rag-query", content]);
      if (ragResult) {
        ragContext = ragResult;
        const pageMatches = ragResult.matchAll(/\[\[([^\]]+)\]\]/g);
        for (const m of pageMatches) {
          contextPages.push(m[1]);
        }
        if (contextPages.length === 0) {
          const fileMatches = ragResult.matchAll(/(?:^|\n)(?:source|file|page):\s*(.+)/gi);
          for (const m of fileMatches) {
            contextPages.push(m[1].trim());
          }
        }
      }
    } catch {
    }
    const apiKey = this.plugin.settings.apiKeys["OPENROUTER_API_KEY"];
    if (!apiKey) {
      this.messages.push({
        role: "assistant",
        content: "OpenRouter API key not configured. Set it in Settings > Neuro-Link Recursive > API Keys.",
        timestamp: Date.now()
      });
      this.isStreaming = false;
      this.renderMessages();
      return;
    }
    const systemMessage = this.plugin.settings.chatbotSystemPrompt;
    const contextBlock = ragContext ? `

--- Wiki Context ---
${ragContext}
--- End Context ---` : "";
    const apiMessages = [
      { role: "system", content: systemMessage + contextBlock },
      ...this.messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: m.content }))
    ];
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/HyperFrequency",
          "X-Title": "NLR Obsidian Plugin"
        },
        body: JSON.stringify({
          model: this.plugin.settings.chatbotModel,
          messages: apiMessages,
          max_tokens: 4096
        })
      });
      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 401 || errText.includes("not found")) {
          throw new Error(`OpenRouter auth failed (${response.status}). Check your API key at openrouter.ai/settings/keys \u2014 current key starts with: ${apiKey.substring(0, 8)}...`);
        }
        throw new Error(`OpenRouter ${response.status}: ${errText}`);
      }
      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || "No response received";
      this.messages.push({
        role: "assistant",
        content: assistantContent,
        contextPages,
        timestamp: Date.now()
      });
    } catch (e) {
      const err = e;
      this.messages.push({
        role: "assistant",
        content: `Error: ${err.message}`,
        timestamp: Date.now()
      });
    }
    this.isStreaming = false;
    this.renderMessages();
  }
  async saveToWiki() {
    if (this.messages.length === 0) {
      new import_obsidian5.Notice("No messages to save");
      return;
    }
    const lastAssistant = [...this.messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) {
      new import_obsidian5.Notice("No assistant response to save");
      return;
    }
    const lastUser = [...this.messages].reverse().find((m) => m.role === "user");
    const title = lastUser ? lastUser.content.substring(0, 60).replace(/[^a-zA-Z0-9\s-]/g, "").trim() : "chatbot-note";
    const slug = title.replace(/\s+/g, "-").toLowerCase();
    const now = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const frontmatter = [
      "---",
      `title: "${title}"`,
      "domain: chatbot",
      `sources: [chatbot-${now}]`,
      "confidence: 0.6",
      `last_updated: "${now}"`,
      "open_questions: []",
      "---"
    ].join("\n");
    const content = `${frontmatter}

# ${title}

${lastAssistant.content}

## Sources

- Generated by NLR Chatbot on ${now}
`;
    try {
      const file = await this.app.vault.create(`02-KB-main/${slug}.md`, content);
      new import_obsidian5.Notice(`Wiki page created: ${file.path}`);
      this.app.workspace.openLinkText(file.path, "", false);
    } catch (e) {
      const err = e;
      if (err.message.includes("already exists")) {
        new import_obsidian5.Notice("A wiki page with this name already exists");
      } else {
        new import_obsidian5.Notice(`Failed to create wiki page: ${err.message}`);
      }
    }
  }
  async dispatchToHarness(harnessName) {
    if (this.messages.length === 0) {
      new import_obsidian5.Notice("No messages to dispatch");
      return;
    }
    const lastUser = [...this.messages].reverse().find((m) => m.role === "user");
    if (!lastUser) {
      new import_obsidian5.Notice("No user message to dispatch");
      return;
    }
    try {
      const result = await this.plugin.runNlrCommand([
        "harness-dispatch",
        "--to",
        harnessName,
        "--task",
        lastUser.content
      ]);
      new import_obsidian5.Notice(`Dispatched to ${harnessName}`);
      this.messages.push({
        role: "system",
        content: `Dispatched to ${harnessName}: ${result}`,
        timestamp: Date.now()
      });
      this.renderMessages();
    } catch (e) {
      const err = e;
      new import_obsidian5.Notice(`Dispatch failed: ${err.message}`);
    }
  }
};

// src/stats.ts
var import_obsidian6 = require("obsidian");
var fs5 = __toESM(require("fs"));
var path5 = __toESM(require("path"));
var VIEW_TYPE_STATS = "nlr-stats-view";
var StatsView = class extends import_obsidian6.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_STATS;
  }
  getDisplayText() {
    return "NLR Stats";
  }
  getIcon() {
    return "nlr-chart";
  }
  async onOpen() {
    await this.render();
  }
  async onClose() {
  }
  async render() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("nlr-stats-container");
    const header = container.createDiv({ cls: "nlr-stats-header" });
    header.createEl("h4", { text: "NLR Dashboard" });
    const refreshBtn = header.createEl("button", {
      cls: "nlr-chatbot-btn nlr-chatbot-btn-small",
      attr: { "aria-label": "Refresh" }
    });
    (0, import_obsidian6.setIcon)(refreshBtn, "refresh-cw");
    refreshBtn.addEventListener("click", () => this.render());
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) {
      container.createEl("p", {
        text: "NLR Root path not configured. Set it in Settings.",
        cls: "nlr-error"
      });
      return;
    }
    const heartbeat = this.readHeartbeat(nlrRoot);
    const sessionLog = this.readJsonl(path5.join(nlrRoot, "state", "session_log.jsonl"));
    const scoreHistory = this.readJsonl(path5.join(nlrRoot, "state", "score_history.jsonl"));
    const wikiPages = this.countFiles(path5.join(nlrRoot, "02-KB-main"), ".md");
    const pendingTasks = this.countPendingTasks(nlrRoot);
    const gapCount = this.countFiles(path5.join(nlrRoot, "05-insights-gaps"), ".md");
    this.renderHealthCard(container, heartbeat);
    this.renderSummaryCards(container, wikiPages, pendingTasks, gapCount, sessionLog, scoreHistory);
    this.renderToolUsageChart(container, sessionLog);
    this.renderScoreTrend(container, scoreHistory);
    this.renderRecentActivity(container, sessionLog);
  }
  renderHealthCard(container, heartbeat) {
    const card = container.createDiv({ cls: "nlr-stats-card" });
    card.createEl("h5", { text: "System Health" });
    if (!heartbeat) {
      card.createEl("p", { text: "No heartbeat data", cls: "nlr-stats-muted" });
      return;
    }
    const statusEl = card.createDiv({ cls: "nlr-stats-health-row" });
    const statusDot = statusEl.createEl("span", {
      cls: `nlr-stats-dot nlr-stats-dot-${heartbeat.status === "initialized" || heartbeat.status === "healthy" ? "green" : "red"}`
    });
    statusDot.textContent = "\u25CF";
    statusEl.createEl("span", { text: ` Status: ${heartbeat.status}` });
    card.createEl("p", {
      text: `Last check: ${new Date(heartbeat.last_check).toLocaleString()}`,
      cls: "nlr-stats-muted"
    });
    if (heartbeat.errors.length > 0) {
      const errList = card.createEl("ul", { cls: "nlr-stats-error-list" });
      for (const err of heartbeat.errors) {
        errList.createEl("li", { text: err, cls: "nlr-error" });
      }
    }
  }
  renderSummaryCards(container, wikiPages, pendingTasks, gapCount, sessionLog, scoreHistory) {
    const grid = container.createDiv({ cls: "nlr-stats-grid" });
    this.createMetricCard(grid, "Wiki Pages", String(wikiPages), "file-text");
    this.createMetricCard(grid, "Pending Tasks", String(pendingTasks), "list-todo");
    this.createMetricCard(grid, "Knowledge Gaps", String(gapCount), "alert-triangle");
    const successCount = sessionLog.filter((e) => e.success === true).length;
    const totalWithStatus = sessionLog.filter((e) => e.success !== void 0).length;
    const rate = totalWithStatus > 0 ? Math.round(successCount / totalWithStatus * 100) : 0;
    this.createMetricCard(grid, "Success Rate", `${rate}%`, "check-circle");
    const avgScore = scoreHistory.length > 0 ? (scoreHistory.reduce((sum, e) => sum + e.score, 0) / scoreHistory.length).toFixed(1) : "N/A";
    this.createMetricCard(grid, "Avg Score", avgScore, "star");
    this.createMetricCard(grid, "Sessions", String(scoreHistory.length), "activity");
  }
  createMetricCard(parent, label, value, icon) {
    const card = parent.createDiv({ cls: "nlr-stats-metric" });
    const iconEl = card.createDiv({ cls: "nlr-stats-metric-icon" });
    (0, import_obsidian6.setIcon)(iconEl, icon);
    card.createEl("div", { text: value, cls: "nlr-stats-metric-value" });
    card.createEl("div", { text: label, cls: "nlr-stats-metric-label" });
  }
  renderToolUsageChart(container, sessionLog) {
    const card = container.createDiv({ cls: "nlr-stats-card" });
    card.createEl("h5", { text: "Tool Usage" });
    if (sessionLog.length === 0) {
      card.createEl("p", { text: "No session data", cls: "nlr-stats-muted" });
      return;
    }
    const toolCounts = {};
    for (const entry of sessionLog) {
      if (entry.tool) {
        toolCounts[entry.tool] = (toolCounts[entry.tool] || 0) + 1;
      }
    }
    const sorted = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
    if (sorted.length === 0) {
      card.createEl("p", { text: "No tool usage data", cls: "nlr-stats-muted" });
      return;
    }
    const maxCount = sorted[0][1];
    const chartEl = card.createDiv({ cls: "nlr-stats-bar-chart" });
    for (const [tool, count] of sorted) {
      const row = chartEl.createDiv({ cls: "nlr-stats-bar-row" });
      row.createDiv({ cls: "nlr-stats-bar-label", text: tool });
      const barContainer = row.createDiv({ cls: "nlr-stats-bar-container" });
      const bar = barContainer.createDiv({ cls: "nlr-stats-bar" });
      const pct = maxCount > 0 ? count / maxCount * 100 : 0;
      bar.style.width = `${pct}%`;
      row.createDiv({ cls: "nlr-stats-bar-value", text: String(count) });
    }
  }
  renderScoreTrend(container, scoreHistory) {
    const card = container.createDiv({ cls: "nlr-stats-card" });
    card.createEl("h5", { text: "Score Trend" });
    if (scoreHistory.length < 2) {
      card.createEl("p", { text: "Need at least 2 sessions for trend", cls: "nlr-stats-muted" });
      return;
    }
    const recent = scoreHistory.slice(-20);
    const canvas = card.createEl("canvas", {
      cls: "nlr-stats-canvas",
      attr: { width: "400", height: "150" }
    });
    const ctx = canvas.getContext("2d");
    if (!ctx)
      return;
    const scores = recent.map((e) => e.score);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const range = maxScore - minScore || 1;
    const w = canvas.width;
    const h = canvas.height;
    const padding = 20;
    const plotW = w - padding * 2;
    const plotH = h - padding * 2;
    ctx.strokeStyle = "var(--text-muted, #888)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();
    ctx.strokeStyle = "var(--interactive-accent, #7b68ee)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < scores.length; i++) {
      const x = padding + i / (scores.length - 1) * plotW;
      const y = h - padding - (scores[i] - minScore) / range * plotH;
      if (i === 0)
        ctx.moveTo(x, y);
      else
        ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (let i = 0; i < scores.length; i++) {
      const x = padding + i / (scores.length - 1) * plotW;
      const y = h - padding - (scores[i] - minScore) / range * plotH;
      ctx.fillStyle = "var(--interactive-accent, #7b68ee)";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "var(--text-muted, #888)";
    ctx.font = "10px sans-serif";
    ctx.fillText(maxScore.toFixed(1), 2, padding + 4);
    ctx.fillText(minScore.toFixed(1), 2, h - padding + 4);
  }
  renderRecentActivity(container, sessionLog) {
    const card = container.createDiv({ cls: "nlr-stats-card" });
    card.createEl("h5", { text: "Recent Activity" });
    const recent = sessionLog.slice(-10).reverse();
    if (recent.length === 0) {
      card.createEl("p", { text: "No recent activity", cls: "nlr-stats-muted" });
      return;
    }
    const table = card.createEl("table", { cls: "nlr-stats-table" });
    const thead = table.createEl("thead");
    const headerRow = thead.createEl("tr");
    headerRow.createEl("th", { text: "Tool" });
    headerRow.createEl("th", { text: "Time" });
    headerRow.createEl("th", { text: "Duration" });
    headerRow.createEl("th", { text: "Status" });
    const tbody = table.createEl("tbody");
    for (const entry of recent) {
      const row = tbody.createEl("tr");
      row.createEl("td", { text: entry.tool || "unknown" });
      row.createEl("td", {
        text: entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : "-"
      });
      row.createEl("td", {
        text: entry.duration_ms !== void 0 ? `${entry.duration_ms}ms` : "-"
      });
      const statusCell = row.createEl("td");
      if (entry.success === true) {
        statusCell.createEl("span", { text: "\u2713", cls: "nlr-stats-success" });
      } else if (entry.success === false) {
        statusCell.createEl("span", { text: "\u2717", cls: "nlr-stats-failure" });
      } else {
        statusCell.createEl("span", { text: "-" });
      }
    }
  }
  readHeartbeat(nlrRoot) {
    const filePath = path5.join(nlrRoot, "state", "heartbeat.json");
    try {
      const content = fs5.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  readJsonl(filePath) {
    try {
      const content = fs5.readFileSync(filePath, "utf-8");
      return content.split("\n").filter((line) => line.trim()).map((line) => JSON.parse(line));
    } catch {
      return [];
    }
  }
  countFiles(dirPath, extension) {
    try {
      if (!fs5.existsSync(dirPath))
        return 0;
      return fs5.readdirSync(dirPath).filter((f) => f.endsWith(extension)).length;
    } catch {
      return 0;
    }
  }
  countPendingTasks(nlrRoot) {
    const taskDir = path5.join(nlrRoot, "07-neuro-link-task");
    try {
      if (!fs5.existsSync(taskDir))
        return 0;
      const files = fs5.readdirSync(taskDir).filter((f) => f.endsWith(".md"));
      let pending = 0;
      for (const file of files) {
        try {
          const content = fs5.readFileSync(path5.join(taskDir, file), "utf-8");
          if (content.includes("status: pending")) {
            pending++;
          }
        } catch {
        }
      }
      return pending;
    } catch {
      return 0;
    }
  }
};

// src/commands.ts
function showResultModal(app, title, content) {
  const modal = new ResultModal(app, title, content);
  modal.open();
}
var ResultModal = class extends import_obsidian7.Modal {
  constructor(app, title, content) {
    super(app);
    this.title = title;
    this.content = content;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: this.title });
    const pre = contentEl.createEl("pre", { cls: "nlr-result-pre" });
    pre.createEl("code", { text: this.content });
  }
  onClose() {
    this.contentEl.empty();
  }
};
var SearchModal = class extends import_obsidian7.Modal {
  constructor(app, plugin) {
    super(app);
    this.query = "";
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "NLR Wiki Search" });
    new import_obsidian7.Setting(contentEl).setName("Query").addText((text) => {
      text.setPlaceholder("Search the wiki...").onChange((value) => {
        this.query = value;
      });
      text.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.doSearch();
        }
      });
      setTimeout(() => text.inputEl.focus(), 50);
    });
    new import_obsidian7.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Search").setCta().onClick(() => this.doSearch())
    );
    contentEl.createEl("div", { cls: "nlr-search-results", attr: { id: "nlr-search-results" } });
  }
  async doSearch() {
    if (!this.query.trim())
      return;
    const resultsEl = this.contentEl.querySelector("#nlr-search-results");
    if (!resultsEl)
      return;
    resultsEl.empty();
    resultsEl.createEl("p", { text: "Searching..." });
    try {
      const result = await this.plugin.runNlrCommand(["search", this.query]);
      resultsEl.empty();
      const pre = resultsEl.createEl("pre", { cls: "nlr-result-pre" });
      pre.createEl("code", { text: result || "No results found" });
    } catch (e) {
      const err = e;
      resultsEl.empty();
      resultsEl.createEl("p", { text: `Error: ${err.message}`, cls: "nlr-error" });
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};
var CreateTaskModal = class extends import_obsidian7.Modal {
  constructor(app, plugin) {
    super(app);
    this.taskType = "curate";
    this.taskPriority = "3";
    this.taskDescription = "";
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Create NLR Task" });
    new import_obsidian7.Setting(contentEl).setName("Type").addDropdown(
      (drop) => drop.addOption("ingest", "Ingest").addOption("curate", "Curate").addOption("scan", "Scan").addOption("repair", "Repair").addOption("report", "Report").addOption("ontology", "Ontology").setValue(this.taskType).onChange((v) => {
        this.taskType = v;
      })
    );
    new import_obsidian7.Setting(contentEl).setName("Priority").setDesc("1 (highest) to 5 (lowest)").addDropdown(
      (drop) => drop.addOption("1", "1 - Critical").addOption("2", "2 - High").addOption("3", "3 - Normal").addOption("4", "4 - Low").addOption("5", "5 - Background").setValue(this.taskPriority).onChange((v) => {
        this.taskPriority = v;
      })
    );
    new import_obsidian7.Setting(contentEl).setName("Description").addTextArea(
      (text) => text.setPlaceholder("Describe the task...").onChange((v) => {
        this.taskDescription = v;
      })
    );
    new import_obsidian7.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Create").setCta().onClick(async () => {
        await this.createTask();
      })
    );
  }
  async createTask() {
    if (!this.taskDescription.trim()) {
      new import_obsidian7.Notice("Task description required");
      return;
    }
    try {
      const result = await this.plugin.runNlrCommand([
        "tasks",
        "create",
        "--type",
        this.taskType,
        "--priority",
        this.taskPriority,
        "--desc",
        this.taskDescription
      ]);
      new import_obsidian7.Notice("Task created");
      showResultModal(this.app, "Task Created", result);
      this.close();
    } catch (e) {
      const err = e;
      new import_obsidian7.Notice(`Failed: ${err.message}`);
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};
function registerCommands(plugin) {
  plugin.addCommand({
    id: "nlr-check-status",
    name: "Neuro-Link: Check Status",
    callback: async () => {
      try {
        const result = await plugin.runNlrCommand(["status"]);
        showResultModal(plugin.app, "NLR Status", result);
      } catch (e) {
        const err = e;
        new import_obsidian7.Notice(`NLR status failed: ${err.message}`);
      }
    }
  });
  plugin.addCommand({
    id: "nlr-run-brain-scan",
    name: "Neuro-Link: Run Brain Scan",
    callback: async () => {
      new import_obsidian7.Notice("Running brain scan...");
      try {
        const result = await plugin.runNlrCommand(["scan"]);
        showResultModal(plugin.app, "Brain Scan Results", result);
      } catch (e) {
        const err = e;
        new import_obsidian7.Notice(`Brain scan failed: ${err.message}`);
      }
    }
  });
  plugin.addCommand({
    id: "nlr-ingest-current-note",
    name: "Neuro-Link: Ingest Current Note",
    callback: async () => {
      const activeFile = plugin.app.workspace.getActiveFile();
      if (!activeFile) {
        new import_obsidian7.Notice("No active file");
        return;
      }
      const filePath = activeFile.path;
      new import_obsidian7.Notice(`Ingesting ${filePath}...`);
      try {
        const vaultPath = plugin.settings.vaultPath;
        const fullPath = vaultPath ? `${vaultPath}/${filePath}` : filePath;
        const result = await plugin.runNlrCommand(["ingest", fullPath]);
        new import_obsidian7.Notice("Ingestion complete");
        showResultModal(plugin.app, "Ingest Result", result);
      } catch (e) {
        const err = e;
        new import_obsidian7.Notice(`Ingest failed: ${err.message}`);
      }
    }
  });
  plugin.addCommand({
    id: "nlr-search-wiki",
    name: "Neuro-Link: Search Wiki",
    callback: () => {
      new SearchModal(plugin.app, plugin).open();
    }
  });
  plugin.addCommand({
    id: "nlr-list-tasks",
    name: "Neuro-Link: List Tasks",
    callback: async () => {
      try {
        const result = await plugin.runNlrCommand(["tasks"]);
        showResultModal(plugin.app, "NLR Tasks", result);
      } catch (e) {
        const err = e;
        new import_obsidian7.Notice(`List tasks failed: ${err.message}`);
      }
    }
  });
  plugin.addCommand({
    id: "nlr-create-task",
    name: "Neuro-Link: Create Task",
    callback: () => {
      new CreateTaskModal(plugin.app, plugin).open();
    }
  });
  plugin.addCommand({
    id: "nlr-run-heartbeat",
    name: "Neuro-Link: Run Heartbeat",
    callback: async () => {
      try {
        const result = await plugin.runNlrCommand(["heartbeat"]);
        new import_obsidian7.Notice("Heartbeat sent");
        showResultModal(plugin.app, "Heartbeat", result);
      } catch (e) {
        const err = e;
        new import_obsidian7.Notice(`Heartbeat failed: ${err.message}`);
      }
    }
  });
  plugin.addCommand({
    id: "nlr-start-server-tunnel",
    name: "Neuro-Link: Start Server with Tunnel",
    callback: async () => {
      new import_obsidian7.Notice("Starting server with tunnel...");
      try {
        const result = await plugin.runNlrCommand(["serve", "--tunnel", "--token", "auto"]);
        showResultModal(plugin.app, "Server + Tunnel", result);
      } catch (e) {
        const err = e;
        new import_obsidian7.Notice(`Server start failed: ${err.message}`);
      }
    }
  });
  plugin.addCommand({
    id: "nlr-rebuild-rag-index",
    name: "Neuro-Link: Rebuild RAG Index",
    callback: async () => {
      new import_obsidian7.Notice("Rebuilding RAG index...");
      try {
        const result = await plugin.runNlrCommand(["rag-rebuild"]);
        new import_obsidian7.Notice("RAG index rebuilt");
        showResultModal(plugin.app, "RAG Rebuild", result);
      } catch (e) {
        const err = e;
        new import_obsidian7.Notice(`RAG rebuild failed: ${err.message}`);
      }
    }
  });
  plugin.addCommand({
    id: "nlr-grade-session",
    name: "Neuro-Link: Grade Session",
    callback: async () => {
      new import_obsidian7.Notice("Grading session...");
      try {
        const result = await plugin.runNlrCommand(["grade", "--session"]);
        showResultModal(plugin.app, "Session Grade", result);
      } catch (e) {
        const err = e;
        new import_obsidian7.Notice(`Grading failed: ${err.message}`);
      }
    }
  });
  plugin.addCommand({
    id: "nlr-open-harness-setup",
    name: "Neuro-Link: Open Harness Setup",
    callback: () => {
      new HarnessSetupModal(plugin.app, plugin).open();
    }
  });
  plugin.addCommand({
    id: "nlr-open-mcp-setup",
    name: "Neuro-Link: Open MCP Setup",
    callback: () => {
      new McpSetupModal(plugin.app, plugin).open();
    }
  });
  plugin.addCommand({
    id: "nlr-open-api-router",
    name: "Neuro-Link: Open API Router",
    callback: () => {
      new ApiRouterModal(plugin.app, plugin).open();
    }
  });
  plugin.addCommand({
    id: "nlr-open-chatbot",
    name: "Neuro-Link: Open Chatbot",
    callback: () => {
      plugin.activateView(VIEW_TYPE_CHATBOT);
    }
  });
  plugin.addCommand({
    id: "nlr-open-stats",
    name: "Neuro-Link: Open Stats",
    callback: () => {
      plugin.activateView(VIEW_TYPE_STATS);
    }
  });
  plugin.addCommand({
    id: "nlr-sessions-parse",
    name: "Neuro-Link: Parse Claude Code Sessions",
    callback: async () => {
      new import_obsidian7.Notice("Parsing Claude Code sessions...");
      try {
        const result = await plugin.runNlrCommand(["sessions", "parse"]);
        showResultModal(plugin.app, "Session Parse", result);
      } catch (e) {
        const err = e;
        new import_obsidian7.Notice(`Parse failed: ${err.message}`);
      }
    }
  });
  plugin.addCommand({
    id: "nlr-sessions-scan",
    name: "Neuro-Link: Scan Session Quality",
    callback: async () => {
      new import_obsidian7.Notice("Scanning session quality...");
      try {
        const result = await plugin.runNlrCommand(["sessions", "scan", "--days", "7"]);
        showResultModal(plugin.app, "Session Quality Scan", result);
      } catch (e) {
        const err = e;
        new import_obsidian7.Notice(`Scan failed: ${err.message}`);
      }
    }
  });
}

// src/main.ts
var import_child_process2 = require("child_process");
var import_util2 = require("util");
var path6 = __toESM(require("path"));
var fs6 = __toESM(require("fs"));
var execFileAsync2 = (0, import_util2.promisify)(import_child_process2.execFile);
var BRAIN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/><path d="M9 21h6"/><path d="M10 17v4"/><path d="M14 17v4"/><path d="M8 14c-1.5-1-2.5-2.7-2.5-5"/><path d="M16 14c1.5-1 2.5-2.7 2.5-5"/></svg>`;
var CHART_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/><line x1="3" y1="21" x2="21" y2="21"/></svg>`;
var NLRPlugin = class extends import_obsidian8.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.serverProcess = null;
  }
  async onload() {
    await this.loadSettings();
    (0, import_obsidian8.addIcon)("nlr-brain", BRAIN_ICON);
    (0, import_obsidian8.addIcon)("nlr-chart", CHART_ICON);
    this.registerView(VIEW_TYPE_CHATBOT, (leaf) => new ChatbotView(leaf, this));
    this.registerView(VIEW_TYPE_STATS, (leaf) => new StatsView(leaf, this));
    this.addSettingTab(new NLRSettingTab(this.app, this));
    this.addRibbonIcon("nlr-brain", "Neuro-Link Chatbot", () => {
      this.activateView(VIEW_TYPE_CHATBOT);
    });
    this.addRibbonIcon("nlr-chart", "Neuro-Link Stats", () => {
      this.activateView(VIEW_TYPE_STATS);
    });
    registerCommands(this);
    await this.scaffoldVaultStructure();
    await this.checkNlrBinary();
    await this.startServer();
  }
  onunload() {
    this.stopServer();
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_CHATBOT);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_STATS);
  }
  async scaffoldVaultStructure() {
    const vault = this.app.vault;
    const DIRS = [
      "00-raw",
      "01-sorted",
      "01-sorted/books",
      "01-sorted/medium",
      "01-sorted/arxiv",
      "01-sorted/huggingface",
      "01-sorted/github",
      "01-sorted/docs",
      "02-KB-main",
      "03-ontology-main",
      "03-ontology-main/workflow",
      "03-ontology-main/agents",
      "03-ontology-main/agents/by-agent",
      "03-ontology-main/agents/by-workflow-state",
      "03-ontology-main/agents/by-auto-HITL",
      "04-KB-agents-workflows",
      "05-insights-gaps",
      "05-insights-gaps/knowledge",
      "05-insights-gaps/ontology",
      "05-insights-gaps/goals",
      "05-self-improvement-HITL",
      "05-self-improvement-HITL/models",
      "05-self-improvement-HITL/hyperparameters",
      "05-self-improvement-HITL/prompts",
      "05-self-improvement-HITL/features",
      "05-self-improvement-HITL/code-changes",
      "05-self-improvement-HITL/services-integrations",
      "06-self-improvement-recursive",
      "06-self-improvement-recursive/harness-to-harness-comms",
      "06-self-improvement-recursive/harness-cli",
      "06-self-improvement-recursive/brain",
      "06-progress-reports",
      "07-neuro-link-task",
      "08-code-docs",
      "08-code-docs/my-repos",
      "08-code-docs/common-tools",
      "08-code-docs/my-forks",
      "09-business-docs",
      "config",
      "state"
    ];
    const marker = vault.getAbstractFileByPath("02-KB-main");
    if (marker)
      return;
    for (const dir of DIRS) {
      try {
        await vault.createFolder(dir);
      } catch {
      }
    }
    const seeds = [
      {
        path: "02-KB-main/schema.md",
        content: "---\ntitle: Wiki Schema\n---\n# Wiki Page Conventions\n\nEvery page has YAML frontmatter: `title`, `domain`, `sources[]`, `confidence`, `last_updated`, `open_questions[]`\n\nSections: Overview > Conceptual Model > Details > Contradictions > Open Questions > Sources\n"
      },
      {
        path: "02-KB-main/index.md",
        content: "# Wiki Index\n\n*Auto-generated. Do not edit manually.*\n"
      },
      {
        path: "02-KB-main/log.md",
        content: "# Mutation Log\n\n*Append-only record of wiki changes.*\n"
      },
      {
        path: "03-ontology-main/workflow/state-definitions.md",
        content: "---\ntitle: Workflow State Definitions\n---\n# States\n\nsignal \u2192 impression \u2192 insight \u2192 framework \u2192 lens \u2192 synthesis \u2192 index\n"
      },
      {
        path: "03-ontology-main/workflow/phase-gating.md",
        content: "---\ntitle: Phase Gating\n---\n# Phase Gate Requirements\n\nDefine what must be true before transitioning between states.\n"
      },
      {
        path: "03-ontology-main/workflow/goal-hierarchical.md",
        content: "---\ntitle: Goal Hierarchy\n---\n# Goals\n\nDefine your domain goals from broad to specific.\n"
      },
      {
        path: "06-progress-reports/daily.md",
        content: "# Daily Report\n\n*Auto-generated by progress-report skill.*\n"
      },
      {
        path: "config/neuro-link.md",
        content: "---\nversion: 1\nauto_rag: true\nauto_curate: true\ndefault_llm: claude-sonnet-4-6\nwiki_llm: claude-sonnet-4-6\nontology_llm: claude-opus-4-6\nembedding_model: Octen/Octen-Embedding-8B\nembedding_dims: 4096\nvector_db: qdrant\nallowed_paths: all\n---\n# Neuro-Link Master Config\n\nEdit the YAML frontmatter above to configure the system.\n"
      },
      {
        path: "state/heartbeat.json",
        content: '{"status":"initialized","last_check":"' + (/* @__PURE__ */ new Date()).toISOString() + '","errors":[]}'
      }
    ];
    for (const seed of seeds) {
      const exists = vault.getAbstractFileByPath(seed.path);
      if (!exists) {
        try {
          await vault.create(seed.path, seed.content);
        } catch {
        }
      }
    }
    new import_obsidian8.Notice("Neuro-Link: vault structure created with default folders and config");
  }
  async startServer() {
    const binPath = this.resolveBinaryPath();
    const port = this.settings.apiRouterPort || 8080;
    const env = { ...process.env };
    if (this.settings.nlrRoot) {
      env["NLR_ROOT"] = this.settings.nlrRoot;
    }
    const secretsPath = this.settings.nlrRoot ? path6.join(this.settings.nlrRoot, "secrets", ".env") : "";
    let token = "";
    if (secretsPath && fs6.existsSync(secretsPath)) {
      const content = fs6.readFileSync(secretsPath, "utf-8");
      const match = content.match(/NLR_API_TOKEN=(.+)/);
      if (match)
        token = match[1].trim();
    }
    const args = ["serve", "--port", String(port)];
    if (token) {
      args.push("--token", token);
    } else {
      args.push("--token", "auto");
    }
    try {
      this.serverProcess = (0, import_child_process2.spawn)(binPath, args, {
        env,
        cwd: this.settings.nlrRoot || void 0,
        stdio: ["ignore", "pipe", "pipe"]
      });
      this.serverProcess.on("error", () => {
        this.serverProcess = null;
      });
      this.serverProcess.on("exit", () => {
        this.serverProcess = null;
      });
      await new Promise((r) => setTimeout(r, 1500));
      if (this.serverProcess) {
        try {
          const resp = await fetch(`http://localhost:${port}/health`);
          if (resp.ok) {
            new import_obsidian8.Notice(`Neuro-Link server running on port ${port}`);
          }
        } catch {
        }
      }
    } catch {
    }
  }
  stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
  }
  async loadSettings() {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    if (!this.settings.nlrRoot) {
      this.settings.nlrRoot = this.detectNlrRoot();
    }
    if (!this.settings.vaultPath) {
      this.settings.vaultPath = this.detectVaultPath();
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  detectNlrRoot() {
    const vaultPath = this.detectVaultPath();
    if (vaultPath) {
      const candidate = path6.resolve(vaultPath, "..");
      if (fs6.existsSync(path6.join(candidate, "config", "neuro-link.md"))) {
        return candidate;
      }
      if (fs6.existsSync(path6.join(vaultPath, "config", "neuro-link.md"))) {
        return vaultPath;
      }
    }
    const home = process.env.HOME || process.env.USERPROFILE || "";
    const defaultPath = path6.join(home, "Desktop", "HyperFrequency", "neuro-link-recursive");
    if (fs6.existsSync(defaultPath)) {
      return defaultPath;
    }
    return "";
  }
  detectVaultPath() {
    const adapter = this.app.vault.adapter;
    if ("getBasePath" in adapter && typeof adapter.getBasePath === "function") {
      return adapter.getBasePath();
    }
    return "";
  }
  resolveBinaryPath() {
    const configured = this.settings.nlrBinaryPath;
    if (configured && configured !== "neuro-link" && fs6.existsSync(configured)) {
      return configured;
    }
    const candidates = [
      "/usr/local/bin/neuro-link",
      path6.join(process.env.HOME || "", ".cargo/bin/neuro-link"),
      this.settings.nlrRoot ? path6.join(this.settings.nlrRoot, "server/target/release/neuro-link") : "",
      "/opt/homebrew/bin/neuro-link"
    ].filter(Boolean);
    for (const c of candidates) {
      if (fs6.existsSync(c))
        return c;
    }
    return configured || "neuro-link";
  }
  async checkNlrBinary() {
    const binPath = this.resolveBinaryPath();
    try {
      await execFileAsync2(binPath, ["--version"]);
    } catch {
      new import_obsidian8.Notice(
        `neuro-link binary not found at ${binPath}. Set the full path in Settings > Neuro-Link Recursive > NLR Binary Path.`,
        1e4
      );
    }
  }
  async runNlrCommand(args) {
    const binPath = this.resolveBinaryPath();
    const env = { ...process.env };
    if (this.settings.nlrRoot) {
      env["NLR_ROOT"] = this.settings.nlrRoot;
    }
    try {
      const { stdout, stderr } = await execFileAsync2(binPath, args, {
        cwd: this.settings.nlrRoot || void 0,
        env,
        timeout: 3e4
      });
      if (stderr && !stdout)
        return stderr;
      return stdout;
    } catch (e) {
      const err = e;
      throw new Error(err.stderr || err.message || "Unknown error");
    }
  }
  async activateView(viewType) {
    const existing = this.app.workspace.getLeavesOfType(viewType);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = this.app.workspace.getRightLeaf(false);
    await leaf.setViewState({ type: viewType, active: true });
    this.app.workspace.revealLeaf(leaf);
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9jb21tYW5kcy50cyIsICJzcmMvaGFybmVzcy1zZXR1cC50cyIsICJzcmMvbWNwLXNldHVwLnRzIiwgInNyYy9hcGktcm91dGVyLnRzIiwgInNyYy9jaGF0Ym90LnRzIiwgInNyYy9zdGF0cy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHtcbiAgUGx1Z2luLFxuICBOb3RpY2UsXG4gIFdvcmtzcGFjZUxlYWYsXG4gIGFkZEljb24sXG59IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHsgTkxSU2V0dGluZ1RhYiwgTkxSU2V0dGluZ3MsIERFRkFVTFRfU0VUVElOR1MgfSBmcm9tIFwiLi9zZXR0aW5nc1wiO1xuaW1wb3J0IHsgcmVnaXN0ZXJDb21tYW5kcyB9IGZyb20gXCIuL2NvbW1hbmRzXCI7XG5pbXBvcnQgeyBDaGF0Ym90VmlldywgVklFV19UWVBFX0NIQVRCT1QgfSBmcm9tIFwiLi9jaGF0Ym90XCI7XG5pbXBvcnQgeyBTdGF0c1ZpZXcsIFZJRVdfVFlQRV9TVEFUUyB9IGZyb20gXCIuL3N0YXRzXCI7XG5pbXBvcnQgeyBleGVjRmlsZSwgQ2hpbGRQcm9jZXNzLCBzcGF3biB9IGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgeyBwcm9taXNpZnkgfSBmcm9tIFwidXRpbFwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5cbmNvbnN0IGV4ZWNGaWxlQXN5bmMgPSBwcm9taXNpZnkoZXhlY0ZpbGUpO1xuXG5jb25zdCBCUkFJTl9JQ09OID0gYDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjJcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTEyIDJhNyA3IDAgMCAwLTcgN2MwIDIuMzggMS4xOSA0LjQ3IDMgNS43NFYxN2EyIDIgMCAwIDAgMiAyaDRhMiAyIDAgMCAwIDItMnYtMi4yNmMxLjgxLTEuMjcgMy0zLjM2IDMtNS43NGE3IDcgMCAwIDAtNy03elwiLz48cGF0aCBkPVwiTTkgMjFoNlwiLz48cGF0aCBkPVwiTTEwIDE3djRcIi8+PHBhdGggZD1cIk0xNCAxN3Y0XCIvPjxwYXRoIGQ9XCJNOCAxNGMtMS41LTEtMi41LTIuNy0yLjUtNVwiLz48cGF0aCBkPVwiTTE2IDE0YzEuNS0xIDIuNS0yLjcgMi41LTVcIi8+PC9zdmc+YDtcblxuY29uc3QgQ0hBUlRfSUNPTiA9IGA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHJlY3QgeD1cIjNcIiB5PVwiMTJcIiB3aWR0aD1cIjRcIiBoZWlnaHQ9XCI5XCIvPjxyZWN0IHg9XCIxMFwiIHk9XCI3XCIgd2lkdGg9XCI0XCIgaGVpZ2h0PVwiMTRcIi8+PHJlY3QgeD1cIjE3XCIgeT1cIjNcIiB3aWR0aD1cIjRcIiBoZWlnaHQ9XCIxOFwiLz48bGluZSB4MT1cIjNcIiB5MT1cIjIxXCIgeDI9XCIyMVwiIHkyPVwiMjFcIi8+PC9zdmc+YDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTkxSUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3M6IE5MUlNldHRpbmdzID0gREVGQVVMVF9TRVRUSU5HUztcbiAgcHJpdmF0ZSBzZXJ2ZXJQcm9jZXNzOiBDaGlsZFByb2Nlc3MgfCBudWxsID0gbnVsbDtcblxuICBhc3luYyBvbmxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblxuICAgIGFkZEljb24oXCJubHItYnJhaW5cIiwgQlJBSU5fSUNPTik7XG4gICAgYWRkSWNvbihcIm5sci1jaGFydFwiLCBDSEFSVF9JQ09OKTtcblxuICAgIHRoaXMucmVnaXN0ZXJWaWV3KFZJRVdfVFlQRV9DSEFUQk9ULCAobGVhZikgPT4gbmV3IENoYXRib3RWaWV3KGxlYWYsIHRoaXMpKTtcbiAgICB0aGlzLnJlZ2lzdGVyVmlldyhWSUVXX1RZUEVfU1RBVFMsIChsZWFmKSA9PiBuZXcgU3RhdHNWaWV3KGxlYWYsIHRoaXMpKTtcblxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgTkxSU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuXG4gICAgdGhpcy5hZGRSaWJib25JY29uKFwibmxyLWJyYWluXCIsIFwiTmV1cm8tTGluayBDaGF0Ym90XCIsICgpID0+IHtcbiAgICAgIHRoaXMuYWN0aXZhdGVWaWV3KFZJRVdfVFlQRV9DSEFUQk9UKTtcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkUmliYm9uSWNvbihcIm5sci1jaGFydFwiLCBcIk5ldXJvLUxpbmsgU3RhdHNcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5hY3RpdmF0ZVZpZXcoVklFV19UWVBFX1NUQVRTKTtcbiAgICB9KTtcblxuICAgIHJlZ2lzdGVyQ29tbWFuZHModGhpcyk7XG5cbiAgICBhd2FpdCB0aGlzLnNjYWZmb2xkVmF1bHRTdHJ1Y3R1cmUoKTtcbiAgICBhd2FpdCB0aGlzLmNoZWNrTmxyQmluYXJ5KCk7XG4gICAgYXdhaXQgdGhpcy5zdGFydFNlcnZlcigpO1xuICB9XG5cbiAgb251bmxvYWQoKTogdm9pZCB7XG4gICAgdGhpcy5zdG9wU2VydmVyKCk7XG4gICAgdGhpcy5hcHAud29ya3NwYWNlLmRldGFjaExlYXZlc09mVHlwZShWSUVXX1RZUEVfQ0hBVEJPVCk7XG4gICAgdGhpcy5hcHAud29ya3NwYWNlLmRldGFjaExlYXZlc09mVHlwZShWSUVXX1RZUEVfU1RBVFMpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzY2FmZm9sZFZhdWx0U3RydWN0dXJlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHZhdWx0ID0gdGhpcy5hcHAudmF1bHQ7XG4gICAgY29uc3QgRElSUyA9IFtcbiAgICAgIFwiMDAtcmF3XCIsXG4gICAgICBcIjAxLXNvcnRlZFwiLCBcIjAxLXNvcnRlZC9ib29rc1wiLCBcIjAxLXNvcnRlZC9tZWRpdW1cIiwgXCIwMS1zb3J0ZWQvYXJ4aXZcIixcbiAgICAgIFwiMDEtc29ydGVkL2h1Z2dpbmdmYWNlXCIsIFwiMDEtc29ydGVkL2dpdGh1YlwiLCBcIjAxLXNvcnRlZC9kb2NzXCIsXG4gICAgICBcIjAyLUtCLW1haW5cIixcbiAgICAgIFwiMDMtb250b2xvZ3ktbWFpblwiLCBcIjAzLW9udG9sb2d5LW1haW4vd29ya2Zsb3dcIiwgXCIwMy1vbnRvbG9neS1tYWluL2FnZW50c1wiLFxuICAgICAgXCIwMy1vbnRvbG9neS1tYWluL2FnZW50cy9ieS1hZ2VudFwiLCBcIjAzLW9udG9sb2d5LW1haW4vYWdlbnRzL2J5LXdvcmtmbG93LXN0YXRlXCIsXG4gICAgICBcIjAzLW9udG9sb2d5LW1haW4vYWdlbnRzL2J5LWF1dG8tSElUTFwiLFxuICAgICAgXCIwNC1LQi1hZ2VudHMtd29ya2Zsb3dzXCIsXG4gICAgICBcIjA1LWluc2lnaHRzLWdhcHNcIiwgXCIwNS1pbnNpZ2h0cy1nYXBzL2tub3dsZWRnZVwiLCBcIjA1LWluc2lnaHRzLWdhcHMvb250b2xvZ3lcIiwgXCIwNS1pbnNpZ2h0cy1nYXBzL2dvYWxzXCIsXG4gICAgICBcIjA1LXNlbGYtaW1wcm92ZW1lbnQtSElUTFwiLCBcIjA1LXNlbGYtaW1wcm92ZW1lbnQtSElUTC9tb2RlbHNcIixcbiAgICAgIFwiMDUtc2VsZi1pbXByb3ZlbWVudC1ISVRML2h5cGVycGFyYW1ldGVyc1wiLCBcIjA1LXNlbGYtaW1wcm92ZW1lbnQtSElUTC9wcm9tcHRzXCIsXG4gICAgICBcIjA1LXNlbGYtaW1wcm92ZW1lbnQtSElUTC9mZWF0dXJlc1wiLCBcIjA1LXNlbGYtaW1wcm92ZW1lbnQtSElUTC9jb2RlLWNoYW5nZXNcIixcbiAgICAgIFwiMDUtc2VsZi1pbXByb3ZlbWVudC1ISVRML3NlcnZpY2VzLWludGVncmF0aW9uc1wiLFxuICAgICAgXCIwNi1zZWxmLWltcHJvdmVtZW50LXJlY3Vyc2l2ZVwiLCBcIjA2LXNlbGYtaW1wcm92ZW1lbnQtcmVjdXJzaXZlL2hhcm5lc3MtdG8taGFybmVzcy1jb21tc1wiLFxuICAgICAgXCIwNi1zZWxmLWltcHJvdmVtZW50LXJlY3Vyc2l2ZS9oYXJuZXNzLWNsaVwiLCBcIjA2LXNlbGYtaW1wcm92ZW1lbnQtcmVjdXJzaXZlL2JyYWluXCIsXG4gICAgICBcIjA2LXByb2dyZXNzLXJlcG9ydHNcIixcbiAgICAgIFwiMDctbmV1cm8tbGluay10YXNrXCIsXG4gICAgICBcIjA4LWNvZGUtZG9jc1wiLCBcIjA4LWNvZGUtZG9jcy9teS1yZXBvc1wiLCBcIjA4LWNvZGUtZG9jcy9jb21tb24tdG9vbHNcIiwgXCIwOC1jb2RlLWRvY3MvbXktZm9ya3NcIixcbiAgICAgIFwiMDktYnVzaW5lc3MtZG9jc1wiLFxuICAgICAgXCJjb25maWdcIiwgXCJzdGF0ZVwiLFxuICAgIF07XG5cbiAgICAvLyBDaGVjayBpZiBhbHJlYWR5IHNjYWZmb2xkZWQgKDAyLUtCLW1haW4gZXhpc3RzID0gbm90IGZpcnN0IHJ1bilcbiAgICBjb25zdCBtYXJrZXIgPSB2YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoXCIwMi1LQi1tYWluXCIpO1xuICAgIGlmIChtYXJrZXIpIHJldHVybjsgLy8gYWxyZWFkeSBzY2FmZm9sZGVkXG5cbiAgICBmb3IgKGNvbnN0IGRpciBvZiBESVJTKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB2YXVsdC5jcmVhdGVGb2xkZXIoZGlyKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBmb2xkZXIgYWxyZWFkeSBleGlzdHNcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgc2VlZCBmaWxlc1xuICAgIGNvbnN0IHNlZWRzOiBBcnJheTx7IHBhdGg6IHN0cmluZzsgY29udGVudDogc3RyaW5nIH0+ID0gW1xuICAgICAge1xuICAgICAgICBwYXRoOiBcIjAyLUtCLW1haW4vc2NoZW1hLm1kXCIsXG4gICAgICAgIGNvbnRlbnQ6IFwiLS0tXFxudGl0bGU6IFdpa2kgU2NoZW1hXFxuLS0tXFxuIyBXaWtpIFBhZ2UgQ29udmVudGlvbnNcXG5cXG5FdmVyeSBwYWdlIGhhcyBZQU1MIGZyb250bWF0dGVyOiBgdGl0bGVgLCBgZG9tYWluYCwgYHNvdXJjZXNbXWAsIGBjb25maWRlbmNlYCwgYGxhc3RfdXBkYXRlZGAsIGBvcGVuX3F1ZXN0aW9uc1tdYFxcblxcblNlY3Rpb25zOiBPdmVydmlldyA+IENvbmNlcHR1YWwgTW9kZWwgPiBEZXRhaWxzID4gQ29udHJhZGljdGlvbnMgPiBPcGVuIFF1ZXN0aW9ucyA+IFNvdXJjZXNcXG5cIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHBhdGg6IFwiMDItS0ItbWFpbi9pbmRleC5tZFwiLFxuICAgICAgICBjb250ZW50OiBcIiMgV2lraSBJbmRleFxcblxcbipBdXRvLWdlbmVyYXRlZC4gRG8gbm90IGVkaXQgbWFudWFsbHkuKlxcblwiLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgcGF0aDogXCIwMi1LQi1tYWluL2xvZy5tZFwiLFxuICAgICAgICBjb250ZW50OiBcIiMgTXV0YXRpb24gTG9nXFxuXFxuKkFwcGVuZC1vbmx5IHJlY29yZCBvZiB3aWtpIGNoYW5nZXMuKlxcblwiLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgcGF0aDogXCIwMy1vbnRvbG9neS1tYWluL3dvcmtmbG93L3N0YXRlLWRlZmluaXRpb25zLm1kXCIsXG4gICAgICAgIGNvbnRlbnQ6IFwiLS0tXFxudGl0bGU6IFdvcmtmbG93IFN0YXRlIERlZmluaXRpb25zXFxuLS0tXFxuIyBTdGF0ZXNcXG5cXG5zaWduYWwgXHUyMTkyIGltcHJlc3Npb24gXHUyMTkyIGluc2lnaHQgXHUyMTkyIGZyYW1ld29yayBcdTIxOTIgbGVucyBcdTIxOTIgc3ludGhlc2lzIFx1MjE5MiBpbmRleFxcblwiLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgcGF0aDogXCIwMy1vbnRvbG9neS1tYWluL3dvcmtmbG93L3BoYXNlLWdhdGluZy5tZFwiLFxuICAgICAgICBjb250ZW50OiBcIi0tLVxcbnRpdGxlOiBQaGFzZSBHYXRpbmdcXG4tLS1cXG4jIFBoYXNlIEdhdGUgUmVxdWlyZW1lbnRzXFxuXFxuRGVmaW5lIHdoYXQgbXVzdCBiZSB0cnVlIGJlZm9yZSB0cmFuc2l0aW9uaW5nIGJldHdlZW4gc3RhdGVzLlxcblwiLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgcGF0aDogXCIwMy1vbnRvbG9neS1tYWluL3dvcmtmbG93L2dvYWwtaGllcmFyY2hpY2FsLm1kXCIsXG4gICAgICAgIGNvbnRlbnQ6IFwiLS0tXFxudGl0bGU6IEdvYWwgSGllcmFyY2h5XFxuLS0tXFxuIyBHb2Fsc1xcblxcbkRlZmluZSB5b3VyIGRvbWFpbiBnb2FscyBmcm9tIGJyb2FkIHRvIHNwZWNpZmljLlxcblwiLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgcGF0aDogXCIwNi1wcm9ncmVzcy1yZXBvcnRzL2RhaWx5Lm1kXCIsXG4gICAgICAgIGNvbnRlbnQ6IFwiIyBEYWlseSBSZXBvcnRcXG5cXG4qQXV0by1nZW5lcmF0ZWQgYnkgcHJvZ3Jlc3MtcmVwb3J0IHNraWxsLipcXG5cIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHBhdGg6IFwiY29uZmlnL25ldXJvLWxpbmsubWRcIixcbiAgICAgICAgY29udGVudDogXCItLS1cXG52ZXJzaW9uOiAxXFxuYXV0b19yYWc6IHRydWVcXG5hdXRvX2N1cmF0ZTogdHJ1ZVxcbmRlZmF1bHRfbGxtOiBjbGF1ZGUtc29ubmV0LTQtNlxcbndpa2lfbGxtOiBjbGF1ZGUtc29ubmV0LTQtNlxcbm9udG9sb2d5X2xsbTogY2xhdWRlLW9wdXMtNC02XFxuZW1iZWRkaW5nX21vZGVsOiBPY3Rlbi9PY3Rlbi1FbWJlZGRpbmctOEJcXG5lbWJlZGRpbmdfZGltczogNDA5NlxcbnZlY3Rvcl9kYjogcWRyYW50XFxuYWxsb3dlZF9wYXRoczogYWxsXFxuLS0tXFxuIyBOZXVyby1MaW5rIE1hc3RlciBDb25maWdcXG5cXG5FZGl0IHRoZSBZQU1MIGZyb250bWF0dGVyIGFib3ZlIHRvIGNvbmZpZ3VyZSB0aGUgc3lzdGVtLlxcblwiLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgcGF0aDogXCJzdGF0ZS9oZWFydGJlYXQuanNvblwiLFxuICAgICAgICBjb250ZW50OiAne1wic3RhdHVzXCI6XCJpbml0aWFsaXplZFwiLFwibGFzdF9jaGVja1wiOlwiJyArIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSArICdcIixcImVycm9yc1wiOltdfScsXG4gICAgICB9LFxuICAgIF07XG5cbiAgICBmb3IgKGNvbnN0IHNlZWQgb2Ygc2VlZHMpIHtcbiAgICAgIGNvbnN0IGV4aXN0cyA9IHZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChzZWVkLnBhdGgpO1xuICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCB2YXVsdC5jcmVhdGUoc2VlZC5wYXRoLCBzZWVkLmNvbnRlbnQpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyBmaWxlIGV4aXN0c1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbmV3IE5vdGljZShcIk5ldXJvLUxpbms6IHZhdWx0IHN0cnVjdHVyZSBjcmVhdGVkIHdpdGggZGVmYXVsdCBmb2xkZXJzIGFuZCBjb25maWdcIik7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHN0YXJ0U2VydmVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGJpblBhdGggPSB0aGlzLnJlc29sdmVCaW5hcnlQYXRoKCk7XG4gICAgY29uc3QgcG9ydCA9IHRoaXMuc2V0dGluZ3MuYXBpUm91dGVyUG9ydCB8fCA4MDgwO1xuXG4gICAgY29uc3QgZW52OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0geyAuLi5wcm9jZXNzLmVudiBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IH07XG4gICAgaWYgKHRoaXMuc2V0dGluZ3MubmxyUm9vdCkge1xuICAgICAgZW52W1wiTkxSX1JPT1RcIl0gPSB0aGlzLnNldHRpbmdzLm5sclJvb3Q7XG4gICAgfVxuXG4gICAgLy8gTG9hZCB0b2tlbiBmcm9tIHNlY3JldHMvLmVudiBpZiBhdmFpbGFibGVcbiAgICBjb25zdCBzZWNyZXRzUGF0aCA9IHRoaXMuc2V0dGluZ3MubmxyUm9vdFxuICAgICAgPyBwYXRoLmpvaW4odGhpcy5zZXR0aW5ncy5ubHJSb290LCBcInNlY3JldHNcIiwgXCIuZW52XCIpXG4gICAgICA6IFwiXCI7XG4gICAgbGV0IHRva2VuID0gXCJcIjtcbiAgICBpZiAoc2VjcmV0c1BhdGggJiYgZnMuZXhpc3RzU3luYyhzZWNyZXRzUGF0aCkpIHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoc2VjcmV0c1BhdGgsIFwidXRmLThcIik7XG4gICAgICBjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goL05MUl9BUElfVE9LRU49KC4rKS8pO1xuICAgICAgaWYgKG1hdGNoKSB0b2tlbiA9IG1hdGNoWzFdLnRyaW0oKTtcbiAgICB9XG5cbiAgICBjb25zdCBhcmdzID0gW1wic2VydmVcIiwgXCItLXBvcnRcIiwgU3RyaW5nKHBvcnQpXTtcbiAgICBpZiAodG9rZW4pIHtcbiAgICAgIGFyZ3MucHVzaChcIi0tdG9rZW5cIiwgdG9rZW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcmdzLnB1c2goXCItLXRva2VuXCIsIFwiYXV0b1wiKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5zZXJ2ZXJQcm9jZXNzID0gc3Bhd24oYmluUGF0aCwgYXJncywge1xuICAgICAgICBlbnYsXG4gICAgICAgIGN3ZDogdGhpcy5zZXR0aW5ncy5ubHJSb290IHx8IHVuZGVmaW5lZCxcbiAgICAgICAgc3RkaW86IFtcImlnbm9yZVwiLCBcInBpcGVcIiwgXCJwaXBlXCJdLFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2VydmVyUHJvY2Vzcy5vbihcImVycm9yXCIsICgpID0+IHtcbiAgICAgICAgLy8gQmluYXJ5IG5vdCBmb3VuZCBvciBzcGF3biBmYWlsZWQgXHUyMDE0IHNpbGVudGx5IGlnbm9yZVxuICAgICAgICB0aGlzLnNlcnZlclByb2Nlc3MgPSBudWxsO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2VydmVyUHJvY2Vzcy5vbihcImV4aXRcIiwgKCkgPT4ge1xuICAgICAgICB0aGlzLnNlcnZlclByb2Nlc3MgPSBudWxsO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFdhaXQgYnJpZWZseSB0aGVuIGhlYWx0aCBjaGVja1xuICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgMTUwMCkpO1xuICAgICAgaWYgKHRoaXMuc2VydmVyUHJvY2Vzcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9L2hlYWx0aGApO1xuICAgICAgICAgIGlmIChyZXNwLm9rKSB7XG4gICAgICAgICAgICBuZXcgTm90aWNlKGBOZXVyby1MaW5rIHNlcnZlciBydW5uaW5nIG9uIHBvcnQgJHtwb3J0fWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLy8gU2VydmVyIG1heSBzdGlsbCBiZSBzdGFydGluZ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBzcGF3biBmYWlsZWRcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHN0b3BTZXJ2ZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc2VydmVyUHJvY2Vzcykge1xuICAgICAgdGhpcy5zZXJ2ZXJQcm9jZXNzLmtpbGwoKTtcbiAgICAgIHRoaXMuc2VydmVyUHJvY2VzcyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmxvYWREYXRhKCk7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGRhdGEpO1xuICAgIGlmICghdGhpcy5zZXR0aW5ncy5ubHJSb290KSB7XG4gICAgICB0aGlzLnNldHRpbmdzLm5sclJvb3QgPSB0aGlzLmRldGVjdE5sclJvb3QoKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLnNldHRpbmdzLnZhdWx0UGF0aCkge1xuICAgICAgdGhpcy5zZXR0aW5ncy52YXVsdFBhdGggPSB0aGlzLmRldGVjdFZhdWx0UGF0aCgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHNhdmVTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICB9XG5cbiAgZGV0ZWN0TmxyUm9vdCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHZhdWx0UGF0aCA9IHRoaXMuZGV0ZWN0VmF1bHRQYXRoKCk7XG4gICAgaWYgKHZhdWx0UGF0aCkge1xuICAgICAgY29uc3QgY2FuZGlkYXRlID0gcGF0aC5yZXNvbHZlKHZhdWx0UGF0aCwgXCIuLlwiKTtcbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihjYW5kaWRhdGUsIFwiY29uZmlnXCIsIFwibmV1cm8tbGluay5tZFwiKSkpIHtcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICAgIH1cbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbih2YXVsdFBhdGgsIFwiY29uZmlnXCIsIFwibmV1cm8tbGluay5tZFwiKSkpIHtcbiAgICAgICAgcmV0dXJuIHZhdWx0UGF0aDtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaG9tZSA9IHByb2Nlc3MuZW52LkhPTUUgfHwgcHJvY2Vzcy5lbnYuVVNFUlBST0ZJTEUgfHwgXCJcIjtcbiAgICBjb25zdCBkZWZhdWx0UGF0aCA9IHBhdGguam9pbihob21lLCBcIkRlc2t0b3BcIiwgXCJIeXBlckZyZXF1ZW5jeVwiLCBcIm5ldXJvLWxpbmstcmVjdXJzaXZlXCIpO1xuICAgIGlmIChmcy5leGlzdHNTeW5jKGRlZmF1bHRQYXRoKSkge1xuICAgICAgcmV0dXJuIGRlZmF1bHRQYXRoO1xuICAgIH1cbiAgICByZXR1cm4gXCJcIjtcbiAgfVxuXG4gIGRldGVjdFZhdWx0UGF0aCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLmFwcC52YXVsdC5hZGFwdGVyO1xuICAgIGlmIChcImdldEJhc2VQYXRoXCIgaW4gYWRhcHRlciAmJiB0eXBlb2YgYWRhcHRlci5nZXRCYXNlUGF0aCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICByZXR1cm4gKGFkYXB0ZXIgYXMgeyBnZXRCYXNlUGF0aCgpOiBzdHJpbmcgfSkuZ2V0QmFzZVBhdGgoKTtcbiAgICB9XG4gICAgcmV0dXJuIFwiXCI7XG4gIH1cblxuICByZXNvbHZlQmluYXJ5UGF0aCgpOiBzdHJpbmcge1xuICAgIC8vIFVzZXItY29uZmlndXJlZCBwYXRoIHRha2VzIHByaW9yaXR5XG4gICAgY29uc3QgY29uZmlndXJlZCA9IHRoaXMuc2V0dGluZ3MubmxyQmluYXJ5UGF0aDtcbiAgICBpZiAoY29uZmlndXJlZCAmJiBjb25maWd1cmVkICE9PSBcIm5ldXJvLWxpbmtcIiAmJiBmcy5leGlzdHNTeW5jKGNvbmZpZ3VyZWQpKSB7XG4gICAgICByZXR1cm4gY29uZmlndXJlZDtcbiAgICB9XG4gICAgLy8gQ2hlY2sgY29tbW9uIGxvY2F0aW9ucyAoRWxlY3Ryb24gZG9lc24ndCBpbmhlcml0IHNoZWxsIFBBVEgpXG4gICAgY29uc3QgY2FuZGlkYXRlcyA9IFtcbiAgICAgIFwiL3Vzci9sb2NhbC9iaW4vbmV1cm8tbGlua1wiLFxuICAgICAgcGF0aC5qb2luKHByb2Nlc3MuZW52LkhPTUUgfHwgXCJcIiwgXCIuY2FyZ28vYmluL25ldXJvLWxpbmtcIiksXG4gICAgICB0aGlzLnNldHRpbmdzLm5sclJvb3QgPyBwYXRoLmpvaW4odGhpcy5zZXR0aW5ncy5ubHJSb290LCBcInNlcnZlci90YXJnZXQvcmVsZWFzZS9uZXVyby1saW5rXCIpIDogXCJcIixcbiAgICAgIFwiL29wdC9ob21lYnJldy9iaW4vbmV1cm8tbGlua1wiLFxuICAgIF0uZmlsdGVyKEJvb2xlYW4pO1xuICAgIGZvciAoY29uc3QgYyBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhjKSkgcmV0dXJuIGM7XG4gICAgfVxuICAgIHJldHVybiBjb25maWd1cmVkIHx8IFwibmV1cm8tbGlua1wiO1xuICB9XG5cbiAgYXN5bmMgY2hlY2tObHJCaW5hcnkoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgYmluUGF0aCA9IHRoaXMucmVzb2x2ZUJpbmFyeVBhdGgoKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZXhlY0ZpbGVBc3luYyhiaW5QYXRoLCBbXCItLXZlcnNpb25cIl0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgbmV3IE5vdGljZShcbiAgICAgICAgYG5ldXJvLWxpbmsgYmluYXJ5IG5vdCBmb3VuZCBhdCAke2JpblBhdGh9LiBTZXQgdGhlIGZ1bGwgcGF0aCBpbiBTZXR0aW5ncyA+IE5ldXJvLUxpbmsgUmVjdXJzaXZlID4gTkxSIEJpbmFyeSBQYXRoLmAsXG4gICAgICAgIDEwMDAwXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJ1bk5sckNvbW1hbmQoYXJnczogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGJpblBhdGggPSB0aGlzLnJlc29sdmVCaW5hcnlQYXRoKCk7XG4gICAgY29uc3QgZW52OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0geyAuLi5wcm9jZXNzLmVudiBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IH07XG4gICAgaWYgKHRoaXMuc2V0dGluZ3MubmxyUm9vdCkge1xuICAgICAgZW52W1wiTkxSX1JPT1RcIl0gPSB0aGlzLnNldHRpbmdzLm5sclJvb3Q7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHN0ZG91dCwgc3RkZXJyIH0gPSBhd2FpdCBleGVjRmlsZUFzeW5jKGJpblBhdGgsIGFyZ3MsIHtcbiAgICAgICAgY3dkOiB0aGlzLnNldHRpbmdzLm5sclJvb3QgfHwgdW5kZWZpbmVkLFxuICAgICAgICBlbnYsXG4gICAgICAgIHRpbWVvdXQ6IDMwMDAwLFxuICAgICAgfSk7XG4gICAgICBpZiAoc3RkZXJyICYmICFzdGRvdXQpIHJldHVybiBzdGRlcnI7XG4gICAgICByZXR1cm4gc3Rkb3V0O1xuICAgIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICAgIGNvbnN0IGVyciA9IGUgYXMgeyBzdGRlcnI/OiBzdHJpbmc7IG1lc3NhZ2U/OiBzdHJpbmcgfTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnIuc3RkZXJyIHx8IGVyci5tZXNzYWdlIHx8IFwiVW5rbm93biBlcnJvclwiKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBhY3RpdmF0ZVZpZXcodmlld1R5cGU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZSh2aWV3VHlwZSk7XG4gICAgaWYgKGV4aXN0aW5nLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5yZXZlYWxMZWFmKGV4aXN0aW5nWzBdKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbGVhZjogV29ya3NwYWNlTGVhZiA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRSaWdodExlYWYoZmFsc2UpITtcbiAgICBhd2FpdCBsZWFmLnNldFZpZXdTdGF0ZSh7IHR5cGU6IHZpZXdUeXBlLCBhY3RpdmU6IHRydWUgfSk7XG4gICAgdGhpcy5hcHAud29ya3NwYWNlLnJldmVhbExlYWYobGVhZik7XG4gIH1cbn1cbiIsICJpbXBvcnQge1xuICBBcHAsXG4gIFBsdWdpblNldHRpbmdUYWIsXG4gIFNldHRpbmcsXG4gIE5vdGljZSxcbiAgVGV4dENvbXBvbmVudCxcbiAgQnV0dG9uQ29tcG9uZW50LFxufSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB0eXBlIE5MUlBsdWdpbiBmcm9tIFwiLi9tYWluXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGV4ZWNGaWxlIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gXCJ1dGlsXCI7XG5cbmNvbnN0IGV4ZWNGaWxlQXN5bmMgPSBwcm9taXNpZnkoZXhlY0ZpbGUpO1xuXG5leHBvcnQgaW50ZXJmYWNlIEhhcm5lc3NDb25maWcge1xuICBuYW1lOiBzdHJpbmc7XG4gIHR5cGU6IHN0cmluZztcbiAgc3RhdHVzOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICBhcGlLZXlFbnY6IHN0cmluZztcbiAgcm9sZTogc3RyaW5nO1xuICBjYXBhYmlsaXRpZXM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5MUlNldHRpbmdzIHtcbiAgbmxyUm9vdDogc3RyaW5nO1xuICBubHJCaW5hcnlQYXRoOiBzdHJpbmc7XG4gIHZhdWx0UGF0aDogc3RyaW5nO1xuICBhcGlLZXlzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICBoYXJuZXNzZXM6IEhhcm5lc3NDb25maWdbXTtcbiAgbWNwU2VydmVyTW9kZTogc3RyaW5nO1xuICBtY3AyY2xpUHJvZmlsZVBhdGg6IHN0cmluZztcbiAgYXBpUm91dGVyUG9ydDogbnVtYmVyO1xuICBuZ3Jva0RvbWFpbjogc3RyaW5nO1xuICBzZXNzaW9uTG9nZ2luZzogYm9vbGVhbjtcbiAgc2NvcmVIaXN0b3J5OiBib29sZWFuO1xuICBhdXRvR3JhZGU6IGJvb2xlYW47XG4gIGNoYXRib3RNb2RlbDogc3RyaW5nO1xuICBjaGF0Ym90U3lzdGVtUHJvbXB0OiBzdHJpbmc7XG4gIGFwaVJvdXRlczogQXJyYXk8eyBrZXlOYW1lOiBzdHJpbmc7IHByb3ZpZGVyOiBzdHJpbmc7IGVuZHBvaW50OiBzdHJpbmcgfT47XG59XG5cbmNvbnN0IEFQSV9LRVlfREVGUzogQXJyYXk8eyBrZXk6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgZGVzYzogc3RyaW5nOyBkZWZhdWx0VmFsPzogc3RyaW5nOyB0ZXN0OiBzdHJpbmcgfT4gPSBbXG4gIC8vIExMTSBQcm92aWRlcnMgKGZvciB5b3VyIGFnZW50cyB0byBjYWxsIHRocm91Z2ggbmV1cm8tbGluaydzIC9sbG0vdjEgcHJveHkpXG4gIHsga2V5OiBcIk9QRU5ST1VURVJfQVBJX0tFWVwiLCBsYWJlbDogXCJPcGVuUm91dGVyIEFQSSBLZXlcIiwgZGVzYzogXCJMTE0gcm91dGluZyBmb3IgY2hhdGJvdCBhbmQgTExNIHBhc3N0aHJvdWdoIHByb3h5XCIsIHRlc3Q6IFwib3BlbnJvdXRlclwiIH0sXG4gIHsga2V5OiBcIkFOVEhST1BJQ19BUElfS0VZXCIsIGxhYmVsOiBcIkFudGhyb3BpYyBBUEkgS2V5XCIsIGRlc2M6IFwiRGlyZWN0IEFudGhyb3BpYyBhY2Nlc3MgZm9yIC9sbG0vdjEvbWVzc2FnZXMgcGFzc3Rocm91Z2ggKG9wdGlvbmFsIGlmIHVzaW5nIE9wZW5Sb3V0ZXIpXCIsIHRlc3Q6IFwia2V5LXNhdmVkXCIgfSxcbiAgLy8gS25vd2xlZGdlICYgUmVzZWFyY2hcbiAgeyBrZXk6IFwiUEFSQUxMRUxfQVBJX0tFWVwiLCBsYWJlbDogXCJQYXJhbGxlbCBXZWIgQVBJIEtleVwiLCBkZXNjOiBcIldlYiBzY3JhcGluZywgc2VhcmNoLCBhbmQgZGVlcCByZXNlYXJjaCBmb3IgY3Jhd2wtaW5nZXN0IHBpcGVsaW5lXCIsIHRlc3Q6IFwia2V5LXNhdmVkXCIgfSxcbiAgeyBrZXk6IFwiSU5GUkFOT0RVU19BUElfS0VZXCIsIGxhYmVsOiBcIkluZnJhTm9kdXMgQVBJIEtleVwiLCBkZXNjOiBcIktub3dsZWRnZSBncmFwaHMsIGdhcCBhbmFseXNpcywgb250b2xvZ3kgcXVlcmllcyAoTUNQIHZpYSBtY3BvcnRlcilcIiwgdGVzdDogXCJrZXktc2F2ZWRcIiB9LFxuICAvLyBMb2NhbCBJbmZyYXN0cnVjdHVyZVxuICB7IGtleTogXCJFTUJFRERJTkdfQVBJX1VSTFwiLCBsYWJlbDogXCJFbWJlZGRpbmcgU2VydmVyIFVSTFwiLCBkZXNjOiBcIk9jdGVuLUVtYmVkZGluZy04QiBcdTIwMTQgc3RhcnQgd2l0aDogLi9zY3JpcHRzL2VtYmVkZGluZy1zZXJ2ZXIuc2hcIiwgZGVmYXVsdFZhbDogXCJodHRwOi8vbG9jYWxob3N0Ojg0MDAvdjEvZW1iZWRkaW5nc1wiLCB0ZXN0OiBcImxvY2FsLXVybFwiIH0sXG4gIHsga2V5OiBcIlFEUkFOVF9VUkxcIiwgbGFiZWw6IFwiUWRyYW50IFVSTFwiLCBkZXNjOiBcIlZlY3RvciBkYXRhYmFzZSBmb3Igc2VtYW50aWMgc2VhcmNoXCIsIGRlZmF1bHRWYWw6IFwiaHR0cDovL2xvY2FsaG9zdDo2MzMzXCIsIHRlc3Q6IFwibG9jYWwtdXJsXCIgfSxcbiAgeyBrZXk6IFwiTkVPNEpfVVJJXCIsIGxhYmVsOiBcIk5lbzRqIEJvbHQgVVJJXCIsIGRlc2M6IFwiR3JhcGggZGF0YWJhc2UgZm9yIHRlbXBvcmFsIGtub3dsZWRnZSAoR3JhcGhpdGkpXCIsIGRlZmF1bHRWYWw6IFwiYm9sdDovL2xvY2FsaG9zdDo3Njg3XCIsIHRlc3Q6IFwiZm9ybWF0OmJvbHQ6Ly9cIiB9LFxuICB7IGtleTogXCJORU80Sl9IVFRQX1VSTFwiLCBsYWJlbDogXCJOZW80aiBIVFRQIFVSTFwiLCBkZXNjOiBcIk5lbzRqIEhUVFAgQVBJIGZvciBDeXBoZXIgcXVlcmllc1wiLCBkZWZhdWx0VmFsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6NzQ3NFwiLCB0ZXN0OiBcImxvY2FsLXVybFwiIH0sXG4gIHsga2V5OiBcIk5FTzRKX1BBU1NXT1JEXCIsIGxhYmVsOiBcIk5lbzRqIFBhc3N3b3JkXCIsIGRlc2M6IFwiTmVvNGogYXV0aCBwYXNzd29yZCAodXNlcjogbmVvNGosIG1pbiA4IGNoYXJzKVwiLCBkZWZhdWx0VmFsOiBcIm5ldXJvbGluazEyMzRcIiwgdGVzdDogXCJrZXktc2F2ZWRcIiB9LFxuICAvLyBUdW5uZWxpbmdcbiAgeyBrZXk6IFwiTkdST0tfQVVUSF9UT0tFTlwiLCBsYWJlbDogXCJOZ3JvayBBdXRoIFRva2VuXCIsIGRlc2M6IFwiVHVubmVsIGZvciByZW1vdGUgTUNQL0FQSSBhY2Nlc3MgKGdldCBmcm9tIG5ncm9rLmNvbS9kYXNoYm9hcmQpXCIsIHRlc3Q6IFwibmdyb2tcIiB9LFxuXTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IE5MUlNldHRpbmdzID0ge1xuICBubHJSb290OiBcIlwiLFxuICBubHJCaW5hcnlQYXRoOiBcIm5ldXJvLWxpbmtcIixcbiAgdmF1bHRQYXRoOiBcIlwiLFxuICBhcGlLZXlzOiB7fSxcbiAgaGFybmVzc2VzOiBbXSxcbiAgbWNwU2VydmVyTW9kZTogXCJzdGRpb1wiLFxuICBtY3AyY2xpUHJvZmlsZVBhdGg6IFwiXCIsXG4gIGFwaVJvdXRlclBvcnQ6IDgwODAsXG4gIG5ncm9rRG9tYWluOiBcIlwiLFxuICBzZXNzaW9uTG9nZ2luZzogdHJ1ZSxcbiAgc2NvcmVIaXN0b3J5OiB0cnVlLFxuICBhdXRvR3JhZGU6IGZhbHNlLFxuICBjaGF0Ym90TW9kZWw6IFwiYW50aHJvcGljL2NsYXVkZS1zb25uZXQtNC0yMDI1MDUxNFwiLFxuICBjaGF0Ym90U3lzdGVtUHJvbXB0OiBcIllvdSBhcmUgYW4gYXNzaXN0YW50IHdpdGggYWNjZXNzIHRvIHRoZSBuZXVyby1saW5rLXJlY3Vyc2l2ZSBrbm93bGVkZ2UgYmFzZS4gVXNlIHRoZSBwcm92aWRlZCB3aWtpIGNvbnRleHQgdG8gYW5zd2VyIHF1ZXN0aW9ucyBhY2N1cmF0ZWx5LlwiLFxuICBhcGlSb3V0ZXM6IFtdLFxufTtcblxuZXhwb3J0IGNsYXNzIE5MUlNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgcGx1Z2luOiBOTFJQbHVnaW47XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogTkxSUGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cbiAgICB0aGlzLnJlbmRlclBhdGhzU2VjdGlvbihjb250YWluZXJFbCk7XG4gICAgdGhpcy5yZW5kZXJGb2xkZXJBY2Nlc3NTZWN0aW9uKGNvbnRhaW5lckVsKTtcbiAgICB0aGlzLnJlbmRlckFwaUtleXNTZWN0aW9uKGNvbnRhaW5lckVsKTtcbiAgICB0aGlzLnJlbmRlckhhcm5lc3NTZWN0aW9uKGNvbnRhaW5lckVsKTtcbiAgICB0aGlzLnJlbmRlck1jcFNlY3Rpb24oY29udGFpbmVyRWwpO1xuICAgIHRoaXMucmVuZGVyTG9nZ2luZ1NlY3Rpb24oY29udGFpbmVyRWwpO1xuICAgIHRoaXMucmVuZGVyQ2hhdGJvdFNlY3Rpb24oY29udGFpbmVyRWwpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJQYXRoc1NlY3Rpb24oY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IFwiUGF0aHNcIiB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJOTFIgUm9vdFwiKVxuICAgICAgLnNldERlc2MoXCJQYXRoIHRvIG5ldXJvLWxpbmstcmVjdXJzaXZlIHByb2plY3Qgcm9vdFwiKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCIvcGF0aC90by9uZXVyby1saW5rLXJlY3Vyc2l2ZVwiKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5ubHJSb290KVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLm5sclJvb3QgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XG4gICAgICAgIGJ0bi5zZXRCdXR0b25UZXh0KFwiQXV0by1kZXRlY3RcIikub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgZGV0ZWN0ZWQgPSB0aGlzLnBsdWdpbi5kZXRlY3RObHJSb290KCk7XG4gICAgICAgICAgaWYgKGRldGVjdGVkKSB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5ubHJSb290ID0gZGV0ZWN0ZWQ7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgICAgICAgbmV3IE5vdGljZShgTkxSIHJvb3QgZGV0ZWN0ZWQ6ICR7ZGV0ZWN0ZWR9YCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJDb3VsZCBub3QgYXV0by1kZXRlY3QgTkxSIHJvb3RcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJOZXVyby1MaW5rIEJpbmFyeSBQYXRoXCIpXG4gICAgICAuc2V0RGVzYyhcIkZ1bGwgcGF0aCB0byB0aGUgbmV1cm8tbGluayBDTEkgYmluYXJ5IChhdXRvLXJlc29sdmVkIGlmIGxlZnQgZGVmYXVsdClcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiL3Vzci9sb2NhbC9iaW4vbmV1cm8tbGlua1wiKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5ubHJCaW5hcnlQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLm5sckJpbmFyeVBhdGggPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIk9ic2lkaWFuIFZhdWx0IFBhdGhcIilcbiAgICAgIC5zZXREZXNjKFwiQXV0by1kZXRlY3RlZCBmcm9tIGN1cnJlbnQgdmF1bHRcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnZhdWx0UGF0aClcbiAgICAgICAgICAuc2V0RGlzYWJsZWQodHJ1ZSlcbiAgICAgICk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckZvbGRlckFjY2Vzc1NlY3Rpb24oY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IFwiRm9sZGVyIEFjY2Vzc1wiIH0pO1xuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwicFwiLCB7XG4gICAgICB0ZXh0OiBcIlNlbGVjdCB3aGljaCBmb2xkZXJzIHRoZSBNQ1Agc2VydmVyIGV4cG9zZXMgdG8gZXh0ZXJuYWwgY2xpZW50cy4gRGVmYXVsdDogYWxsIGtub3dsZWRnZSBiYXNlIGZvbGRlcnMuXCIsXG4gICAgICBjbHM6IFwic2V0dGluZy1pdGVtLWRlc2NyaXB0aW9uXCIsXG4gICAgfSk7XG5cbiAgICBjb25zdCBubHJSb290ID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MubmxyUm9vdDtcbiAgICBpZiAoIW5sclJvb3QpIHtcbiAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAuc2V0TmFtZShcIlNldCBOTFIgUm9vdCBmaXJzdFwiKVxuICAgICAgICAuc2V0RGVzYyhcIkNvbmZpZ3VyZSB0aGUgTkxSIFJvb3QgcGF0aCBhYm92ZSB0byBtYW5hZ2UgZm9sZGVyIGFjY2Vzc1wiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBBTExfRk9MREVSUyA9IFtcbiAgICAgIHsgbmFtZTogXCIwMC1yYXdcIiwgZGVzYzogXCJSYXcgaW5nZXN0ZWQgc291cmNlc1wiIH0sXG4gICAgICB7IG5hbWU6IFwiMDEtc29ydGVkXCIsIGRlc2M6IFwiQ2xhc3NpZmllZCByYXcgbWF0ZXJpYWwgYnkgZG9tYWluXCIgfSxcbiAgICAgIHsgbmFtZTogXCIwMi1LQi1tYWluXCIsIGRlc2M6IFwiV2lraSBwYWdlcyAoc291cmNlcyBvZiB0cnV0aClcIiB9LFxuICAgICAgeyBuYW1lOiBcIjAzLW9udG9sb2d5LW1haW5cIiwgZGVzYzogXCJSZWFzb25pbmcgb250b2xvZ2llc1wiIH0sXG4gICAgICB7IG5hbWU6IFwiMDQtS0ItYWdlbnRzLXdvcmtmbG93c1wiLCBkZXNjOiBcIlBlci1hZ2VudC93b3JrZmxvdyBrbm93bGVkZ2VcIiB9LFxuICAgICAgeyBuYW1lOiBcIjA1LWluc2lnaHRzLWdhcHNcIiwgZGVzYzogXCJLbm93bGVkZ2UgZ2FwIHJlcG9ydHNcIiB9LFxuICAgICAgeyBuYW1lOiBcIjA1LXNlbGYtaW1wcm92ZW1lbnQtSElUTFwiLCBkZXNjOiBcIkh1bWFuLWluLWxvb3AgaW1wcm92ZW1lbnRcIiB9LFxuICAgICAgeyBuYW1lOiBcIjA2LXNlbGYtaW1wcm92ZW1lbnQtcmVjdXJzaXZlXCIsIGRlc2M6IFwiQXV0b21hdGVkIGltcHJvdmVtZW50XCIgfSxcbiAgICAgIHsgbmFtZTogXCIwNi1wcm9ncmVzcy1yZXBvcnRzXCIsIGRlc2M6IFwiRGFpbHkvd2Vla2x5L21vbnRobHkgcmVwb3J0c1wiIH0sXG4gICAgICB7IG5hbWU6IFwiMDctbmV1cm8tbGluay10YXNrXCIsIGRlc2M6IFwiVGFzayBxdWV1ZVwiIH0sXG4gICAgICB7IG5hbWU6IFwiMDgtY29kZS1kb2NzXCIsIGRlc2M6IFwiQ29kZSBkb2N1bWVudGF0aW9uXCIgfSxcbiAgICAgIHsgbmFtZTogXCIwOS1idXNpbmVzcy1kb2NzXCIsIGRlc2M6IFwiQnVzaW5lc3MgZG9jdW1lbnRzXCIgfSxcbiAgICAgIHsgbmFtZTogXCJjb25maWdcIiwgZGVzYzogXCJDb25maWd1cmF0aW9uIGZpbGVzXCIgfSxcbiAgICBdO1xuXG4gICAgLy8gUmVhZCBjdXJyZW50IGFsbG93ZWRfcGF0aHMgZnJvbSBjb25maWdcbiAgICBjb25zdCBjb25maWdQYXRoID0gcGF0aC5qb2luKG5sclJvb3QsIFwiY29uZmlnXCIsIFwibmV1cm8tbGluay5tZFwiKTtcbiAgICBsZXQgY3VycmVudEFsbG93ZWQ6IHN0cmluZ1tdID0gQUxMX0ZPTERFUlMubWFwKChmKSA9PiBmLm5hbWUpOyAvLyBkZWZhdWx0OiBhbGxcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhjb25maWdQYXRoKSkge1xuICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhjb25maWdQYXRoLCBcInV0Zi04XCIpO1xuICAgICAgY29uc3QgbWF0Y2ggPSBjb250ZW50Lm1hdGNoKC9hbGxvd2VkX3BhdGhzOlxccyooLispLyk7XG4gICAgICBpZiAobWF0Y2ggJiYgbWF0Y2hbMV0udHJpbSgpICE9PSBcImFsbFwiKSB7XG4gICAgICAgIGN1cnJlbnRBbGxvd2VkID0gbWF0Y2hbMV0uc3BsaXQoXCIsXCIpLm1hcCgocykgPT4gcy50cmltKCkpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGZvbGRlciBvZiBBTExfRk9MREVSUykge1xuICAgICAgY29uc3QgaXNFbmFibGVkID0gY3VycmVudEFsbG93ZWQuaW5jbHVkZXMoZm9sZGVyLm5hbWUpO1xuICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgIC5zZXROYW1lKGZvbGRlci5uYW1lKVxuICAgICAgICAuc2V0RGVzYyhmb2xkZXIuZGVzYylcbiAgICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICAgIHRvZ2dsZS5zZXRWYWx1ZShpc0VuYWJsZWQpLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbHVlICYmICFjdXJyZW50QWxsb3dlZC5pbmNsdWRlcyhmb2xkZXIubmFtZSkpIHtcbiAgICAgICAgICAgICAgY3VycmVudEFsbG93ZWQucHVzaChmb2xkZXIubmFtZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICBjb25zdCBpZHggPSBjdXJyZW50QWxsb3dlZC5pbmRleE9mKGZvbGRlci5uYW1lKTtcbiAgICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSBjdXJyZW50QWxsb3dlZC5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH1cblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgICBidG5cbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dChcIlNhdmUgRm9sZGVyIEFjY2Vzc1wiKVxuICAgICAgICAgIC5zZXRDdGEoKVxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZUZvbGRlckFjY2VzcyhjdXJyZW50QWxsb3dlZCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNhdmVGb2xkZXJBY2Nlc3MoYWxsb3dlZDogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBubHJSb290ID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MubmxyUm9vdDtcbiAgICBpZiAoIW5sclJvb3QpIHJldHVybjtcblxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBwYXRoLmpvaW4obmxyUm9vdCwgXCJjb25maWdcIiwgXCJuZXVyby1saW5rLm1kXCIpO1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhjb25maWdQYXRoKSkge1xuICAgICAgbmV3IE5vdGljZShcIm5ldXJvLWxpbmsubWQgbm90IGZvdW5kXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGNvbmZpZ1BhdGgsIFwidXRmLThcIik7XG4gICAgY29uc3QgYWxsb3dlZFN0ciA9IGFsbG93ZWQuam9pbihcIiwgXCIpO1xuXG4gICAgaWYgKGNvbnRlbnQuaW5jbHVkZXMoXCJhbGxvd2VkX3BhdGhzOlwiKSkge1xuICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvYWxsb3dlZF9wYXRoczpcXHMqLisvLCBgYWxsb3dlZF9wYXRoczogJHthbGxvd2VkU3RyfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbnNlcnQgYmVmb3JlIGNsb3NpbmcgLS0tXG4gICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9cXG4tLS0vLCBgXFxuYWxsb3dlZF9wYXRoczogJHthbGxvd2VkU3RyfVxcbi0tLWApO1xuICAgIH1cblxuICAgIGZzLndyaXRlRmlsZVN5bmMoY29uZmlnUGF0aCwgY29udGVudCwgXCJ1dGYtOFwiKTtcbiAgICBuZXcgTm90aWNlKGBGb2xkZXIgYWNjZXNzIHVwZGF0ZWQ6ICR7YWxsb3dlZC5sZW5ndGh9IGZvbGRlcnMgZW5hYmxlZGApO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJBcGlLZXlzU2VjdGlvbihjb250YWluZXJFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJBUEkgS2V5cyAmIFNlcnZpY2VzXCIgfSk7XG5cbiAgICAvLyBBdXRvLXBvcHVsYXRlIGRlZmF1bHRzIG9uIGZpcnN0IGxvYWRcbiAgICBmb3IgKGNvbnN0IGRlZiBvZiBBUElfS0VZX0RFRlMpIHtcbiAgICAgIGlmIChkZWYuZGVmYXVsdFZhbCAmJiAhdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXBpS2V5c1tkZWYua2V5XSkge1xuICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcGlLZXlzW2RlZi5rZXldID0gZGVmLmRlZmF1bHRWYWw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGxhc3RTZWN0aW9uID0gXCJcIjtcbiAgICBmb3IgKGNvbnN0IGRlZiBvZiBBUElfS0VZX0RFRlMpIHtcbiAgICAgIC8vIFNlY3Rpb24gaGVhZGVyc1xuICAgICAgY29uc3Qgc2VjdGlvbiA9XG4gICAgICAgIGRlZi5rZXkuaW5jbHVkZXMoXCJPUEVOUk9VVEVSXCIpIHx8IGRlZi5rZXkuaW5jbHVkZXMoXCJBTlRIUk9QSUNcIikgPyBcIkxMTSBQcm92aWRlcnNcIiA6XG4gICAgICAgIGRlZi5rZXkuaW5jbHVkZXMoXCJJTkZSQU5PRFVTXCIpIHx8IGRlZi5rZXkuaW5jbHVkZXMoXCJQQVJBTExFTFwiKSA/IFwiS25vd2xlZGdlICYgUmVzZWFyY2hcIiA6XG4gICAgICAgIGRlZi5rZXkuaW5jbHVkZXMoXCJFTUJFRERJTkdcIikgfHwgZGVmLmtleS5pbmNsdWRlcyhcIlFEUkFOVFwiKSB8fCBkZWYua2V5LmluY2x1ZGVzKFwiTkVPNEpcIikgPyBcIkxvY2FsIEluZnJhc3RydWN0dXJlXCIgOlxuICAgICAgICBcIlR1bm5lbGluZ1wiO1xuICAgICAgaWYgKHNlY3Rpb24gIT09IGxhc3RTZWN0aW9uKSB7XG4gICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBzZWN0aW9uIH0pO1xuICAgICAgICBsYXN0U2VjdGlvbiA9IHNlY3Rpb247XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlzUGFzc3dvcmQgPSAhZGVmLmtleS5pbmNsdWRlcyhcIlVSTFwiKSAmJiAhZGVmLmtleS5pbmNsdWRlcyhcIlVSSVwiKTtcbiAgICAgIGNvbnN0IHNldHRpbmcgPSBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgLnNldE5hbWUoZGVmLmxhYmVsKVxuICAgICAgICAuc2V0RGVzYyhkZWYuZGVzYyk7XG5cbiAgICAgIHNldHRpbmcuYWRkVGV4dCgodGV4dCkgPT4ge1xuICAgICAgICBjb25zdCBwbGFjZWhvbGRlciA9IGRlZi5kZWZhdWx0VmFsIHx8IGRlZi5rZXk7XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIocGxhY2Vob2xkZXIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmFwaUtleXNbZGVmLmtleV0gfHwgXCJcIik7XG4gICAgICAgIGlmIChpc1Bhc3N3b3JkKSB7XG4gICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XG4gICAgICAgIH1cbiAgICAgICAgdGV4dC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcGlLZXlzW2RlZi5rZXldID0gdmFsdWU7XG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHNldHRpbmcuYWRkQnV0dG9uKChidG46IEJ1dHRvbkNvbXBvbmVudCkgPT5cbiAgICAgICAgYnRuXG4gICAgICAgICAgLnNldEJ1dHRvblRleHQoXCJUZXN0XCIpXG4gICAgICAgICAgLnNldEN0YSgpXG4gICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy50ZXN0QXBpS2V5KGRlZi5rZXkpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJTYXZlIHRvIHNlY3JldHMvLmVudlwiKVxuICAgICAgLnNldERlc2MoXCJXcml0ZSBhbGwgY29uZmlndXJlZCBBUEkga2V5cyB0byBOTFJfUk9PVC9zZWNyZXRzLy5lbnZcIilcbiAgICAgIC5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgICAgYnRuXG4gICAgICAgICAgLnNldEJ1dHRvblRleHQoXCJTYXZlXCIpXG4gICAgICAgICAgLnNldFdhcm5pbmcoKVxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNlY3JldHNFbnYoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJMb2FkIGZyb20gc2VjcmV0cy8uZW52XCIpXG4gICAgICAuc2V0RGVzYyhcIlJlYWQgZXhpc3Rpbmcga2V5cyBmcm9tIE5MUl9ST09UL3NlY3JldHMvLmVudlwiKVxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgICBidG5cbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dChcIkxvYWRcIilcbiAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmxvYWRTZWNyZXRzRW52KCk7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVySGFybmVzc1NlY3Rpb24oY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IFwiSGFybmVzcyBDb25uZWN0aW9uc1wiIH0pO1xuXG4gICAgY29uc3QgaGFybmVzc2VzID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MuaGFybmVzc2VzO1xuXG4gICAgaWYgKGhhcm5lc3Nlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAuc2V0TmFtZShcIk5vIGhhcm5lc3NlcyBjb25maWd1cmVkXCIpXG4gICAgICAgIC5zZXREZXNjKFwiTG9hZCBmcm9tIGNvbmZpZyBvciBhZGQgbWFudWFsbHlcIilcbiAgICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgICAgIGJ0bi5zZXRCdXR0b25UZXh0KFwiTG9hZCBmcm9tIGNvbmZpZ1wiKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMubG9hZEhhcm5lc3Nlc0Zyb21Db25maWcoKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYXJuZXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGggPSBoYXJuZXNzZXNbaV07XG4gICAgICBjb25zdCBzZXR0aW5nID0gbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgIC5zZXROYW1lKGgubmFtZSlcbiAgICAgICAgLnNldERlc2MoYCR7aC50eXBlfSB8ICR7aC5yb2xlfSB8ICR7aC5zdGF0dXN9YCk7XG5cbiAgICAgIGlmIChoLnVybCkge1xuICAgICAgICBzZXR0aW5nLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgICAgIGJ0bi5zZXRCdXR0b25UZXh0KFwiVGVzdFwiKS5zZXRDdGEoKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMudGVzdEhhcm5lc3NDb25uZWN0aW9uKGgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHNldHRpbmcuYWRkQnV0dG9uKChidG4pID0+XG4gICAgICAgIGJ0blxuICAgICAgICAgIC5zZXRCdXR0b25UZXh0KFwiUmVtb3ZlXCIpXG4gICAgICAgICAgLnNldFdhcm5pbmcoKVxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGhhcm5lc3Nlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0bi5zZXRCdXR0b25UZXh0KFwiQWRkIEhhcm5lc3NcIikub25DbGljaygoKSA9PiB7XG4gICAgICAgIGhhcm5lc3Nlcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBcIlwiLFxuICAgICAgICAgIHR5cGU6IFwiYXBpXCIsXG4gICAgICAgICAgc3RhdHVzOiBcImRpc2FibGVkXCIsXG4gICAgICAgICAgdXJsOiBcIlwiLFxuICAgICAgICAgIGFwaUtleUVudjogXCJcIixcbiAgICAgICAgICByb2xlOiBcIlwiLFxuICAgICAgICAgIGNhcGFiaWxpdGllczogW10sXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgdGhpcy5kaXNwbGF5KCk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlck1jcFNlY3Rpb24oY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IFwiTUNQIFNldHVwXCIgfSk7XG5cbiAgICAvLyBBdXRvLXBvcHVsYXRlIG1jcDJjbGkgcHJvZmlsZSBwYXRoXG4gICAgaWYgKCF0aGlzLnBsdWdpbi5zZXR0aW5ncy5tY3AyY2xpUHJvZmlsZVBhdGggJiYgdGhpcy5wbHVnaW4uc2V0dGluZ3MubmxyUm9vdCkge1xuICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubWNwMmNsaVByb2ZpbGVQYXRoID0gcGF0aC5qb2luKHRoaXMucGx1Z2luLnNldHRpbmdzLm5sclJvb3QsIFwibWNwMmNsaS1wcm9maWxlLmpzb25cIik7XG4gICAgfVxuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIk1DUCBTZXJ2ZXIgTW9kZVwiKVxuICAgICAgLnNldERlc2MoXCJUcmFuc3BvcnQgbW9kZSBmb3IgTUNQIHNlcnZlclwiKVxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wKSA9PlxuICAgICAgICBkcm9wXG4gICAgICAgICAgLmFkZE9wdGlvbihcInN0ZGlvXCIsIFwic3RkaW9cIilcbiAgICAgICAgICAuYWRkT3B0aW9uKFwiaHR0cFwiLCBcIkhUVFAvU1NFXCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm1jcFNlcnZlck1vZGUpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubWNwU2VydmVyTW9kZSA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwibWNwMmNsaS1ycyBQcm9maWxlIFBhdGhcIilcbiAgICAgIC5zZXREZXNjKFwiUGF0aCB0byBtY3AyY2xpLXJzIHByb2ZpbGUgSlNPTiAoYXV0by1nZW5lcmF0ZWQgYnkgTUNQIFNldHVwIHdpemFyZClcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKHBhdGguam9pbih0aGlzLnBsdWdpbi5zZXR0aW5ncy5ubHJSb290IHx8IFwiL3BhdGgvdG8vbmV1cm8tbGlua1wiLCBcIm1jcDJjbGktcHJvZmlsZS5qc29uXCIpKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5tY3AyY2xpUHJvZmlsZVBhdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubWNwMmNsaVByb2ZpbGVQYXRoID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJBUEkgUm91dGVyIFBvcnRcIilcbiAgICAgIC5zZXREZXNjKFwiUG9ydCBmb3IgdGhlIE5MUiBBUEkgcm91dGVyXCIpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRWYWx1ZShTdHJpbmcodGhpcy5wbHVnaW4uc2V0dGluZ3MuYXBpUm91dGVyUG9ydCkpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICAgICAgICAgIGlmICghaXNOYU4ocGFyc2VkKSAmJiBwYXJzZWQgPiAwICYmIHBhcnNlZCA8IDY1NTM2KSB7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmFwaVJvdXRlclBvcnQgPSBwYXJzZWQ7XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIk5ncm9rIERvbWFpblwiKVxuICAgICAgLnNldERlc2MoXCJDdXN0b20gTmdyb2sgZG9tYWluIGZvciBzdGFibGUgcmVtb3RlIFVSTCAocmVxdWlyZXMgcGFpZCBwbGFuKVwiKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJ5b3VyLWRvbWFpbi5uZ3Jvay1mcmVlLmFwcFwiKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5uZ3Jva0RvbWFpbilcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5uZ3Jva0RvbWFpbiA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDAgTUNQIENvbm5lY3Rpb24gSW5mbyBcdTI1MDBcdTI1MDBcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJDb25uZWN0IEV4dGVybmFsIFNlcnZpY2VzXCIgfSk7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJwXCIsIHtcbiAgICAgIHRleHQ6IFwiQ29weSB0aGUgY29uZmlnIGJlbG93IGludG8geW91ciBBSSB0b29sJ3MgTUNQIHNldHRpbmdzIHRvIGNvbm5lY3QgdG8gdGhpcyBuZXVyby1saW5rIGluc3RhbmNlLlwiLFxuICAgICAgY2xzOiBcInNldHRpbmctaXRlbS1kZXNjcmlwdGlvblwiLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcG9ydCA9IHRoaXMucGx1Z2luLnNldHRpbmdzLmFwaVJvdXRlclBvcnQgfHwgODA4MDtcbiAgICBjb25zdCBubHJSb290ID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MubmxyUm9vdDtcbiAgICBsZXQgdG9rZW4gPSBcIlwiO1xuICAgIGlmIChubHJSb290KSB7XG4gICAgICBjb25zdCBlbnZQYXRoID0gcGF0aC5qb2luKG5sclJvb3QsIFwic2VjcmV0c1wiLCBcIi5lbnZcIik7XG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhlbnZQYXRoKSkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGVudlBhdGgsIFwidXRmLThcIik7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gY29udGVudC5tYXRjaCgvTkxSX0FQSV9UT0tFTj0oLispLyk7XG4gICAgICAgIGlmIChtYXRjaCkgdG9rZW4gPSBtYXRjaFsxXS50cmltKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYmluUGF0aCA9IHRoaXMucGx1Z2luLnJlc29sdmVCaW5hcnlQYXRoKCk7XG5cbiAgICAvLyBzdGRpbyBjb25maWcgKENsYXVkZSBDb2RlLCBDdXJzb3IsIGV0Yy4pXG4gICAgY29uc3Qgc3RkaW9Db25maWcgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBtY3BTZXJ2ZXJzOiB7XG4gICAgICAgIFwibmV1cm8tbGlua1wiOiB7XG4gICAgICAgICAgdHlwZTogXCJzdGRpb1wiLFxuICAgICAgICAgIGNvbW1hbmQ6IGJpblBhdGgsXG4gICAgICAgICAgYXJnczogW1wibWNwXCJdLFxuICAgICAgICAgIGVudjogeyBOTFJfUk9PVDogbmxyUm9vdCB8fCBcIi9wYXRoL3RvL25ldXJvLWxpbmtcIiB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LCBudWxsLCAyKTtcblxuICAgIC8vIEhUVFAgY29uZmlnIChyZW1vdGUgY2xpZW50cywgSy1EZW5zZSwgd2ViLWJhc2VkIHRvb2xzKVxuICAgIGNvbnN0IGJhc2VVcmwgPSB0aGlzLnBsdWdpbi5zZXR0aW5ncy5uZ3Jva0RvbWFpblxuICAgICAgPyBgaHR0cHM6Ly8ke3RoaXMucGx1Z2luLnNldHRpbmdzLm5ncm9rRG9tYWlufWBcbiAgICAgIDogYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fWA7XG4gICAgY29uc3QgaHR0cENvbmZpZyA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIG1jcFNlcnZlcnM6IHtcbiAgICAgICAgXCJuZXVyby1saW5rXCI6IHtcbiAgICAgICAgICB0eXBlOiBcImh0dHBcIixcbiAgICAgICAgICB1cmw6IGAke2Jhc2VVcmx9L21jcGAsXG4gICAgICAgICAgaGVhZGVyczogeyBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7dG9rZW4gfHwgXCJZT1VSX1RPS0VOX0hFUkVcIn1gIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sIG51bGwsIDIpO1xuXG4gICAgY29uc3Qgc3RkaW9QcmUgPSBjb250YWluZXJFbC5jcmVhdGVFbChcImRpdlwiLCB7IGNsczogXCJubHItc2V0dXAtc3RlcFwiIH0pO1xuICAgIHN0ZGlvUHJlLmNyZWF0ZUVsKFwiaDRcIiwgeyB0ZXh0OiBcIkZvciBDTEkgdG9vbHMgKENsYXVkZSBDb2RlLCBDdXJzb3IsIENsaW5lKVwiIH0pO1xuICAgIHN0ZGlvUHJlLmNyZWF0ZUVsKFwicHJlXCIsIHsgY2xzOiBcIm5sci1yZXN1bHQtcHJlXCIgfSkuY3JlYXRlRWwoXCJjb2RlXCIsIHsgdGV4dDogc3RkaW9Db25maWcgfSk7XG4gICAgbmV3IFNldHRpbmcoc3RkaW9QcmUpLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgYnRuLnNldEJ1dHRvblRleHQoXCJDb3B5IHN0ZGlvIGNvbmZpZ1wiKS5zZXRDdGEoKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoc3RkaW9Db25maWcpO1xuICAgICAgICBuZXcgTm90aWNlKFwic3RkaW8gTUNQIGNvbmZpZyBjb3BpZWRcIik7XG4gICAgICB9KVxuICAgICk7XG5cbiAgICBjb25zdCBodHRwUHJlID0gY29udGFpbmVyRWwuY3JlYXRlRWwoXCJkaXZcIiwgeyBjbHM6IFwibmxyLXNldHVwLXN0ZXBcIiB9KTtcbiAgICBodHRwUHJlLmNyZWF0ZUVsKFwiaDRcIiwgeyB0ZXh0OiBcIkZvciB3ZWIvcmVtb3RlIHRvb2xzIChLLURlbnNlLCBDaGF0R1BUIEFjdGlvbnMsIHJlbW90ZSBDTEkpXCIgfSk7XG4gICAgaHR0cFByZS5jcmVhdGVFbChcInByZVwiLCB7IGNsczogXCJubHItcmVzdWx0LXByZVwiIH0pLmNyZWF0ZUVsKFwiY29kZVwiLCB7IHRleHQ6IGh0dHBDb25maWcgfSk7XG4gICAgbmV3IFNldHRpbmcoaHR0cFByZSkuYWRkQnV0dG9uKChidG4pID0+XG4gICAgICBidG4uc2V0QnV0dG9uVGV4dChcIkNvcHkgSFRUUCBjb25maWdcIikuc2V0Q3RhKCkub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGh0dHBDb25maWcpO1xuICAgICAgICBuZXcgTm90aWNlKFwiSFRUUCBNQ1AgY29uZmlnIGNvcGllZFwiKTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIFJFU1QgQVBJIGluZm9cbiAgICBjb25zdCByZXN0UHJlID0gY29udGFpbmVyRWwuY3JlYXRlRWwoXCJkaXZcIiwgeyBjbHM6IFwibmxyLXNldHVwLXN0ZXBcIiB9KTtcbiAgICByZXN0UHJlLmNyZWF0ZUVsKFwiaDRcIiwgeyB0ZXh0OiBcIlJFU1QgQVBJIChPcGVuQVBJLWNvbXBhdGlibGUpXCIgfSk7XG4gICAgcmVzdFByZS5jcmVhdGVFbChcInByZVwiLCB7IGNsczogXCJubHItcmVzdWx0LXByZVwiIH0pLmNyZWF0ZUVsKFwiY29kZVwiLCB7XG4gICAgICB0ZXh0OiBgQmFzZSBVUkw6ICR7YmFzZVVybH0vYXBpL3YxXFxuQXV0aDogQmVhcmVyICR7dG9rZW4gPyB0b2tlbi5zdWJzdHJpbmcoMCwgOCkgKyBcIi4uLlwiIDogXCJZT1VSX1RPS0VOXCJ9XFxuSGVhbHRoOiAke2Jhc2VVcmx9L2hlYWx0aCAobm8gYXV0aClcXG5Eb2NzOiAke2Jhc2VVcmx9L2FwaS92MS9vcGVuYXBpLmpzb25gLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJMb2dnaW5nU2VjdGlvbihjb250YWluZXJFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJMb2dnaW5nXCIgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiU2Vzc2lvbiBMb2dnaW5nXCIpXG4gICAgICAuc2V0RGVzYyhcIkxvZyB0b29sIGNhbGxzIGFuZCByZXNwb25zZXMgdG8gc3RhdGUvc2Vzc2lvbl9sb2cuanNvbmxcIilcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnNlc3Npb25Mb2dnaW5nKS5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zZXNzaW9uTG9nZ2luZyA9IHZhbHVlO1xuICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJTY29yZSBIaXN0b3J5XCIpXG4gICAgICAuc2V0RGVzYyhcIlJlY29yZCBzZXNzaW9uIGdyYWRpbmcgc2NvcmVzIHRvIHN0YXRlL3Njb3JlX2hpc3RvcnkuanNvbmxcIilcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnNjb3JlSGlzdG9yeSkub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc2NvcmVIaXN0b3J5ID0gdmFsdWU7XG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIkF1dG8gR3JhZGVcIilcbiAgICAgIC5zZXREZXNjKFwiQXV0b21hdGljYWxseSBncmFkZSBzZXNzaW9ucyBvbiBjb21wbGV0aW9uXCIpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZS5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvR3JhZGUpLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9HcmFkZSA9IHZhbHVlO1xuICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyQ2hhdGJvdFNlY3Rpb24oY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IFwiQ2hhdGJvdFwiIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIk1vZGVsXCIpXG4gICAgICAuc2V0RGVzYyhcIk9wZW5Sb3V0ZXIgbW9kZWwgaWRlbnRpZmllciBmb3IgY2hhdGJvdFwiKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJhbnRocm9waWMvY2xhdWRlLXNvbm5ldC00LTIwMjUwNTE0XCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNoYXRib3RNb2RlbClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jaGF0Ym90TW9kZWwgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIlN5c3RlbSBQcm9tcHRcIilcbiAgICAgIC5zZXREZXNjKFwiU3lzdGVtIHByb21wdCBwcmVwZW5kZWQgdG8gY2hhdGJvdCBjb252ZXJzYXRpb25zXCIpXG4gICAgICAuYWRkVGV4dEFyZWEoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJZb3UgYXJlIGFuIGFzc2lzdGFudC4uLlwiKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5jaGF0Ym90U3lzdGVtUHJvbXB0KVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmNoYXRib3RTeXN0ZW1Qcm9tcHQgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyB0ZXN0QXBpS2V5KGtleU5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXBpS2V5c1trZXlOYW1lXTtcbiAgICBjb25zdCBkZWYgPSBBUElfS0VZX0RFRlMuZmluZCgoZCkgPT4gZC5rZXkgPT09IGtleU5hbWUpO1xuICAgIGNvbnN0IGxhYmVsID0gZGVmPy5sYWJlbCB8fCBrZXlOYW1lO1xuICAgIGNvbnN0IHRlc3QgPSBkZWY/LnRlc3QgfHwgXCJrZXktc2F2ZWRcIjtcblxuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIG5ldyBOb3RpY2UoYCR7bGFiZWx9OiBub3Qgc2V0YCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIC8vIFx1MjUwMFx1MjUwMCBrZXktc2F2ZWQ6IG5vIHRlc3QgcG9zc2libGUsIGp1c3QgY29uZmlybSBzYXZlZCBcdTI1MDBcdTI1MDBcbiAgICAgIGlmICh0ZXN0ID09PSBcImtleS1zYXZlZFwiKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoYCR7bGFiZWx9OiBzYXZlZCBcXHUyNzEzYCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHUyNTAwXHUyNTAwIGtleS1mb3JtYXQ6cHJlZml4IFx1MjAxNCB2YWxpZGF0ZSBrZXkgc3RhcnRzIHdpdGggZXhwZWN0ZWQgcHJlZml4IFx1MjUwMFx1MjUwMFxuICAgICAgaWYgKHRlc3Quc3RhcnRzV2l0aChcImtleS1mb3JtYXQ6XCIpKSB7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IHRlc3Quc3Vic3RyaW5nKDExKTtcbiAgICAgICAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgocHJlZml4KSkge1xuICAgICAgICAgIG5ldyBOb3RpY2UoYCR7bGFiZWx9OiBmb3JtYXQgdmFsaWQgKCR7cHJlZml4fS4uLikgXFx1MjcxM2ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ldyBOb3RpY2UoYCR7bGFiZWx9OiBzYXZlZCAoZXhwZWN0ZWQgcHJlZml4OiAke3ByZWZpeH0pYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTI1MDBcdTI1MDAgZm9ybWF0OnByZWZpeCBcdTIwMTQgdmFsaWRhdGUgVVJML1VSSSBmb3JtYXQgXHUyNTAwXHUyNTAwXG4gICAgICBpZiAodGVzdC5zdGFydHNXaXRoKFwiZm9ybWF0OlwiKSkge1xuICAgICAgICBjb25zdCBwcmVmaXggPSB0ZXN0LnN1YnN0cmluZyg3KTtcbiAgICAgICAgbmV3IE5vdGljZSh2YWx1ZS5zdGFydHNXaXRoKHByZWZpeClcbiAgICAgICAgICA/IGAke2xhYmVsfTogJHt2YWx1ZX0gXFx1MjcxM2BcbiAgICAgICAgICA6IGAke2xhYmVsfTogZXhwZWN0ZWQgJHtwcmVmaXh9IHByZWZpeGApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1MjUwMFx1MjUwMCBsb2NhbC11cmw6IHRlc3QgbG9jYWwgc2VydmljZSBjb25uZWN0aXZpdHkgXHUyNTAwXHUyNTAwXG4gICAgICBpZiAodGVzdCA9PT0gXCJsb2NhbC11cmxcIikge1xuICAgICAgICBsZXQgdXJsID0gdmFsdWU7XG4gICAgICAgIC8vIFFkcmFudCBoYXMgL2hlYWx0aHpcbiAgICAgICAgaWYgKGtleU5hbWUgPT09IFwiUURSQU5UX1VSTFwiKSB1cmwgPSB2YWx1ZS5yZXBsYWNlKC9cXC8kLywgXCJcIikgKyBcIi9oZWFsdGh6XCI7XG4gICAgICAgIC8vIEVtYmVkZGluZyBzZXJ2ZXI6IHN0cmlwIC92MS9lbWJlZGRpbmdzLCB0cnkgYmFzZVxuICAgICAgICBlbHNlIGlmIChrZXlOYW1lID09PSBcIkVNQkVERElOR19BUElfVVJMXCIpIHVybCA9IHZhbHVlLnJlcGxhY2UoL1xcL3YxXFwvZW1iZWRkaW5nc1xcLz8kLywgXCJcIik7XG4gICAgICAgIC8vIE5lbzRqIEhUVFA6IHRlc3Qgcm9vdFxuICAgICAgICAvLyBlbHNlIHVzZSB2YWx1ZSBhcy1pc1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKHVybCk7XG4gICAgICAgICAgbmV3IE5vdGljZShgJHtsYWJlbH06IGNvbm5lY3RlZCAoJHtyZXNwLnN0YXR1c30pIFxcdTI3MTNgKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgY29uc3QgaGludCA9IGtleU5hbWUgPT09IFwiRU1CRURESU5HX0FQSV9VUkxcIlxuICAgICAgICAgICAgPyBcIiBcdTIwMTQgc3RhcnQgd2l0aDogLi9zY3JpcHRzL2VtYmVkZGluZy1zZXJ2ZXIuc2hcIlxuICAgICAgICAgICAgOiBrZXlOYW1lID09PSBcIlFEUkFOVF9VUkxcIlxuICAgICAgICAgICAgPyBcIiBcdTIwMTQgcnVuOiBkb2NrZXIgc3RhcnQgcWRyYW50LW5sclwiXG4gICAgICAgICAgICA6IGtleU5hbWUgPT09IFwiTkVPNEpfSFRUUF9VUkxcIlxuICAgICAgICAgICAgPyBcIiBcdTIwMTQgcnVuOiBkb2NrZXIgc3RhcnQgbmVvNGotbmxyXCJcbiAgICAgICAgICAgIDogXCJcIjtcbiAgICAgICAgICBuZXcgTm90aWNlKGAke2xhYmVsfTogbm90IHJlYWNoYWJsZSR7aGludH1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1MjUwMFx1MjUwMCBvcGVucm91dGVyOiBrbm93biB3b3JraW5nIHRlc3QgZW5kcG9pbnQgXHUyNTAwXHUyNTAwXG4gICAgICBpZiAodGVzdCA9PT0gXCJvcGVucm91dGVyXCIpIHtcbiAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKFwiaHR0cHM6Ly9vcGVucm91dGVyLmFpL2FwaS92MS9tb2RlbHNcIiwge1xuICAgICAgICAgIGhlYWRlcnM6IHsgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3ZhbHVlfWAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXNwLm9rKSB7XG4gICAgICAgICAgbmV3IE5vdGljZShgJHtsYWJlbH06IGNvbm5lY3RlZCBcXHUyNzEzYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3IE5vdGljZShgJHtsYWJlbH06IEhUVFAgJHtyZXNwLnN0YXR1c30gXHUyMDE0IGNoZWNrIHlvdXIga2V5IGF0IG9wZW5yb3V0ZXIuYWkvc2V0dGluZ3Mva2V5c2ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHUyNTAwXHUyNTAwIGZpcmVjcmF3bDogUE9TVC1vbmx5IEFQSSwgdGVzdCB3aXRoIGEgbWluaW1hbCBzY3JhcGUgXHUyNTAwXHUyNTAwXG4gICAgICBpZiAodGVzdCA9PT0gXCJmaXJlY3Jhd2xcIikge1xuICAgICAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goXCJodHRwczovL2FwaS5maXJlY3Jhd2wuZGV2L3YxL3NjcmFwZVwiLCB7XG4gICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7dmFsdWV9YCxcbiAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyB1cmw6IFwiaHR0cHM6Ly9leGFtcGxlLmNvbVwiLCBmb3JtYXRzOiBbXCJtYXJrZG93blwiXSwgb25seU1haW5Db250ZW50OiB0cnVlIH0pLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlc3Aub2sgfHwgcmVzcC5zdGF0dXMgPT09IDIwMCB8fCByZXNwLnN0YXR1cyA9PT0gMjAxKSB7XG4gICAgICAgICAgbmV3IE5vdGljZShgJHtsYWJlbH06IGNvbm5lY3RlZCBcXHUyNzEzYCk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzcC5zdGF0dXMgPT09IDQwMSB8fCByZXNwLnN0YXR1cyA9PT0gNDAzKSB7XG4gICAgICAgICAgbmV3IE5vdGljZShgJHtsYWJlbH06IGludmFsaWQga2V5ICgke3Jlc3Auc3RhdHVzfSlgKTtcbiAgICAgICAgfSBlbHNlIGlmIChyZXNwLnN0YXR1cyA9PT0gNDAyKSB7XG4gICAgICAgICAgbmV3IE5vdGljZShgJHtsYWJlbH06IGtleSB2YWxpZCBidXQgb3V0IG9mIGNyZWRpdHMgKCR7cmVzcC5zdGF0dXN9KWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ldyBOb3RpY2UoYCR7bGFiZWx9OiBIVFRQICR7cmVzcC5zdGF0dXN9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTI1MDBcdTI1MDAgbmdyb2s6IGNvbmZpZ3VyZSBhdXRoIHRva2VuIHZpYSBDTEkgXHUyNTAwXHUyNTAwXG4gICAgICBpZiAodGVzdCA9PT0gXCJuZ3Jva1wiKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgZXhlY0ZpbGVBc3luYyhcIm5ncm9rXCIsIFtcImNvbmZpZ1wiLCBcImFkZC1hdXRodG9rZW5cIiwgdmFsdWVdKTtcbiAgICAgICAgICBuZXcgTm90aWNlKGAke2xhYmVsfTogY29uZmlndXJlZCBcXHUyNzEzYCk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIC8vIG5ncm9rIG5vdCBvbiBFbGVjdHJvbiBQQVRILCB0cnkgY29tbW9uIGxvY2F0aW9uc1xuICAgICAgICAgIGNvbnN0IG5ncm9rUGF0aHMgPSBbXCIvdXNyL2xvY2FsL2Jpbi9uZ3Jva1wiLCBcIi9vcHQvaG9tZWJyZXcvYmluL25ncm9rXCJdO1xuICAgICAgICAgIGxldCBjb25maWd1cmVkID0gZmFsc2U7XG4gICAgICAgICAgZm9yIChjb25zdCBwIG9mIG5ncm9rUGF0aHMpIHtcbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHApKSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgZXhlY0ZpbGVBc3luYyhwLCBbXCJjb25maWdcIiwgXCJhZGQtYXV0aHRva2VuXCIsIHZhbHVlXSk7XG4gICAgICAgICAgICAgICAgbmV3IE5vdGljZShgJHtsYWJlbH06IGNvbmZpZ3VyZWQgXFx1MjcxM2ApO1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9IGNhdGNoIHsgLyogdHJ5IG5leHQgKi8gfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWNvbmZpZ3VyZWQpIHtcbiAgICAgICAgICAgIG5ldyBOb3RpY2UoYCR7bGFiZWx9OiBzYXZlZCBcdTIwMTQgcnVuIGluIHRlcm1pbmFsOiBuZ3JvayBjb25maWcgYWRkLWF1dGh0b2tlbiAke3ZhbHVlLnN1YnN0cmluZygwLCA4KX0uLi5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBuZXcgTm90aWNlKGAke2xhYmVsfTogc2F2ZWQgXFx1MjcxM2ApO1xuICAgIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICAgIGNvbnN0IGVyciA9IGUgYXMgRXJyb3I7XG4gICAgICBuZXcgTm90aWNlKGAke2xhYmVsfTogZXJyb3IgXHUyMDE0ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyB0ZXN0SGFybmVzc0Nvbm5lY3Rpb24oaGFybmVzczogSGFybmVzc0NvbmZpZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghaGFybmVzcy51cmwpIHtcbiAgICAgIG5ldyBOb3RpY2UoYCR7aGFybmVzcy5uYW1lfTogbm8gVVJMIGNvbmZpZ3VyZWRgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goaGFybmVzcy51cmwpO1xuICAgICAgbmV3IE5vdGljZShgJHtoYXJuZXNzLm5hbWV9OiAke3Jlc3BvbnNlLm9rID8gXCJPS1wiIDogcmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICAgIGNvbnN0IGVyciA9IGUgYXMgRXJyb3I7XG4gICAgICBuZXcgTm90aWNlKGAke2hhcm5lc3MubmFtZX06IHVucmVhY2hhYmxlIC0gJHtlcnIubWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNhdmVTZWNyZXRzRW52KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG5sclJvb3QgPSB0aGlzLnBsdWdpbi5zZXR0aW5ncy5ubHJSb290O1xuICAgIGlmICghbmxyUm9vdCkge1xuICAgICAgbmV3IE5vdGljZShcIk5MUiBSb290IHBhdGggbm90IHNldFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzZWNyZXRzRGlyID0gcGF0aC5qb2luKG5sclJvb3QsIFwic2VjcmV0c1wiKTtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoc2VjcmV0c0RpcikpIHtcbiAgICAgIGZzLm1rZGlyU3luYyhzZWNyZXRzRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBlbnZQYXRoID0gcGF0aC5qb2luKHNlY3JldHNEaXIsIFwiLmVudlwiKTtcbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXG4gICAgICBcIiMgbmV1cm8tbGluay1yZWN1cnNpdmUgc2VjcmV0c1wiLFxuICAgICAgYCMgR2VuZXJhdGVkIGJ5IE9ic2lkaWFuIHBsdWdpbiBhdCAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX1gLFxuICAgICAgXCJcIixcbiAgICBdO1xuXG4gICAgZm9yIChjb25zdCBkZWYgb2YgQVBJX0tFWV9ERUZTKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucGx1Z2luLnNldHRpbmdzLmFwaUtleXNbZGVmLmtleV0gfHwgXCJcIjtcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBsaW5lcy5wdXNoKGAke2RlZi5rZXl9PSR7dmFsdWV9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnMud3JpdGVGaWxlU3luYyhlbnZQYXRoLCBsaW5lcy5qb2luKFwiXFxuXCIpICsgXCJcXG5cIiwgXCJ1dGYtOFwiKTtcbiAgICBuZXcgTm90aWNlKGBTYXZlZCAke2xpbmVzLmxlbmd0aCAtIDN9IGtleXMgdG8gJHtlbnZQYXRofWApO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBsb2FkU2VjcmV0c0VudigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBubHJSb290ID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MubmxyUm9vdDtcbiAgICBpZiAoIW5sclJvb3QpIHtcbiAgICAgIG5ldyBOb3RpY2UoXCJOTFIgUm9vdCBwYXRoIG5vdCBzZXRcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZW52UGF0aCA9IHBhdGguam9pbihubHJSb290LCBcInNlY3JldHNcIiwgXCIuZW52XCIpO1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhlbnZQYXRoKSkge1xuICAgICAgbmV3IE5vdGljZShcInNlY3JldHMvLmVudiBub3QgZm91bmRcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhlbnZQYXRoLCBcInV0Zi04XCIpO1xuICAgIGxldCBsb2FkZWQgPSAwO1xuXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGNvbnRlbnQuc3BsaXQoXCJcXG5cIikpIHtcbiAgICAgIGNvbnN0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcbiAgICAgIGlmICghdHJpbW1lZCB8fCB0cmltbWVkLnN0YXJ0c1dpdGgoXCIjXCIpKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGVxSWR4ID0gdHJpbW1lZC5pbmRleE9mKFwiPVwiKTtcbiAgICAgIGlmIChlcUlkeCA9PT0gLTEpIGNvbnRpbnVlO1xuICAgICAgY29uc3Qga2V5ID0gdHJpbW1lZC5zdWJzdHJpbmcoMCwgZXFJZHgpLnRyaW0oKTtcbiAgICAgIGNvbnN0IHZhbHVlID0gdHJpbW1lZC5zdWJzdHJpbmcoZXFJZHggKyAxKS50cmltKCk7XG4gICAgICBpZiAoQVBJX0tFWV9ERUZTLnNvbWUoKGQpID0+IGQua2V5ID09PSBrZXkpKSB7XG4gICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmFwaUtleXNba2V5XSA9IHZhbHVlO1xuICAgICAgICBsb2FkZWQrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICBuZXcgTm90aWNlKGBMb2FkZWQgJHtsb2FkZWR9IGtleXMgZnJvbSBzZWNyZXRzLy5lbnZgKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbG9hZEhhcm5lc3Nlc0Zyb21Db25maWcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbmxyUm9vdCA9IHRoaXMucGx1Z2luLnNldHRpbmdzLm5sclJvb3Q7XG4gICAgaWYgKCFubHJSb290KSB7XG4gICAgICBuZXcgTm90aWNlKFwiTkxSIFJvb3QgcGF0aCBub3Qgc2V0XCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBwYXRoLmpvaW4obmxyUm9vdCwgXCJjb25maWdcIiwgXCJoYXJuZXNzLWhhcm5lc3MtY29tbXMubWRcIik7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGNvbmZpZ1BhdGgpKSB7XG4gICAgICBuZXcgTm90aWNlKFwiaGFybmVzcy1oYXJuZXNzLWNvbW1zLm1kIG5vdCBmb3VuZFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGNvbmZpZ1BhdGgsIFwidXRmLThcIik7XG4gICAgY29uc3QgZm1NYXRjaCA9IGNvbnRlbnQubWF0Y2goL14tLS1cXG4oW1xcc1xcU10qPylcXG4tLS0vKTtcbiAgICBpZiAoIWZtTWF0Y2gpIHtcbiAgICAgIG5ldyBOb3RpY2UoXCJObyBmcm9udG1hdHRlciBmb3VuZCBpbiBoYXJuZXNzIGNvbmZpZ1wiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmbSA9IGZtTWF0Y2hbMV07XG4gICAgY29uc3QgaGFybmVzc2VzOiBIYXJuZXNzQ29uZmlnW10gPSBbXTtcbiAgICBjb25zdCBoYXJuZXNzQmxvY2sgPSBmbS5tYXRjaCgvaGFybmVzc2VzOlxcbihbXFxzXFxTXSo/KSg/PXJvdXRpbmdfcnVsZXM6fCQpLyk7XG5cbiAgICBpZiAoaGFybmVzc0Jsb2NrKSB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gaGFybmVzc0Jsb2NrWzFdLm1hdGNoQWxsKFxuICAgICAgICAvXFxzezJ9KFxcUyspOlxcbihbXFxzXFxTXSo/KSg/PVxcblxcc3syfVxcUys6fFxcblthLXpdfCQpL2dcbiAgICAgICk7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGVudHJ5WzFdO1xuICAgICAgICBjb25zdCBibG9jayA9IGVudHJ5WzJdO1xuICAgICAgICBjb25zdCBnZXRWYWwgPSAoa2V5OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgICAgICAgIGNvbnN0IG0gPSBibG9jay5tYXRjaChuZXcgUmVnRXhwKGAke2tleX06XFxcXHMqKC4rKWApKTtcbiAgICAgICAgICByZXR1cm4gbSA/IG1bMV0udHJpbSgpIDogXCJcIjtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY2Fwc01hdGNoID0gYmxvY2subWF0Y2goL2NhcGFiaWxpdGllczpcXG4oKD86XFxzKy1cXHMrLitcXG4/KSopLyk7XG4gICAgICAgIGNvbnN0IGNhcGFiaWxpdGllcyA9IGNhcHNNYXRjaFxuICAgICAgICAgID8gY2Fwc01hdGNoWzFdXG4gICAgICAgICAgICAgIC5zcGxpdChcIlxcblwiKVxuICAgICAgICAgICAgICAubWFwKChsKSA9PiBsLnJlcGxhY2UoL15cXHMrLVxccysvLCBcIlwiKS50cmltKCkpXG4gICAgICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAgICAgICA6IFtdO1xuXG4gICAgICAgIGhhcm5lc3Nlcy5wdXNoKHtcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIHR5cGU6IGdldFZhbChcInR5cGVcIiksXG4gICAgICAgICAgc3RhdHVzOiBnZXRWYWwoXCJzdGF0dXNcIiksXG4gICAgICAgICAgdXJsOiBnZXRWYWwoXCJ1cmxcIikgfHwgXCJcIixcbiAgICAgICAgICBhcGlLZXlFbnY6IGdldFZhbChcImFwaV9rZXlfZW52XCIpLFxuICAgICAgICAgIHJvbGU6IGdldFZhbChcInJvbGVcIiksXG4gICAgICAgICAgY2FwYWJpbGl0aWVzLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5oYXJuZXNzZXMgPSBoYXJuZXNzZXM7XG4gICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgbmV3IE5vdGljZShgTG9hZGVkICR7aGFybmVzc2VzLmxlbmd0aH0gaGFybmVzc2VzIGZyb20gY29uZmlnYCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBNb2RhbCwgQXBwLCBTZXR0aW5nLCBOb3RpY2UsIFRleHRDb21wb25lbnQgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB0eXBlIE5MUlBsdWdpbiBmcm9tIFwiLi9tYWluXCI7XG5pbXBvcnQgeyBIYXJuZXNzU2V0dXBNb2RhbCB9IGZyb20gXCIuL2hhcm5lc3Mtc2V0dXBcIjtcbmltcG9ydCB7IE1jcFNldHVwTW9kYWwgfSBmcm9tIFwiLi9tY3Atc2V0dXBcIjtcbmltcG9ydCB7IEFwaVJvdXRlck1vZGFsIH0gZnJvbSBcIi4vYXBpLXJvdXRlclwiO1xuaW1wb3J0IHsgVklFV19UWVBFX0NIQVRCT1QgfSBmcm9tIFwiLi9jaGF0Ym90XCI7XG5pbXBvcnQgeyBWSUVXX1RZUEVfU1RBVFMgfSBmcm9tIFwiLi9zdGF0c1wiO1xuXG5mdW5jdGlvbiBzaG93UmVzdWx0TW9kYWwoYXBwOiBBcHAsIHRpdGxlOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBtb2RhbCA9IG5ldyBSZXN1bHRNb2RhbChhcHAsIHRpdGxlLCBjb250ZW50KTtcbiAgbW9kYWwub3BlbigpO1xufVxuXG5jbGFzcyBSZXN1bHRNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSB0aXRsZTogc3RyaW5nO1xuICBwcml2YXRlIGNvbnRlbnQ6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgdGl0bGU6IHN0cmluZywgY29udGVudDogc3RyaW5nKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICB0aGlzLnRpdGxlID0gdGl0bGU7XG4gICAgdGhpcy5jb250ZW50ID0gY29udGVudDtcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IHRoaXMudGl0bGUgfSk7XG4gICAgY29uc3QgcHJlID0gY29udGVudEVsLmNyZWF0ZUVsKFwicHJlXCIsIHsgY2xzOiBcIm5sci1yZXN1bHQtcHJlXCIgfSk7XG4gICAgcHJlLmNyZWF0ZUVsKFwiY29kZVwiLCB7IHRleHQ6IHRoaXMuY29udGVudCB9KTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuXG5jbGFzcyBTZWFyY2hNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBwbHVnaW46IE5MUlBsdWdpbjtcbiAgcHJpdmF0ZSBxdWVyeTogc3RyaW5nID0gXCJcIjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBOTFJQbHVnaW4pIHtcbiAgICBzdXBlcihhcHApO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJOTFIgV2lraSBTZWFyY2hcIiB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbCkuc2V0TmFtZShcIlF1ZXJ5XCIpLmFkZFRleHQoKHRleHQ6IFRleHRDb21wb25lbnQpID0+IHtcbiAgICAgIHRleHQuc2V0UGxhY2Vob2xkZXIoXCJTZWFyY2ggdGhlIHdpa2kuLi5cIikub25DaGFuZ2UoKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMucXVlcnkgPSB2YWx1ZTtcbiAgICAgIH0pO1xuICAgICAgdGV4dC5pbnB1dEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChlLmtleSA9PT0gXCJFbnRlclwiKSB7XG4gICAgICAgICAgdGhpcy5kb1NlYXJjaCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGV4dC5pbnB1dEVsLmZvY3VzKCksIDUwKTtcbiAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbCkuYWRkQnV0dG9uKChidG4pID0+XG4gICAgICBidG5cbiAgICAgICAgLnNldEJ1dHRvblRleHQoXCJTZWFyY2hcIilcbiAgICAgICAgLnNldEN0YSgpXG4gICAgICAgIC5vbkNsaWNrKCgpID0+IHRoaXMuZG9TZWFyY2goKSlcbiAgICApO1xuXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwiZGl2XCIsIHsgY2xzOiBcIm5sci1zZWFyY2gtcmVzdWx0c1wiLCBhdHRyOiB7IGlkOiBcIm5sci1zZWFyY2gtcmVzdWx0c1wiIH0gfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGRvU2VhcmNoKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5xdWVyeS50cmltKCkpIHJldHVybjtcblxuICAgIGNvbnN0IHJlc3VsdHNFbCA9IHRoaXMuY29udGVudEVsLnF1ZXJ5U2VsZWN0b3IoXCIjbmxyLXNlYXJjaC1yZXN1bHRzXCIpO1xuICAgIGlmICghcmVzdWx0c0VsKSByZXR1cm47XG4gICAgcmVzdWx0c0VsLmVtcHR5KCk7XG4gICAgcmVzdWx0c0VsLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IFwiU2VhcmNoaW5nLi4uXCIgfSk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5wbHVnaW4ucnVuTmxyQ29tbWFuZChbXCJzZWFyY2hcIiwgdGhpcy5xdWVyeV0pO1xuICAgICAgcmVzdWx0c0VsLmVtcHR5KCk7XG4gICAgICBjb25zdCBwcmUgPSByZXN1bHRzRWwuY3JlYXRlRWwoXCJwcmVcIiwgeyBjbHM6IFwibmxyLXJlc3VsdC1wcmVcIiB9KTtcbiAgICAgIHByZS5jcmVhdGVFbChcImNvZGVcIiwgeyB0ZXh0OiByZXN1bHQgfHwgXCJObyByZXN1bHRzIGZvdW5kXCIgfSk7XG4gICAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgICAgY29uc3QgZXJyID0gZSBhcyBFcnJvcjtcbiAgICAgIHJlc3VsdHNFbC5lbXB0eSgpO1xuICAgICAgcmVzdWx0c0VsLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IGBFcnJvcjogJHtlcnIubWVzc2FnZX1gLCBjbHM6IFwibmxyLWVycm9yXCIgfSk7XG4gICAgfVxuICB9XG5cbiAgb25DbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG59XG5cbmNsYXNzIENyZWF0ZVRhc2tNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBwbHVnaW46IE5MUlBsdWdpbjtcbiAgcHJpdmF0ZSB0YXNrVHlwZTogc3RyaW5nID0gXCJjdXJhdGVcIjtcbiAgcHJpdmF0ZSB0YXNrUHJpb3JpdHk6IHN0cmluZyA9IFwiM1wiO1xuICBwcml2YXRlIHRhc2tEZXNjcmlwdGlvbjogc3RyaW5nID0gXCJcIjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBOTFJQbHVnaW4pIHtcbiAgICBzdXBlcihhcHApO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJDcmVhdGUgTkxSIFRhc2tcIiB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiVHlwZVwiKVxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wKSA9PlxuICAgICAgICBkcm9wXG4gICAgICAgICAgLmFkZE9wdGlvbihcImluZ2VzdFwiLCBcIkluZ2VzdFwiKVxuICAgICAgICAgIC5hZGRPcHRpb24oXCJjdXJhdGVcIiwgXCJDdXJhdGVcIilcbiAgICAgICAgICAuYWRkT3B0aW9uKFwic2NhblwiLCBcIlNjYW5cIilcbiAgICAgICAgICAuYWRkT3B0aW9uKFwicmVwYWlyXCIsIFwiUmVwYWlyXCIpXG4gICAgICAgICAgLmFkZE9wdGlvbihcInJlcG9ydFwiLCBcIlJlcG9ydFwiKVxuICAgICAgICAgIC5hZGRPcHRpb24oXCJvbnRvbG9neVwiLCBcIk9udG9sb2d5XCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMudGFza1R5cGUpXG4gICAgICAgICAgLm9uQ2hhbmdlKCh2KSA9PiB7IHRoaXMudGFza1R5cGUgPSB2OyB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiUHJpb3JpdHlcIilcbiAgICAgIC5zZXREZXNjKFwiMSAoaGlnaGVzdCkgdG8gNSAobG93ZXN0KVwiKVxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wKSA9PlxuICAgICAgICBkcm9wXG4gICAgICAgICAgLmFkZE9wdGlvbihcIjFcIiwgXCIxIC0gQ3JpdGljYWxcIilcbiAgICAgICAgICAuYWRkT3B0aW9uKFwiMlwiLCBcIjIgLSBIaWdoXCIpXG4gICAgICAgICAgLmFkZE9wdGlvbihcIjNcIiwgXCIzIC0gTm9ybWFsXCIpXG4gICAgICAgICAgLmFkZE9wdGlvbihcIjRcIiwgXCI0IC0gTG93XCIpXG4gICAgICAgICAgLmFkZE9wdGlvbihcIjVcIiwgXCI1IC0gQmFja2dyb3VuZFwiKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnRhc2tQcmlvcml0eSlcbiAgICAgICAgICAub25DaGFuZ2UoKHYpID0+IHsgdGhpcy50YXNrUHJpb3JpdHkgPSB2OyB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiRGVzY3JpcHRpb25cIilcbiAgICAgIC5hZGRUZXh0QXJlYSgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkRlc2NyaWJlIHRoZSB0YXNrLi4uXCIpXG4gICAgICAgICAgLm9uQ2hhbmdlKCh2KSA9PiB7IHRoaXMudGFza0Rlc2NyaXB0aW9uID0gdjsgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgYnRuXG4gICAgICAgIC5zZXRCdXR0b25UZXh0KFwiQ3JlYXRlXCIpXG4gICAgICAgIC5zZXRDdGEoKVxuICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVUYXNrKCk7XG4gICAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY3JlYXRlVGFzaygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMudGFza0Rlc2NyaXB0aW9uLnRyaW0oKSkge1xuICAgICAgbmV3IE5vdGljZShcIlRhc2sgZGVzY3JpcHRpb24gcmVxdWlyZWRcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnBsdWdpbi5ydW5ObHJDb21tYW5kKFtcbiAgICAgICAgXCJ0YXNrc1wiLFxuICAgICAgICBcImNyZWF0ZVwiLFxuICAgICAgICBcIi0tdHlwZVwiLFxuICAgICAgICB0aGlzLnRhc2tUeXBlLFxuICAgICAgICBcIi0tcHJpb3JpdHlcIixcbiAgICAgICAgdGhpcy50YXNrUHJpb3JpdHksXG4gICAgICAgIFwiLS1kZXNjXCIsXG4gICAgICAgIHRoaXMudGFza0Rlc2NyaXB0aW9uLFxuICAgICAgXSk7XG4gICAgICBuZXcgTm90aWNlKFwiVGFzayBjcmVhdGVkXCIpO1xuICAgICAgc2hvd1Jlc3VsdE1vZGFsKHRoaXMuYXBwLCBcIlRhc2sgQ3JlYXRlZFwiLCByZXN1bHQpO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICAgIGNvbnN0IGVyciA9IGUgYXMgRXJyb3I7XG4gICAgICBuZXcgTm90aWNlKGBGYWlsZWQ6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgb25DbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckNvbW1hbmRzKHBsdWdpbjogTkxSUGx1Z2luKTogdm9pZCB7XG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogXCJubHItY2hlY2stc3RhdHVzXCIsXG4gICAgbmFtZTogXCJOZXVyby1MaW5rOiBDaGVjayBTdGF0dXNcIixcbiAgICBjYWxsYmFjazogYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGx1Z2luLnJ1bk5sckNvbW1hbmQoW1wic3RhdHVzXCJdKTtcbiAgICAgICAgc2hvd1Jlc3VsdE1vZGFsKHBsdWdpbi5hcHAsIFwiTkxSIFN0YXR1c1wiLCByZXN1bHQpO1xuICAgICAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgICAgICBjb25zdCBlcnIgPSBlIGFzIEVycm9yO1xuICAgICAgICBuZXcgTm90aWNlKGBOTFIgc3RhdHVzIGZhaWxlZDogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KTtcblxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6IFwibmxyLXJ1bi1icmFpbi1zY2FuXCIsXG4gICAgbmFtZTogXCJOZXVyby1MaW5rOiBSdW4gQnJhaW4gU2NhblwiLFxuICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICBuZXcgTm90aWNlKFwiUnVubmluZyBicmFpbiBzY2FuLi4uXCIpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGx1Z2luLnJ1bk5sckNvbW1hbmQoW1wic2NhblwiXSk7XG4gICAgICAgIHNob3dSZXN1bHRNb2RhbChwbHVnaW4uYXBwLCBcIkJyYWluIFNjYW4gUmVzdWx0c1wiLCByZXN1bHQpO1xuICAgICAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgICAgICBjb25zdCBlcnIgPSBlIGFzIEVycm9yO1xuICAgICAgICBuZXcgTm90aWNlKGBCcmFpbiBzY2FuIGZhaWxlZDogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KTtcblxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6IFwibmxyLWluZ2VzdC1jdXJyZW50LW5vdGVcIixcbiAgICBuYW1lOiBcIk5ldXJvLUxpbms6IEluZ2VzdCBDdXJyZW50IE5vdGVcIixcbiAgICBjYWxsYmFjazogYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgYWN0aXZlRmlsZSA9IHBsdWdpbi5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICAgIGlmICghYWN0aXZlRmlsZSkge1xuICAgICAgICBuZXcgTm90aWNlKFwiTm8gYWN0aXZlIGZpbGVcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gYWN0aXZlRmlsZS5wYXRoO1xuICAgICAgbmV3IE5vdGljZShgSW5nZXN0aW5nICR7ZmlsZVBhdGh9Li4uYCk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB2YXVsdFBhdGggPSBwbHVnaW4uc2V0dGluZ3MudmF1bHRQYXRoO1xuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHZhdWx0UGF0aCA/IGAke3ZhdWx0UGF0aH0vJHtmaWxlUGF0aH1gIDogZmlsZVBhdGg7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBsdWdpbi5ydW5ObHJDb21tYW5kKFtcImluZ2VzdFwiLCBmdWxsUGF0aF0pO1xuICAgICAgICBuZXcgTm90aWNlKFwiSW5nZXN0aW9uIGNvbXBsZXRlXCIpO1xuICAgICAgICBzaG93UmVzdWx0TW9kYWwocGx1Z2luLmFwcCwgXCJJbmdlc3QgUmVzdWx0XCIsIHJlc3VsdCk7XG4gICAgICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IGVyciA9IGUgYXMgRXJyb3I7XG4gICAgICAgIG5ldyBOb3RpY2UoYEluZ2VzdCBmYWlsZWQ6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSk7XG5cbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiBcIm5sci1zZWFyY2gtd2lraVwiLFxuICAgIG5hbWU6IFwiTmV1cm8tTGluazogU2VhcmNoIFdpa2lcIixcbiAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgbmV3IFNlYXJjaE1vZGFsKHBsdWdpbi5hcHAsIHBsdWdpbikub3BlbigpO1xuICAgIH0sXG4gIH0pO1xuXG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogXCJubHItbGlzdC10YXNrc1wiLFxuICAgIG5hbWU6IFwiTmV1cm8tTGluazogTGlzdCBUYXNrc1wiLFxuICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwbHVnaW4ucnVuTmxyQ29tbWFuZChbXCJ0YXNrc1wiXSk7XG4gICAgICAgIHNob3dSZXN1bHRNb2RhbChwbHVnaW4uYXBwLCBcIk5MUiBUYXNrc1wiLCByZXN1bHQpO1xuICAgICAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgICAgICBjb25zdCBlcnIgPSBlIGFzIEVycm9yO1xuICAgICAgICBuZXcgTm90aWNlKGBMaXN0IHRhc2tzIGZhaWxlZDogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KTtcblxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6IFwibmxyLWNyZWF0ZS10YXNrXCIsXG4gICAgbmFtZTogXCJOZXVyby1MaW5rOiBDcmVhdGUgVGFza1wiLFxuICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICBuZXcgQ3JlYXRlVGFza01vZGFsKHBsdWdpbi5hcHAsIHBsdWdpbikub3BlbigpO1xuICAgIH0sXG4gIH0pO1xuXG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogXCJubHItcnVuLWhlYXJ0YmVhdFwiLFxuICAgIG5hbWU6IFwiTmV1cm8tTGluazogUnVuIEhlYXJ0YmVhdFwiLFxuICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwbHVnaW4ucnVuTmxyQ29tbWFuZChbXCJoZWFydGJlYXRcIl0pO1xuICAgICAgICBuZXcgTm90aWNlKFwiSGVhcnRiZWF0IHNlbnRcIik7XG4gICAgICAgIHNob3dSZXN1bHRNb2RhbChwbHVnaW4uYXBwLCBcIkhlYXJ0YmVhdFwiLCByZXN1bHQpO1xuICAgICAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgICAgICBjb25zdCBlcnIgPSBlIGFzIEVycm9yO1xuICAgICAgICBuZXcgTm90aWNlKGBIZWFydGJlYXQgZmFpbGVkOiAke2Vyci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xuXG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogXCJubHItc3RhcnQtc2VydmVyLXR1bm5lbFwiLFxuICAgIG5hbWU6IFwiTmV1cm8tTGluazogU3RhcnQgU2VydmVyIHdpdGggVHVubmVsXCIsXG4gICAgY2FsbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgIG5ldyBOb3RpY2UoXCJTdGFydGluZyBzZXJ2ZXIgd2l0aCB0dW5uZWwuLi5cIik7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwbHVnaW4ucnVuTmxyQ29tbWFuZChbXCJzZXJ2ZVwiLCBcIi0tdHVubmVsXCIsIFwiLS10b2tlblwiLCBcImF1dG9cIl0pO1xuICAgICAgICBzaG93UmVzdWx0TW9kYWwocGx1Z2luLmFwcCwgXCJTZXJ2ZXIgKyBUdW5uZWxcIiwgcmVzdWx0KTtcbiAgICAgIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgZXJyID0gZSBhcyBFcnJvcjtcbiAgICAgICAgbmV3IE5vdGljZShgU2VydmVyIHN0YXJ0IGZhaWxlZDogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KTtcblxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6IFwibmxyLXJlYnVpbGQtcmFnLWluZGV4XCIsXG4gICAgbmFtZTogXCJOZXVyby1MaW5rOiBSZWJ1aWxkIFJBRyBJbmRleFwiLFxuICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICBuZXcgTm90aWNlKFwiUmVidWlsZGluZyBSQUcgaW5kZXguLi5cIik7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwbHVnaW4ucnVuTmxyQ29tbWFuZChbXCJyYWctcmVidWlsZFwiXSk7XG4gICAgICAgIG5ldyBOb3RpY2UoXCJSQUcgaW5kZXggcmVidWlsdFwiKTtcbiAgICAgICAgc2hvd1Jlc3VsdE1vZGFsKHBsdWdpbi5hcHAsIFwiUkFHIFJlYnVpbGRcIiwgcmVzdWx0KTtcbiAgICAgIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgZXJyID0gZSBhcyBFcnJvcjtcbiAgICAgICAgbmV3IE5vdGljZShgUkFHIHJlYnVpbGQgZmFpbGVkOiAke2Vyci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xuXG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogXCJubHItZ3JhZGUtc2Vzc2lvblwiLFxuICAgIG5hbWU6IFwiTmV1cm8tTGluazogR3JhZGUgU2Vzc2lvblwiLFxuICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICBuZXcgTm90aWNlKFwiR3JhZGluZyBzZXNzaW9uLi4uXCIpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGx1Z2luLnJ1bk5sckNvbW1hbmQoW1wiZ3JhZGVcIiwgXCItLXNlc3Npb25cIl0pO1xuICAgICAgICBzaG93UmVzdWx0TW9kYWwocGx1Z2luLmFwcCwgXCJTZXNzaW9uIEdyYWRlXCIsIHJlc3VsdCk7XG4gICAgICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IGVyciA9IGUgYXMgRXJyb3I7XG4gICAgICAgIG5ldyBOb3RpY2UoYEdyYWRpbmcgZmFpbGVkOiAke2Vyci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xuXG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogXCJubHItb3Blbi1oYXJuZXNzLXNldHVwXCIsXG4gICAgbmFtZTogXCJOZXVyby1MaW5rOiBPcGVuIEhhcm5lc3MgU2V0dXBcIixcbiAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgbmV3IEhhcm5lc3NTZXR1cE1vZGFsKHBsdWdpbi5hcHAsIHBsdWdpbikub3BlbigpO1xuICAgIH0sXG4gIH0pO1xuXG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogXCJubHItb3Blbi1tY3Atc2V0dXBcIixcbiAgICBuYW1lOiBcIk5ldXJvLUxpbms6IE9wZW4gTUNQIFNldHVwXCIsXG4gICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgIG5ldyBNY3BTZXR1cE1vZGFsKHBsdWdpbi5hcHAsIHBsdWdpbikub3BlbigpO1xuICAgIH0sXG4gIH0pO1xuXG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogXCJubHItb3Blbi1hcGktcm91dGVyXCIsXG4gICAgbmFtZTogXCJOZXVyby1MaW5rOiBPcGVuIEFQSSBSb3V0ZXJcIixcbiAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgbmV3IEFwaVJvdXRlck1vZGFsKHBsdWdpbi5hcHAsIHBsdWdpbikub3BlbigpO1xuICAgIH0sXG4gIH0pO1xuXG4gIHBsdWdpbi5hZGRDb21tYW5kKHtcbiAgICBpZDogXCJubHItb3Blbi1jaGF0Ym90XCIsXG4gICAgbmFtZTogXCJOZXVyby1MaW5rOiBPcGVuIENoYXRib3RcIixcbiAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgcGx1Z2luLmFjdGl2YXRlVmlldyhWSUVXX1RZUEVfQ0hBVEJPVCk7XG4gICAgfSxcbiAgfSk7XG5cbiAgcGx1Z2luLmFkZENvbW1hbmQoe1xuICAgIGlkOiBcIm5sci1vcGVuLXN0YXRzXCIsXG4gICAgbmFtZTogXCJOZXVyby1MaW5rOiBPcGVuIFN0YXRzXCIsXG4gICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgIHBsdWdpbi5hY3RpdmF0ZVZpZXcoVklFV19UWVBFX1NUQVRTKTtcbiAgICB9LFxuICB9KTtcblxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6IFwibmxyLXNlc3Npb25zLXBhcnNlXCIsXG4gICAgbmFtZTogXCJOZXVyby1MaW5rOiBQYXJzZSBDbGF1ZGUgQ29kZSBTZXNzaW9uc1wiLFxuICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICBuZXcgTm90aWNlKFwiUGFyc2luZyBDbGF1ZGUgQ29kZSBzZXNzaW9ucy4uLlwiKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBsdWdpbi5ydW5ObHJDb21tYW5kKFtcInNlc3Npb25zXCIsIFwicGFyc2VcIl0pO1xuICAgICAgICBzaG93UmVzdWx0TW9kYWwocGx1Z2luLmFwcCwgXCJTZXNzaW9uIFBhcnNlXCIsIHJlc3VsdCk7XG4gICAgICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnN0IGVyciA9IGUgYXMgRXJyb3I7XG4gICAgICAgIG5ldyBOb3RpY2UoYFBhcnNlIGZhaWxlZDogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KTtcblxuICBwbHVnaW4uYWRkQ29tbWFuZCh7XG4gICAgaWQ6IFwibmxyLXNlc3Npb25zLXNjYW5cIixcbiAgICBuYW1lOiBcIk5ldXJvLUxpbms6IFNjYW4gU2Vzc2lvbiBRdWFsaXR5XCIsXG4gICAgY2FsbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgIG5ldyBOb3RpY2UoXCJTY2FubmluZyBzZXNzaW9uIHF1YWxpdHkuLi5cIik7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwbHVnaW4ucnVuTmxyQ29tbWFuZChbXCJzZXNzaW9uc1wiLCBcInNjYW5cIiwgXCItLWRheXNcIiwgXCI3XCJdKTtcbiAgICAgICAgc2hvd1Jlc3VsdE1vZGFsKHBsdWdpbi5hcHAsIFwiU2Vzc2lvbiBRdWFsaXR5IFNjYW5cIiwgcmVzdWx0KTtcbiAgICAgIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICAgICAgY29uc3QgZXJyID0gZSBhcyBFcnJvcjtcbiAgICAgICAgbmV3IE5vdGljZShgU2NhbiBmYWlsZWQ6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSk7XG59XG4iLCAiaW1wb3J0IHsgTW9kYWwsIEFwcCwgU2V0dGluZywgTm90aWNlLCBEcm9wZG93bkNvbXBvbmVudCB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHR5cGUgTkxSUGx1Z2luIGZyb20gXCIuL21haW5cIjtcbmltcG9ydCB0eXBlIHsgSGFybmVzc0NvbmZpZyB9IGZyb20gXCIuL3NldHRpbmdzXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGNsYXNzIEhhcm5lc3NTZXR1cE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBwcml2YXRlIHBsdWdpbjogTkxSUGx1Z2luO1xuICBwcml2YXRlIGhhcm5lc3M6IEhhcm5lc3NDb25maWc7XG4gIHByaXZhdGUgaXNOZXc6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogTkxSUGx1Z2luLCBoYXJuZXNzPzogSGFybmVzc0NvbmZpZykge1xuICAgIHN1cGVyKGFwcCk7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gICAgdGhpcy5pc05ldyA9ICFoYXJuZXNzO1xuICAgIHRoaXMuaGFybmVzcyA9IGhhcm5lc3NcbiAgICAgID8geyAuLi5oYXJuZXNzIH1cbiAgICAgIDoge1xuICAgICAgICAgIG5hbWU6IFwiXCIsXG4gICAgICAgICAgdHlwZTogXCJhcGlcIixcbiAgICAgICAgICBzdGF0dXM6IFwiZGlzYWJsZWRcIixcbiAgICAgICAgICB1cmw6IFwiXCIsXG4gICAgICAgICAgYXBpS2V5RW52OiBcIlwiLFxuICAgICAgICAgIHJvbGU6IFwiXCIsXG4gICAgICAgICAgY2FwYWJpbGl0aWVzOiBbXSxcbiAgICAgICAgfTtcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IHRoaXMuaXNOZXcgPyBcIkFkZCBIYXJuZXNzXCIgOiBgRWRpdDogJHt0aGlzLmhhcm5lc3MubmFtZX1gIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoXCJOYW1lXCIpXG4gICAgICAuc2V0RGVzYyhcIlVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGlzIGhhcm5lc3NcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwibXktaGFybmVzc1wiKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLmhhcm5lc3MubmFtZSlcbiAgICAgICAgICAub25DaGFuZ2UoKHYpID0+IHsgdGhpcy5oYXJuZXNzLm5hbWUgPSB2OyB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiVHlwZVwiKVxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wOiBEcm9wZG93bkNvbXBvbmVudCkgPT5cbiAgICAgICAgZHJvcFxuICAgICAgICAgIC5hZGRPcHRpb24oXCJsb2NhbFwiLCBcIkxvY2FsIENMSVwiKVxuICAgICAgICAgIC5hZGRPcHRpb24oXCJhcGlcIiwgXCJBUEkgKEhUVFApXCIpXG4gICAgICAgICAgLmFkZE9wdGlvbihcIm1jcFwiLCBcIk1DUCBTZXJ2ZXJcIilcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5oYXJuZXNzLnR5cGUpXG4gICAgICAgICAgLm9uQ2hhbmdlKCh2KSA9PiB7IHRoaXMuaGFybmVzcy50eXBlID0gdjsgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZShcIlN0YXR1c1wiKVxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wOiBEcm9wZG93bkNvbXBvbmVudCkgPT5cbiAgICAgICAgZHJvcFxuICAgICAgICAgIC5hZGRPcHRpb24oXCJhY3RpdmVcIiwgXCJBY3RpdmVcIilcbiAgICAgICAgICAuYWRkT3B0aW9uKFwiZGlzYWJsZWRcIiwgXCJEaXNhYmxlZFwiKVxuICAgICAgICAgIC5hZGRPcHRpb24oXCJlcnJvclwiLCBcIkVycm9yXCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMuaGFybmVzcy5zdGF0dXMpXG4gICAgICAgICAgLm9uQ2hhbmdlKCh2KSA9PiB7IHRoaXMuaGFybmVzcy5zdGF0dXMgPSB2OyB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiVVJMXCIpXG4gICAgICAuc2V0RGVzYyhcIkFQSSBlbmRwb2ludCBvciBNQ1Agc2VydmVyIFVSTCAobGVhdmUgZW1wdHkgZm9yIGxvY2FsIENMSSlcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiaHR0cDovL2xvY2FsaG9zdDo4MDAwXCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMuaGFybmVzcy51cmwpXG4gICAgICAgICAgLm9uQ2hhbmdlKCh2KSA9PiB7IHRoaXMuaGFybmVzcy51cmwgPSB2OyB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiQVBJIEtleSBFbnYgVmFyaWFibGVcIilcbiAgICAgIC5zZXREZXNjKFwiRW52aXJvbm1lbnQgdmFyaWFibGUgbmFtZSBmb3IgdGhlIEFQSSBrZXlcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiTVlfSEFSTkVTU19BUElfS0VZXCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMuaGFybmVzcy5hcGlLZXlFbnYpXG4gICAgICAgICAgLm9uQ2hhbmdlKCh2KSA9PiB7IHRoaXMuaGFybmVzcy5hcGlLZXlFbnYgPSB2OyB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiUm9sZVwiKVxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wOiBEcm9wZG93bkNvbXBvbmVudCkgPT5cbiAgICAgICAgZHJvcFxuICAgICAgICAgIC5hZGRPcHRpb24oXCJwcmltYXJ5XCIsIFwiUHJpbWFyeVwiKVxuICAgICAgICAgIC5hZGRPcHRpb24oXCJyZXNlYXJjaFwiLCBcIlJlc2VhcmNoXCIpXG4gICAgICAgICAgLmFkZE9wdGlvbihcImltcGxlbWVudGF0aW9uXCIsIFwiSW1wbGVtZW50YXRpb25cIilcbiAgICAgICAgICAuYWRkT3B0aW9uKFwicmV2aWV3XCIsIFwiUmV2aWV3XCIpXG4gICAgICAgICAgLmFkZE9wdGlvbihcIm1vbml0b3JpbmdcIiwgXCJNb25pdG9yaW5nXCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMuaGFybmVzcy5yb2xlIHx8IFwicmVzZWFyY2hcIilcbiAgICAgICAgICAub25DaGFuZ2UoKHYpID0+IHsgdGhpcy5oYXJuZXNzLnJvbGUgPSB2OyB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiQ2FwYWJpbGl0aWVzXCIpXG4gICAgICAuc2V0RGVzYyhcIkNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIGNhcGFiaWxpdGllc1wiKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJjb2RlX2dlbmVyYXRpb24sIHRlc3RpbmcsIHJldmlld1wiKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLmhhcm5lc3MuY2FwYWJpbGl0aWVzLmpvaW4oXCIsIFwiKSlcbiAgICAgICAgICAub25DaGFuZ2UoKHYpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaGFybmVzcy5jYXBhYmlsaXRpZXMgPSB2XG4gICAgICAgICAgICAgIC5zcGxpdChcIixcIilcbiAgICAgICAgICAgICAgLm1hcCgocykgPT4gcy50cmltKCkpXG4gICAgICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBjb25zdCBidG5Sb3cgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1tb2RhbC1idG4tcm93XCIgfSk7XG5cbiAgICBpZiAodGhpcy5oYXJuZXNzLnVybCkge1xuICAgICAgbmV3IFNldHRpbmcoYnRuUm93KS5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgICAgYnRuXG4gICAgICAgICAgLnNldEJ1dHRvblRleHQoXCJUZXN0IENvbm5lY3Rpb25cIilcbiAgICAgICAgICAuc2V0Q3RhKClcbiAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnRlc3RDb25uZWN0aW9uKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbmV3IFNldHRpbmcoYnRuUm93KS5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dChcIlNhdmVcIilcbiAgICAgICAgLnNldEN0YSgpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCB0aGlzLnNhdmUoKTtcbiAgICAgICAgfSlcbiAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoYnRuUm93KS5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dChcIlNhdmUgdG8gQ29uZmlnXCIpXG4gICAgICAgIC5zZXRXYXJuaW5nKClcbiAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZSgpO1xuICAgICAgICAgIGF3YWl0IHRoaXMud3JpdGVUb0NvbmZpZygpO1xuICAgICAgICB9KVxuICAgICk7XG5cbiAgICB0aGlzLnJlbmRlclJvdXRpbmdSdWxlcyhjb250ZW50RWwpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJSb3V0aW5nUnVsZXMoY29udGVudEVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcImg0XCIsIHsgdGV4dDogXCJSb3V0aW5nIFJ1bGVzXCIgfSk7XG5cbiAgICBjb25zdCBubHJSb290ID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MubmxyUm9vdDtcbiAgICBpZiAoIW5sclJvb3QpIHtcbiAgICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIlNldCBOTFIgUm9vdCB0byB2aWV3IHJvdXRpbmcgcnVsZXNcIiwgY2xzOiBcIm5sci1zdGF0cy1tdXRlZFwiIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBwYXRoLmpvaW4obmxyUm9vdCwgXCJjb25maWdcIiwgXCJoYXJuZXNzLWhhcm5lc3MtY29tbXMubWRcIik7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGNvbmZpZ1BhdGgpKSB7XG4gICAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogXCJoYXJuZXNzLWhhcm5lc3MtY29tbXMubWQgbm90IGZvdW5kXCIsIGNsczogXCJubHItc3RhdHMtbXV0ZWRcIiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGNvbmZpZ1BhdGgsIFwidXRmLThcIik7XG4gICAgY29uc3QgZm1NYXRjaCA9IGNvbnRlbnQubWF0Y2goL14tLS1cXG4oW1xcc1xcU10qPylcXG4tLS0vKTtcbiAgICBpZiAoIWZtTWF0Y2gpIHJldHVybjtcblxuICAgIGNvbnN0IHJ1bGVzTWF0Y2ggPSBmbU1hdGNoWzFdLm1hdGNoKC9yb3V0aW5nX3J1bGVzOlxcbihbXFxzXFxTXSo/KSQvKTtcbiAgICBpZiAoIXJ1bGVzTWF0Y2gpIHJldHVybjtcblxuICAgIGNvbnN0IHJ1bGVzOiBBcnJheTx7IHBhdHRlcm46IHN0cmluZzsgcm91dGVfdG86IHN0cmluZyB9PiA9IFtdO1xuICAgIGNvbnN0IHJ1bGVFbnRyaWVzID0gcnVsZXNNYXRjaFsxXS5tYXRjaEFsbCgvLSBwYXR0ZXJuOlxccypcIihbXlwiXSspXCJcXG5cXHMrcm91dGVfdG86XFxzKihcXFMrKS9nKTtcbiAgICBmb3IgKGNvbnN0IG0gb2YgcnVsZUVudHJpZXMpIHtcbiAgICAgIHJ1bGVzLnB1c2goeyBwYXR0ZXJuOiBtWzFdLCByb3V0ZV90bzogbVsyXSB9KTtcbiAgICB9XG5cbiAgICBpZiAocnVsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogXCJObyByb3V0aW5nIHJ1bGVzIGRlZmluZWRcIiwgY2xzOiBcIm5sci1zdGF0cy1tdXRlZFwiIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRhYmxlID0gY29udGVudEVsLmNyZWF0ZUVsKFwidGFibGVcIiwgeyBjbHM6IFwibmxyLXN0YXRzLXRhYmxlXCIgfSk7XG4gICAgY29uc3QgdGhlYWQgPSB0YWJsZS5jcmVhdGVFbChcInRoZWFkXCIpO1xuICAgIGNvbnN0IGhlYWRlclJvdyA9IHRoZWFkLmNyZWF0ZUVsKFwidHJcIik7XG4gICAgaGVhZGVyUm93LmNyZWF0ZUVsKFwidGhcIiwgeyB0ZXh0OiBcIlBhdHRlcm5cIiB9KTtcbiAgICBoZWFkZXJSb3cuY3JlYXRlRWwoXCJ0aFwiLCB7IHRleHQ6IFwiUm91dGUgVG9cIiB9KTtcblxuICAgIGNvbnN0IHRib2R5ID0gdGFibGUuY3JlYXRlRWwoXCJ0Ym9keVwiKTtcbiAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgcnVsZXMpIHtcbiAgICAgIGNvbnN0IHJvdyA9IHRib2R5LmNyZWF0ZUVsKFwidHJcIik7XG4gICAgICByb3cuY3JlYXRlRWwoXCJ0ZFwiLCB7IHRleHQ6IHJ1bGUucGF0dGVybiB9KTtcbiAgICAgIGNvbnN0IHJvdXRlQ2VsbCA9IHJvdy5jcmVhdGVFbChcInRkXCIsIHsgdGV4dDogcnVsZS5yb3V0ZV90byB9KTtcbiAgICAgIGlmIChydWxlLnJvdXRlX3RvID09PSB0aGlzLmhhcm5lc3MubmFtZSkge1xuICAgICAgICByb3V0ZUNlbGwuYWRkQ2xhc3MoXCJubHItc3RhdHMtaGlnaGxpZ2h0XCIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdGVzdENvbm5lY3Rpb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmhhcm5lc3MudXJsKSB7XG4gICAgICBuZXcgTm90aWNlKFwiTm8gVVJMIGNvbmZpZ3VyZWRcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHRoaXMuaGFybmVzcy51cmwpO1xuICAgICAgbmV3IE5vdGljZShgJHt0aGlzLmhhcm5lc3MubmFtZX06ICR7cmVzcG9uc2Uub2sgPyBcIkNvbm5lY3RlZFwiIDogYEhUVFAgJHtyZXNwb25zZS5zdGF0dXN9YH1gKTtcbiAgICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgICBjb25zdCBlcnIgPSBlIGFzIEVycm9yO1xuICAgICAgbmV3IE5vdGljZShgJHt0aGlzLmhhcm5lc3MubmFtZX06IHVucmVhY2hhYmxlIC0gJHtlcnIubWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNhdmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmhhcm5lc3MubmFtZSkge1xuICAgICAgbmV3IE5vdGljZShcIkhhcm5lc3MgbmFtZSBpcyByZXF1aXJlZFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBoYXJuZXNzZXMgPSB0aGlzLnBsdWdpbi5zZXR0aW5ncy5oYXJuZXNzZXM7XG4gICAgY29uc3QgZXhpc3RpbmdJZHggPSBoYXJuZXNzZXMuZmluZEluZGV4KChoKSA9PiBoLm5hbWUgPT09IHRoaXMuaGFybmVzcy5uYW1lKTtcbiAgICBpZiAoZXhpc3RpbmdJZHggPj0gMCkge1xuICAgICAgaGFybmVzc2VzW2V4aXN0aW5nSWR4XSA9IHsgLi4udGhpcy5oYXJuZXNzIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhcm5lc3Nlcy5wdXNoKHsgLi4udGhpcy5oYXJuZXNzIH0pO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgIG5ldyBOb3RpY2UoYEhhcm5lc3MgXCIke3RoaXMuaGFybmVzcy5uYW1lfVwiIHNhdmVkYCk7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyB3cml0ZVRvQ29uZmlnKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG5sclJvb3QgPSB0aGlzLnBsdWdpbi5zZXR0aW5ncy5ubHJSb290O1xuICAgIGlmICghbmxyUm9vdCkge1xuICAgICAgbmV3IE5vdGljZShcIk5MUiBSb290IG5vdCBzZXRcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IHBhdGguam9pbihubHJSb290LCBcImNvbmZpZ1wiLCBcImhhcm5lc3MtaGFybmVzcy1jb21tcy5tZFwiKTtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoY29uZmlnUGF0aCkpIHtcbiAgICAgIG5ldyBOb3RpY2UoXCJoYXJuZXNzLWhhcm5lc3MtY29tbXMubWQgbm90IGZvdW5kXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoY29uZmlnUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICBjb25zdCBmbU1hdGNoID0gY29udGVudC5tYXRjaCgvXi0tLVxcbihbXFxzXFxTXSo/KVxcbi0tLS8pO1xuICAgIGlmICghZm1NYXRjaCkge1xuICAgICAgbmV3IE5vdGljZShcIk5vIGZyb250bWF0dGVyIGZvdW5kIGluIGNvbmZpZ1wiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBoID0gdGhpcy5oYXJuZXNzO1xuICAgIGNvbnN0IHlhbWxCbG9jayA9IFtcbiAgICAgIGAgICR7aC5uYW1lfTpgLFxuICAgICAgYCAgICB0eXBlOiAke2gudHlwZX1gLFxuICAgICAgYCAgICBzdGF0dXM6ICR7aC5zdGF0dXN9YCxcbiAgICAgIGAgICAgcm9sZTogJHtoLnJvbGV9YCxcbiAgICBdO1xuICAgIGlmIChoLnVybCkgeWFtbEJsb2NrLnB1c2goYCAgICB1cmw6ICR7aC51cmx9YCk7XG4gICAgaWYgKGguYXBpS2V5RW52KSB5YW1sQmxvY2sucHVzaChgICAgIGFwaV9rZXlfZW52OiAke2guYXBpS2V5RW52fWApO1xuICAgIGlmIChoLmNhcGFiaWxpdGllcy5sZW5ndGggPiAwKSB7XG4gICAgICB5YW1sQmxvY2sucHVzaChcIiAgICBjYXBhYmlsaXRpZXM6XCIpO1xuICAgICAgZm9yIChjb25zdCBjYXAgb2YgaC5jYXBhYmlsaXRpZXMpIHtcbiAgICAgICAgeWFtbEJsb2NrLnB1c2goYCAgICAgIC0gJHtjYXB9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IG5ld0Jsb2NrID0geWFtbEJsb2NrLmpvaW4oXCJcXG5cIik7XG5cbiAgICBsZXQgZm0gPSBmbU1hdGNoWzFdO1xuICAgIGNvbnN0IGV4aXN0aW5nUGF0dGVybiA9IG5ldyBSZWdFeHAoYCAgJHtoLm5hbWV9OlxcXFxuKD86ICAgIC4rXFxcXG4pKmAsIFwiZ1wiKTtcbiAgICBpZiAoZXhpc3RpbmdQYXR0ZXJuLnRlc3QoZm0pKSB7XG4gICAgICBmbSA9IGZtLnJlcGxhY2UoZXhpc3RpbmdQYXR0ZXJuLCBuZXdCbG9jayArIFwiXFxuXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCByb3V0aW5nSWR4ID0gZm0uaW5kZXhPZihcInJvdXRpbmdfcnVsZXM6XCIpO1xuICAgICAgaWYgKHJvdXRpbmdJZHggPj0gMCkge1xuICAgICAgICBmbSA9IGZtLnN1YnN0cmluZygwLCByb3V0aW5nSWR4KSArIG5ld0Jsb2NrICsgXCJcXG5cIiArIGZtLnN1YnN0cmluZyhyb3V0aW5nSWR4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZtICs9IFwiXFxuXCIgKyBuZXdCbG9jaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBib2R5ID0gY29udGVudC5zdWJzdHJpbmcoZm1NYXRjaFswXS5sZW5ndGgpO1xuICAgIGZzLndyaXRlRmlsZVN5bmMoY29uZmlnUGF0aCwgYC0tLVxcbiR7Zm19XFxuLS0tJHtib2R5fWAsIFwidXRmLThcIik7XG4gICAgbmV3IE5vdGljZShgV3JpdHRlbiAke2gubmFtZX0gdG8gaGFybmVzcyBjb25maWdgKTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IE1vZGFsLCBBcHAsIFNldHRpbmcsIE5vdGljZSB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHR5cGUgTkxSUGx1Z2luIGZyb20gXCIuL21haW5cIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5leHBvcnQgY2xhc3MgTWNwU2V0dXBNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBwbHVnaW46IE5MUlBsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBOTFJQbHVnaW4pIHtcbiAgICBzdXBlcihhcHApO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5hZGRDbGFzcyhcIm5sci1tY3Atc2V0dXAtbW9kYWxcIik7XG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIk1DUCBTZXJ2ZXIgU2V0dXBcIiB9KTtcblxuICAgIHRoaXMucmVuZGVyU3RlcDEoY29udGVudEVsKTtcbiAgICB0aGlzLnJlbmRlclN0ZXAyKGNvbnRlbnRFbCk7XG4gICAgdGhpcy5yZW5kZXJTdGVwMyhjb250ZW50RWwpO1xuICAgIHRoaXMucmVuZGVyU3RlcDQoY29udGVudEVsKTtcbiAgICB0aGlzLnJlbmRlclN0ZXA1KGNvbnRlbnRFbCk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlclN0ZXAxKGNvbnRlbnRFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCBzZWN0aW9uID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJubHItc2V0dXAtc3RlcFwiIH0pO1xuICAgIHNlY3Rpb24uY3JlYXRlRWwoXCJoNFwiLCB7IHRleHQ6IFwiU3RlcCAxOiBJbnN0YWxsIE5MUiBCaW5hcnlcIiB9KTtcblxuICAgIGNvbnN0IG5sckJpbiA9IHRoaXMucGx1Z2luLnNldHRpbmdzLm5sckJpbmFyeVBhdGggfHwgXCJuZXVyby1saW5rXCI7XG4gICAgY29uc3Qgc3RhdHVzRWwgPSBzZWN0aW9uLmNyZWF0ZURpdih7IGNsczogXCJubHItc2V0dXAtc3RhdHVzXCIgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhzZWN0aW9uKVxuICAgICAgLnNldE5hbWUoXCJDaGVjayBJbnN0YWxsYXRpb25cIilcbiAgICAgIC5zZXREZXNjKGBDdXJyZW50IGJpbmFyeSBwYXRoOiAke25sckJpbn1gKVxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgICBidG5cbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dChcIlZlcmlmeVwiKVxuICAgICAgICAgIC5zZXRDdGEoKVxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnJ1bk5sckNvbW1hbmQoW1wiLS12ZXJzaW9uXCJdKTtcbiAgICAgICAgICAgICAgc3RhdHVzRWwuZW1wdHkoKTtcbiAgICAgICAgICAgICAgc3RhdHVzRWwuY3JlYXRlRWwoXCJzcGFuXCIsIHsgdGV4dDogXCJcXHUyNzEzIG5ldXJvLWxpbmsgYmluYXJ5IGZvdW5kXCIsIGNsczogXCJubHItc3RhdHMtc3VjY2Vzc1wiIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgIHN0YXR1c0VsLmVtcHR5KCk7XG4gICAgICAgICAgICAgIHN0YXR1c0VsLmNyZWF0ZUVsKFwic3BhblwiLCB7IHRleHQ6IFwiXFx1MjcxNyBuZXVyby1saW5rIGJpbmFyeSBub3QgZm91bmRcIiwgY2xzOiBcIm5sci1zdGF0cy1mYWlsdXJlXCIgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBjb25zdCBpbnN0YWxsSW5zdHJ1Y3Rpb25zID0gc2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6IFwibmxyLXNldHVwLWluc3RydWN0aW9uc1wiIH0pO1xuICAgIGluc3RhbGxJbnN0cnVjdGlvbnMuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogXCJJbnN0YWxsIHZpYSBDYXJnbzpcIiB9KTtcbiAgICBjb25zdCBjb2RlQmxvY2sgPSBpbnN0YWxsSW5zdHJ1Y3Rpb25zLmNyZWF0ZUVsKFwicHJlXCIsIHsgY2xzOiBcIm5sci1yZXN1bHQtcHJlXCIgfSk7XG4gICAgY29kZUJsb2NrLmNyZWF0ZUVsKFwiY29kZVwiLCB7XG4gICAgICB0ZXh0OiBcImNhcmdvIGluc3RhbGwgbmV1cm8tbGluay1tY3BcXG5cXG4jIE9yIGJ1aWxkIGZyb20gc291cmNlOlxcbmNkIHNlcnZlciAmJiBjYXJnbyBidWlsZCAtLXJlbGVhc2VcXG5jcCB0YXJnZXQvcmVsZWFzZS9uZXVyby1saW5rIH4vLmNhcmdvL2Jpbi9uZXVyby1saW5rXCIsXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlclN0ZXAyKGNvbnRlbnRFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCBzZWN0aW9uID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJubHItc2V0dXAtc3RlcFwiIH0pO1xuICAgIHNlY3Rpb24uY3JlYXRlRWwoXCJoNFwiLCB7IHRleHQ6IFwiU3RlcCAyOiBDb25maWd1cmUgQ2xhdWRlIENvZGUgTUNQIFNlcnZlclwiIH0pO1xuXG4gICAgY29uc3QgbmxyUm9vdCA9IHRoaXMucGx1Z2luLnNldHRpbmdzLm5sclJvb3QgfHwgXCIvcGF0aC90by9uZXVyby1saW5rLXJlY3Vyc2l2ZVwiO1xuICAgIGNvbnN0IG5sckJpbiA9IHRoaXMucGx1Z2luLnNldHRpbmdzLm5sckJpbmFyeVBhdGggfHwgXCJuZXVyby1saW5rXCI7XG5cbiAgICBjb25zdCBtY3BDb25maWcgPSBKU09OLnN0cmluZ2lmeShcbiAgICAgIHtcbiAgICAgICAgbWNwU2VydmVyczoge1xuICAgICAgICAgIFwibmV1cm8tbGluay1yZWN1cnNpdmVcIjoge1xuICAgICAgICAgICAgdHlwZTogXCJzdGRpb1wiLFxuICAgICAgICAgICAgY29tbWFuZDogbmxyQmluLFxuICAgICAgICAgICAgYXJnczogW1wibWNwXCJdLFxuICAgICAgICAgICAgZW52OiB7IE5MUl9ST09UOiBubHJSb290IH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBudWxsLFxuICAgICAgMlxuICAgICk7XG5cbiAgICBzZWN0aW9uLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IFwiQWRkIHRoaXMgdG8gfi8uY2xhdWRlLmpzb246XCIgfSk7XG4gICAgY29uc3QgY29kZUJsb2NrID0gc2VjdGlvbi5jcmVhdGVFbChcInByZVwiLCB7IGNsczogXCJubHItcmVzdWx0LXByZVwiIH0pO1xuICAgIGNvZGVCbG9jay5jcmVhdGVFbChcImNvZGVcIiwgeyB0ZXh0OiBtY3BDb25maWcgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhzZWN0aW9uKS5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dChcIkNvcHkgdG8gQ2xpcGJvYXJkXCIpXG4gICAgICAgIC5zZXRDdGEoKVxuICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQobWNwQ29uZmlnKTtcbiAgICAgICAgICBuZXcgTm90aWNlKFwiTUNQIGNvbmZpZyBjb3BpZWQgdG8gY2xpcGJvYXJkXCIpO1xuICAgICAgICB9KVxuICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhzZWN0aW9uKS5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dChcIkF1dG8tYWRkIHRvIH4vLmNsYXVkZS5qc29uXCIpXG4gICAgICAgIC5zZXRXYXJuaW5nKClcbiAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGF3YWl0IHRoaXMuYWRkVG9DbGF1ZGVKc29uKG5sckJpbiwgbmxyUm9vdCk7XG4gICAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyU3RlcDMoY29udGVudEVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IHNlY3Rpb24gPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1zZXR1cC1zdGVwXCIgfSk7XG4gICAgc2VjdGlvbi5jcmVhdGVFbChcImg0XCIsIHsgdGV4dDogXCJTdGVwIDM6IG1jcDJjbGktcnMgUHJvZmlsZVwiIH0pO1xuXG4gICAgc2VjdGlvbi5jcmVhdGVFbChcInBcIiwge1xuICAgICAgdGV4dDogXCJtY3AyY2xpLXJzIGNvbnZlcnRzIE1DUCB0b29sIGNhbGxzIHRvIENMSSBjb21tYW5kcy4gR2VuZXJhdGUgYSBwcm9maWxlIGZvciBOTFI6XCIsXG4gICAgfSk7XG5cbiAgICBjb25zdCBwcm9maWxlUGF0aCA9IHRoaXMucGx1Z2luLnNldHRpbmdzLm1jcDJjbGlQcm9maWxlUGF0aFxuICAgICAgfHwgcGF0aC5qb2luKHRoaXMucGx1Z2luLnNldHRpbmdzLm5sclJvb3QgfHwgXCJcIiwgXCJtY3AyY2xpLXByb2ZpbGUuanNvblwiKTtcblxuICAgIG5ldyBTZXR0aW5nKHNlY3Rpb24pXG4gICAgICAuc2V0TmFtZShcIlByb2ZpbGUgUGF0aFwiKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHQuc2V0VmFsdWUocHJvZmlsZVBhdGgpLnNldERpc2FibGVkKHRydWUpXG4gICAgICApO1xuXG4gICAgY29uc3Qgc3RhdHVzRWwgPSBzZWN0aW9uLmNyZWF0ZURpdih7IGNsczogXCJubHItc2V0dXAtc3RhdHVzXCIgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhzZWN0aW9uKS5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dChcIkdlbmVyYXRlIFByb2ZpbGVcIilcbiAgICAgICAgLnNldEN0YSgpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCB0aGlzLmdlbmVyYXRlTWNwMmNsaVByb2ZpbGUocHJvZmlsZVBhdGgpO1xuICAgICAgICAgIHN0YXR1c0VsLmVtcHR5KCk7XG4gICAgICAgICAgc3RhdHVzRWwuY3JlYXRlRWwoXCJzcGFuXCIsIHsgdGV4dDogXCJcXHUyNzEzIFByb2ZpbGUgZ2VuZXJhdGVkXCIsIGNsczogXCJubHItc3RhdHMtc3VjY2Vzc1wiIH0pO1xuICAgICAgICB9KVxuICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhzZWN0aW9uKS5hZGRCdXR0b24oKGJ0bikgPT5cbiAgICAgIGJ0blxuICAgICAgICAuc2V0QnV0dG9uVGV4dChcIlZpZXcgQ3VycmVudCBQcm9maWxlXCIpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhwcm9maWxlUGF0aCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMocHJvZmlsZVBhdGgsIFwidXRmLThcIik7XG4gICAgICAgICAgICBjb25zdCBwcmUgPSBzZWN0aW9uLmNyZWF0ZUVsKFwicHJlXCIsIHsgY2xzOiBcIm5sci1yZXN1bHQtcHJlXCIgfSk7XG4gICAgICAgICAgICBwcmUuY3JlYXRlRWwoXCJjb2RlXCIsIHsgdGV4dDogY29udGVudCB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3IE5vdGljZShcIlByb2ZpbGUgbm90IGZvdW5kIGF0IFwiICsgcHJvZmlsZVBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJTdGVwNChjb250ZW50RWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3Qgc2VjdGlvbiA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwibmxyLXNldHVwLXN0ZXBcIiB9KTtcbiAgICBzZWN0aW9uLmNyZWF0ZUVsKFwiaDRcIiwgeyB0ZXh0OiBcIlN0ZXAgNDogQ29ubmVjdCBFeHRlcm5hbCBNQ1AgQ2xpZW50c1wiIH0pO1xuXG4gICAgc2VjdGlvbi5jcmVhdGVFbChcInBcIiwge1xuICAgICAgdGV4dDogXCJUaGUgc2VydmVyIGF1dG8tc3RhcnRzIHdoZW4gdGhlIHBsdWdpbiBsb2Fkcy4gRXh0ZXJuYWwgTUNQIGNsaWVudHMgY29ubmVjdCB2aWEgSFRUUC5cIixcbiAgICB9KTtcblxuICAgIGNvbnN0IHBvcnQgPSB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcGlSb3V0ZXJQb3J0IHx8IDgwODA7XG5cbiAgICAvLyBSZWFkIHRva2VuIGZyb20gc2VjcmV0cy8uZW52XG4gICAgbGV0IHRva2VuID0gXCIobm90IHNldClcIjtcbiAgICBjb25zdCBubHJSb290ID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MubmxyUm9vdDtcbiAgICBpZiAobmxyUm9vdCkge1xuICAgICAgY29uc3QgZW52UGF0aCA9IHBhdGguam9pbihubHJSb290LCBcInNlY3JldHNcIiwgXCIuZW52XCIpO1xuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZW52UGF0aCkpIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhlbnZQYXRoLCBcInV0Zi04XCIpO1xuICAgICAgICBjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goL05MUl9BUElfVE9LRU49KC4rKS8pO1xuICAgICAgICBpZiAobWF0Y2gpIHRva2VuID0gbWF0Y2hbMV0udHJpbSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNlY3Rpb24uY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogYFNlcnZlcjogaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9YCB9KTtcbiAgICBzZWN0aW9uLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IGBUb2tlbjogJHt0b2tlbi5zdWJzdHJpbmcoMCwgOCl9Li4uYCB9KTtcblxuICAgIGNvbnN0IG1jcENsaWVudENvbmZpZyA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIG1jcFNlcnZlcnM6IHtcbiAgICAgICAgXCJuZXVyby1saW5rLXJlY3Vyc2l2ZVwiOiB7XG4gICAgICAgICAgdHlwZTogXCJodHRwXCIsXG4gICAgICAgICAgdXJsOiBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9L21jcGAsXG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3Rva2VufWAsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSwgbnVsbCwgMik7XG5cbiAgICBzZWN0aW9uLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IFwiRm9yIEhUVFAgTUNQIGNsaWVudHMgKGFkZCB0byB0aGVpciBjb25maWcpOlwiIH0pO1xuICAgIGNvbnN0IGNvZGVCbG9jayA9IHNlY3Rpb24uY3JlYXRlRWwoXCJwcmVcIiwgeyBjbHM6IFwibmxyLXJlc3VsdC1wcmVcIiB9KTtcbiAgICBjb2RlQmxvY2suY3JlYXRlRWwoXCJjb2RlXCIsIHsgdGV4dDogbWNwQ2xpZW50Q29uZmlnIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoc2VjdGlvbikuYWRkQnV0dG9uKChidG4pID0+XG4gICAgICBidG5cbiAgICAgICAgLnNldEJ1dHRvblRleHQoXCJDb3B5IE1DUCBDb25maWdcIilcbiAgICAgICAgLnNldEN0YSgpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChtY3BDbGllbnRDb25maWcpO1xuICAgICAgICAgIG5ldyBOb3RpY2UoXCJNQ1AgY2xpZW50IGNvbmZpZyBjb3BpZWQgdG8gY2xpcGJvYXJkXCIpO1xuICAgICAgICB9KVxuICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhzZWN0aW9uKVxuICAgICAgLnNldE5hbWUoXCJQb3J0XCIpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRWYWx1ZShTdHJpbmcocG9ydCkpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwID0gcGFyc2VJbnQodiwgMTApO1xuICAgICAgICAgICAgaWYgKCFpc05hTihwKSAmJiBwID4gMCAmJiBwIDwgNjU1MzYpIHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXBpUm91dGVyUG9ydCA9IHA7XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJTdGVwNShjb250ZW50RWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3Qgc2VjdGlvbiA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwibmxyLXNldHVwLXN0ZXBcIiB9KTtcbiAgICBzZWN0aW9uLmNyZWF0ZUVsKFwiaDRcIiwgeyB0ZXh0OiBcIlN0ZXAgNTogTmdyb2sgVHVubmVsIChPcHRpb25hbClcIiB9KTtcblxuICAgIHNlY3Rpb24uY3JlYXRlRWwoXCJwXCIsIHtcbiAgICAgIHRleHQ6IFwiRXhwb3NlIHRoZSBBUEkgcm91dGVyIG92ZXIgSFRUUFMgZm9yIHJlbW90ZSBoYXJuZXNzIGNvbW11bmljYXRpb24uXCIsXG4gICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhzZWN0aW9uKVxuICAgICAgLnNldE5hbWUoXCJOZ3JvayBEb21haW5cIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwieW91ci1kb21haW4ubmdyb2stZnJlZS5hcHBcIilcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mubmdyb2tEb21haW4pXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5uZ3Jva0RvbWFpbiA9IHY7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIGNvbnN0IG5ncm9rQ21kID0gdGhpcy5wbHVnaW4uc2V0dGluZ3Mubmdyb2tEb21haW5cbiAgICAgID8gYG5ncm9rIGh0dHAgJHt0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcGlSb3V0ZXJQb3J0fSAtLWRvbWFpbj0ke3RoaXMucGx1Z2luLnNldHRpbmdzLm5ncm9rRG9tYWlufWBcbiAgICAgIDogYG5ncm9rIGh0dHAgJHt0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcGlSb3V0ZXJQb3J0fWA7XG5cbiAgICBjb25zdCBwcmUgPSBzZWN0aW9uLmNyZWF0ZUVsKFwicHJlXCIsIHsgY2xzOiBcIm5sci1yZXN1bHQtcHJlXCIgfSk7XG4gICAgcHJlLmNyZWF0ZUVsKFwiY29kZVwiLCB7IHRleHQ6IG5ncm9rQ21kIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoc2VjdGlvbikuYWRkQnV0dG9uKChidG4pID0+XG4gICAgICBidG5cbiAgICAgICAgLnNldEJ1dHRvblRleHQoXCJDb3B5IENvbW1hbmRcIilcbiAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KG5ncm9rQ21kKTtcbiAgICAgICAgICBuZXcgTm90aWNlKFwiTmdyb2sgY29tbWFuZCBjb3BpZWRcIik7XG4gICAgICAgIH0pXG4gICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKHNlY3Rpb24pLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgYnRuXG4gICAgICAgIC5zZXRCdXR0b25UZXh0KFwiU3RhcnQgdmlhIE5MUlwiKVxuICAgICAgICAuc2V0Q3RhKClcbiAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnBsdWdpbi5ydW5ObHJDb21tYW5kKFtcIm5ncm9rXCJdKTtcbiAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJOZ3JvayBzdGFydGVkXCIpO1xuICAgICAgICAgICAgc2VjdGlvbi5jcmVhdGVFbChcInByZVwiLCB7IGNsczogXCJubHItcmVzdWx0LXByZVwiIH0pLmNyZWF0ZUVsKFwiY29kZVwiLCB7IHRleHQ6IHJlc3VsdCB9KTtcbiAgICAgICAgICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgICAgICAgICBjb25zdCBlcnIgPSBlIGFzIEVycm9yO1xuICAgICAgICAgICAgbmV3IE5vdGljZShgTmdyb2sgZmFpbGVkOiAke2Vyci5tZXNzYWdlfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBhZGRUb0NsYXVkZUpzb24obmxyQmluOiBzdHJpbmcsIG5sclJvb3Q6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGhvbWUgPSBwcm9jZXNzLmVudi5IT01FIHx8IHByb2Nlc3MuZW52LlVTRVJQUk9GSUxFIHx8IFwiXCI7XG4gICAgY29uc3QgY2xhdWRlSnNvblBhdGggPSBwYXRoLmpvaW4oaG9tZSwgXCIuY2xhdWRlLmpzb25cIik7XG5cbiAgICBsZXQgZXhpc3Rpbmc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoY2xhdWRlSnNvblBhdGgpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBleGlzdGluZyA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGNsYXVkZUpzb25QYXRoLCBcInV0Zi04XCIpKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICBuZXcgTm90aWNlKFwiRmFpbGVkIHRvIHBhcnNlIGV4aXN0aW5nIH4vLmNsYXVkZS5qc29uXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbWNwU2VydmVycyA9IChleGlzdGluZ1tcIm1jcFNlcnZlcnNcIl0gfHwge30pIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIG1jcFNlcnZlcnNbXCJuZXVyby1saW5rLXJlY3Vyc2l2ZVwiXSA9IHtcbiAgICAgIHR5cGU6IFwic3RkaW9cIixcbiAgICAgIGNvbW1hbmQ6IG5sckJpbixcbiAgICAgIGFyZ3M6IFtcIm1jcFwiXSxcbiAgICAgIGVudjogeyBOTFJfUk9PVDogbmxyUm9vdCB9LFxuICAgIH07XG4gICAgZXhpc3RpbmdbXCJtY3BTZXJ2ZXJzXCJdID0gbWNwU2VydmVycztcblxuICAgIGZzLndyaXRlRmlsZVN5bmMoY2xhdWRlSnNvblBhdGgsIEpTT04uc3RyaW5naWZ5KGV4aXN0aW5nLCBudWxsLCAyKSArIFwiXFxuXCIsIFwidXRmLThcIik7XG4gICAgbmV3IE5vdGljZShcIkFkZGVkIG5ldXJvLWxpbmstcmVjdXJzaXZlIHRvIH4vLmNsYXVkZS5qc29uXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBnZW5lcmF0ZU1jcDJjbGlQcm9maWxlKHByb2ZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwcm9maWxlID0ge1xuICAgICAgcHJvZmlsZTogXCJuZXVyby1saW5rLXJlY3Vyc2l2ZVwiLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIHRyYW5zcG9ydDoge1xuICAgICAgICB0eXBlOiBcInN0ZGlvXCIsXG4gICAgICAgIGNvbW1hbmQ6IHRoaXMucGx1Z2luLnNldHRpbmdzLm5sckJpbmFyeVBhdGggfHwgXCJubHJcIixcbiAgICAgICAgYXJnczogW1wibWNwXCJdLFxuICAgICAgfSxcbiAgICAgIHRvb2xzOiBbXG4gICAgICAgIHsgbWNwX25hbWU6IFwibmxyX3dpa2lfY3JlYXRlXCIsIGNsaV9uYW1lOiBcIndpa2ktY3JlYXRlXCIgfSxcbiAgICAgICAgeyBtY3BfbmFtZTogXCJubHJfd2lraV9yZWFkXCIsIGNsaV9uYW1lOiBcIndpa2ktcmVhZFwiIH0sXG4gICAgICAgIHsgbWNwX25hbWU6IFwibmxyX3dpa2lfdXBkYXRlXCIsIGNsaV9uYW1lOiBcIndpa2ktdXBkYXRlXCIgfSxcbiAgICAgICAgeyBtY3BfbmFtZTogXCJubHJfd2lraV9saXN0XCIsIGNsaV9uYW1lOiBcIndpa2ktbGlzdFwiIH0sXG4gICAgICAgIHsgbWNwX25hbWU6IFwibmxyX3dpa2lfc2VhcmNoXCIsIGNsaV9uYW1lOiBcIndpa2ktc2VhcmNoXCIgfSxcbiAgICAgICAgeyBtY3BfbmFtZTogXCJubHJfcmFnX3F1ZXJ5XCIsIGNsaV9uYW1lOiBcInJhZy1xdWVyeVwiIH0sXG4gICAgICAgIHsgbWNwX25hbWU6IFwibmxyX3JhZ19yZWJ1aWxkX2luZGV4XCIsIGNsaV9uYW1lOiBcInJhZy1yZWJ1aWxkXCIgfSxcbiAgICAgICAgeyBtY3BfbmFtZTogXCJubHJfb250b2xvZ3lfZ2VuZXJhdGVcIiwgY2xpX25hbWU6IFwib250b2xvZ3ktZ2VuZXJhdGVcIiB9LFxuICAgICAgICB7IG1jcF9uYW1lOiBcIm5scl9vbnRvbG9neV9xdWVyeVwiLCBjbGlfbmFtZTogXCJvbnRvbG9neS1xdWVyeVwiIH0sXG4gICAgICAgIHsgbWNwX25hbWU6IFwibmxyX29udG9sb2d5X2dhcHNcIiwgY2xpX25hbWU6IFwib250b2xvZ3ktZ2Fwc1wiIH0sXG4gICAgICAgIHsgbWNwX25hbWU6IFwibmxyX2luZ2VzdFwiLCBjbGlfbmFtZTogXCJpbmdlc3RcIiB9LFxuICAgICAgICB7IG1jcF9uYW1lOiBcIm5scl9pbmdlc3RfY2xhc3NpZnlcIiwgY2xpX25hbWU6IFwiaW5nZXN0LWNsYXNzaWZ5XCIgfSxcbiAgICAgICAgeyBtY3BfbmFtZTogXCJubHJfaW5nZXN0X2RlZHVwXCIsIGNsaV9uYW1lOiBcImluZ2VzdC1kZWR1cFwiIH0sXG4gICAgICAgIHsgbWNwX25hbWU6IFwibmxyX3Rhc2tfbGlzdFwiLCBjbGlfbmFtZTogXCJ0YXNrLWxpc3RcIiB9LFxuICAgICAgICB7IG1jcF9uYW1lOiBcIm5scl90YXNrX2NyZWF0ZVwiLCBjbGlfbmFtZTogXCJ0YXNrLWNyZWF0ZVwiIH0sXG4gICAgICAgIHsgbWNwX25hbWU6IFwibmxyX3Rhc2tfdXBkYXRlXCIsIGNsaV9uYW1lOiBcInRhc2stdXBkYXRlXCIgfSxcbiAgICAgICAgeyBtY3BfbmFtZTogXCJubHJfaGFybmVzc19kaXNwYXRjaFwiLCBjbGlfbmFtZTogXCJoYXJuZXNzLWRpc3BhdGNoXCIgfSxcbiAgICAgICAgeyBtY3BfbmFtZTogXCJubHJfaGFybmVzc19saXN0XCIsIGNsaV9uYW1lOiBcImhhcm5lc3MtbGlzdFwiIH0sXG4gICAgICAgIHsgbWNwX25hbWU6IFwibmxyX3NjYW5faGVhbHRoXCIsIGNsaV9uYW1lOiBcInNjYW4taGVhbHRoXCIgfSxcbiAgICAgICAgeyBtY3BfbmFtZTogXCJubHJfc2Nhbl9zdGFsZW5lc3NcIiwgY2xpX25hbWU6IFwic2Nhbi1zdGFsZW5lc3NcIiB9LFxuICAgICAgICB7IG1jcF9uYW1lOiBcIm5scl9zdGF0ZV9oZWFydGJlYXRcIiwgY2xpX25hbWU6IFwic3RhdGUtaGVhcnRiZWF0XCIgfSxcbiAgICAgICAgeyBtY3BfbmFtZTogXCJubHJfc3RhdGVfbG9nXCIsIGNsaV9uYW1lOiBcInN0YXRlLWxvZ1wiIH0sXG4gICAgICAgIHsgbWNwX25hbWU6IFwibmxyX2NvbmZpZ19yZWFkXCIsIGNsaV9uYW1lOiBcImNvbmZpZy1yZWFkXCIgfSxcbiAgICAgIF0sXG4gICAgfTtcblxuICAgIGNvbnN0IGRpciA9IHBhdGguZGlybmFtZShwcm9maWxlUGF0aCk7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICAgIGZzLm1rZGlyU3luYyhkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIGZzLndyaXRlRmlsZVN5bmMocHJvZmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KHByb2ZpbGUsIG51bGwsIDIpICsgXCJcXG5cIiwgXCJ1dGYtOFwiKTtcbiAgICBuZXcgTm90aWNlKGBtY3AyY2xpIHByb2ZpbGUgd3JpdHRlbiB0byAke3Byb2ZpbGVQYXRofWApO1xuICB9XG5cbiAgb25DbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgTW9kYWwsIEFwcCwgU2V0dGluZywgTm90aWNlLCBEcm9wZG93bkNvbXBvbmVudCB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHR5cGUgTkxSUGx1Z2luIGZyb20gXCIuL21haW5cIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5pbnRlcmZhY2UgQXBpUm91dGUge1xuICBrZXlOYW1lOiBzdHJpbmc7XG4gIHByb3ZpZGVyOiBzdHJpbmc7XG4gIGVuZHBvaW50OiBzdHJpbmc7XG59XG5cbmNvbnN0IFBST1ZJREVSUyA9IFtcbiAgeyB2YWx1ZTogXCJvcGVucm91dGVyXCIsIGxhYmVsOiBcIk9wZW5Sb3V0ZXJcIiwgZW5kcG9pbnQ6IFwiaHR0cHM6Ly9vcGVucm91dGVyLmFpL2FwaS92MVwiIH0sXG4gIHsgdmFsdWU6IFwiYW50aHJvcGljXCIsIGxhYmVsOiBcIkFudGhyb3BpY1wiLCBlbmRwb2ludDogXCJodHRwczovL2FwaS5hbnRocm9waWMuY29tL3YxXCIgfSxcbiAgeyB2YWx1ZTogXCJvcGVuYWlcIiwgbGFiZWw6IFwiT3BlbkFJXCIsIGVuZHBvaW50OiBcImh0dHBzOi8vYXBpLm9wZW5haS5jb20vdjFcIiB9LFxuICB7IHZhbHVlOiBcImtkZW5zZVwiLCBsYWJlbDogXCJLLURlbnNlXCIsIGVuZHBvaW50OiBcImh0dHA6Ly9sb2NhbGhvc3Q6ODAwMFwiIH0sXG4gIHsgdmFsdWU6IFwibW9kYWxcIiwgbGFiZWw6IFwiTW9kYWxcIiwgZW5kcG9pbnQ6IFwiaHR0cHM6Ly9hcGkubW9kYWwuY29tXCIgfSxcbiAgeyB2YWx1ZTogXCJjdXN0b21cIiwgbGFiZWw6IFwiQ3VzdG9tXCIsIGVuZHBvaW50OiBcIlwiIH0sXG5dO1xuXG5leHBvcnQgY2xhc3MgQXBpUm91dGVyTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgcGx1Z2luOiBOTFJQbHVnaW47XG4gIHByaXZhdGUgcm91dGVzOiBBcGlSb3V0ZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IE5MUlBsdWdpbikge1xuICAgIHN1cGVyKGFwcCk7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gICAgdGhpcy5yb3V0ZXMgPSBbLi4uKHRoaXMucGx1Z2luLnNldHRpbmdzLmFwaVJvdXRlcyB8fCBbXSldO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5hZGRDbGFzcyhcIm5sci1hcGktcm91dGVyLW1vZGFsXCIpO1xuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJBUEkgS2V5IFJvdXRpbmdcIiB9KTtcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJwXCIsIHtcbiAgICAgIHRleHQ6IFwiTWFwIEFQSSBrZXlzIHRvIHByb3ZpZGVyIGVuZHBvaW50cy4gUm91dGVzIGRldGVybWluZSB3aGVyZSByZXF1ZXN0cyBhcmUgZm9yd2FyZGVkLlwiLFxuICAgICAgY2xzOiBcIm5sci1zdGF0cy1tdXRlZFwiLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZW5kZXJSb3V0ZXMoY29udGVudEVsKTtcbiAgICB0aGlzLnJlbmRlckFkZFJvdXRlKGNvbnRlbnRFbCk7XG4gICAgdGhpcy5yZW5kZXJBY3Rpb25zKGNvbnRlbnRFbCk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlclJvdXRlcyhjb250ZW50RWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3Qgcm91dGVzQ29udGFpbmVyID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJubHItYXBpLXJvdXRlc1wiIH0pO1xuXG4gICAgaWYgKHRoaXMucm91dGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcm91dGVzQ29udGFpbmVyLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IFwiTm8gcm91dGVzIGNvbmZpZ3VyZWRcIiwgY2xzOiBcIm5sci1zdGF0cy1tdXRlZFwiIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRhYmxlID0gcm91dGVzQ29udGFpbmVyLmNyZWF0ZUVsKFwidGFibGVcIiwgeyBjbHM6IFwibmxyLXN0YXRzLXRhYmxlXCIgfSk7XG4gICAgY29uc3QgdGhlYWQgPSB0YWJsZS5jcmVhdGVFbChcInRoZWFkXCIpO1xuICAgIGNvbnN0IGhlYWRlclJvdyA9IHRoZWFkLmNyZWF0ZUVsKFwidHJcIik7XG4gICAgaGVhZGVyUm93LmNyZWF0ZUVsKFwidGhcIiwgeyB0ZXh0OiBcIktleVwiIH0pO1xuICAgIGhlYWRlclJvdy5jcmVhdGVFbChcInRoXCIsIHsgdGV4dDogXCJQcm92aWRlclwiIH0pO1xuICAgIGhlYWRlclJvdy5jcmVhdGVFbChcInRoXCIsIHsgdGV4dDogXCJFbmRwb2ludFwiIH0pO1xuICAgIGhlYWRlclJvdy5jcmVhdGVFbChcInRoXCIsIHsgdGV4dDogXCJTdGF0dXNcIiB9KTtcbiAgICBoZWFkZXJSb3cuY3JlYXRlRWwoXCJ0aFwiLCB7IHRleHQ6IFwiXCIgfSk7XG5cbiAgICBjb25zdCB0Ym9keSA9IHRhYmxlLmNyZWF0ZUVsKFwidGJvZHlcIik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJvdXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgcm91dGUgPSB0aGlzLnJvdXRlc1tpXTtcbiAgICAgIGNvbnN0IHJvdyA9IHRib2R5LmNyZWF0ZUVsKFwidHJcIik7XG4gICAgICByb3cuY3JlYXRlRWwoXCJ0ZFwiLCB7IHRleHQ6IHJvdXRlLmtleU5hbWUgfSk7XG4gICAgICByb3cuY3JlYXRlRWwoXCJ0ZFwiLCB7IHRleHQ6IHJvdXRlLnByb3ZpZGVyIH0pO1xuICAgICAgcm93LmNyZWF0ZUVsKFwidGRcIiwgeyB0ZXh0OiB0cnVuY2F0ZVVybChyb3V0ZS5lbmRwb2ludCkgfSk7XG5cbiAgICAgIGNvbnN0IHN0YXR1c0NlbGwgPSByb3cuY3JlYXRlRWwoXCJ0ZFwiKTtcbiAgICAgIGNvbnN0IGhhc0tleSA9ICEhdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXBpS2V5c1tyb3V0ZS5rZXlOYW1lXTtcbiAgICAgIHN0YXR1c0NlbGwuY3JlYXRlRWwoXCJzcGFuXCIsIHtcbiAgICAgICAgdGV4dDogaGFzS2V5ID8gXCJcXHUyNzEzIEtleSBzZXRcIiA6IFwiXFx1MjcxNyBObyBrZXlcIixcbiAgICAgICAgY2xzOiBoYXNLZXkgPyBcIm5sci1zdGF0cy1zdWNjZXNzXCIgOiBcIm5sci1zdGF0cy1mYWlsdXJlXCIsXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgYWN0aW9uQ2VsbCA9IHJvdy5jcmVhdGVFbChcInRkXCIpO1xuICAgICAgY29uc3QgdGVzdEJ0biA9IGFjdGlvbkNlbGwuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuICAgICAgICB0ZXh0OiBcIlRlc3RcIixcbiAgICAgICAgY2xzOiBcIm5sci1jaGF0Ym90LWJ0biBubHItY2hhdGJvdC1idG4tc21hbGxcIixcbiAgICAgIH0pO1xuICAgICAgdGVzdEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy50ZXN0Um91dGUocm91dGUpKTtcblxuICAgICAgY29uc3QgcmVtb3ZlQnRuID0gYWN0aW9uQ2VsbC5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG4gICAgICAgIHRleHQ6IFwiXFx1MjcxN1wiLFxuICAgICAgICBjbHM6IFwibmxyLWNoYXRib3QtYnRuIG5sci1jaGF0Ym90LWJ0bi1zbWFsbFwiLFxuICAgICAgfSk7XG4gICAgICByZW1vdmVCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgdGhpcy5yb3V0ZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB0aGlzLnJlZnJlc2hEaXNwbGF5KCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckFkZFJvdXRlKGNvbnRlbnRFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJoNFwiLCB7IHRleHQ6IFwiQWRkIFJvdXRlXCIgfSk7XG5cbiAgICBjb25zdCBuZXdSb3V0ZTogQXBpUm91dGUgPSB7IGtleU5hbWU6IFwiXCIsIHByb3ZpZGVyOiBcIlwiLCBlbmRwb2ludDogXCJcIiB9O1xuXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoXCJBUEkgS2V5IFZhcmlhYmxlXCIpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIk9QRU5ST1VURVJfQVBJX0tFWVwiKVxuICAgICAgICAgIC5vbkNoYW5nZSgodikgPT4geyBuZXdSb3V0ZS5rZXlOYW1lID0gdjsgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZShcIlByb3ZpZGVyXCIpXG4gICAgICAuYWRkRHJvcGRvd24oKGRyb3A6IERyb3Bkb3duQ29tcG9uZW50KSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgcCBvZiBQUk9WSURFUlMpIHtcbiAgICAgICAgICBkcm9wLmFkZE9wdGlvbihwLnZhbHVlLCBwLmxhYmVsKTtcbiAgICAgICAgfVxuICAgICAgICBkcm9wLm9uQ2hhbmdlKCh2KSA9PiB7XG4gICAgICAgICAgbmV3Um91dGUucHJvdmlkZXIgPSB2O1xuICAgICAgICAgIGNvbnN0IG1hdGNoID0gUFJPVklERVJTLmZpbmQoKHApID0+IHAudmFsdWUgPT09IHYpO1xuICAgICAgICAgIGlmIChtYXRjaCAmJiBtYXRjaC5lbmRwb2ludCkge1xuICAgICAgICAgICAgbmV3Um91dGUuZW5kcG9pbnQgPSBtYXRjaC5lbmRwb2ludDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZShcIkVuZHBvaW50XCIpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcImh0dHBzOi8vYXBpLmV4YW1wbGUuY29tL3YxXCIpXG4gICAgICAgICAgLm9uQ2hhbmdlKCh2KSA9PiB7IG5ld1JvdXRlLmVuZHBvaW50ID0gdjsgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgYnRuXG4gICAgICAgIC5zZXRCdXR0b25UZXh0KFwiQWRkIFJvdXRlXCIpXG4gICAgICAgIC5zZXRDdGEoKVxuICAgICAgICAub25DbGljaygoKSA9PiB7XG4gICAgICAgICAgaWYgKCFuZXdSb3V0ZS5rZXlOYW1lIHx8ICFuZXdSb3V0ZS5wcm92aWRlcikge1xuICAgICAgICAgICAgbmV3IE5vdGljZShcIktleSBuYW1lIGFuZCBwcm92aWRlciBhcmUgcmVxdWlyZWRcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghbmV3Um91dGUuZW5kcG9pbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gUFJPVklERVJTLmZpbmQoKHApID0+IHAudmFsdWUgPT09IG5ld1JvdXRlLnByb3ZpZGVyKTtcbiAgICAgICAgICAgIG5ld1JvdXRlLmVuZHBvaW50ID0gbWF0Y2g/LmVuZHBvaW50IHx8IFwiXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucm91dGVzLnB1c2goeyAuLi5uZXdSb3V0ZSB9KTtcbiAgICAgICAgICB0aGlzLnJlZnJlc2hEaXNwbGF5KCk7XG4gICAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyQWN0aW9ucyhjb250ZW50RWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgYWN0aW9ucyA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwibmxyLW1vZGFsLWJ0bi1yb3dcIiB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGFjdGlvbnMpLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgYnRuXG4gICAgICAgIC5zZXRCdXR0b25UZXh0KFwiU2F2ZSBSb3V0ZXNcIilcbiAgICAgICAgLnNldEN0YSgpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcGlSb3V0ZXMgPSBbLi4udGhpcy5yb3V0ZXNdO1xuICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIG5ldyBOb3RpY2UoYFNhdmVkICR7dGhpcy5yb3V0ZXMubGVuZ3RofSByb3V0ZXNgKTtcbiAgICAgICAgfSlcbiAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoYWN0aW9ucykuYWRkQnV0dG9uKChidG4pID0+XG4gICAgICBidG5cbiAgICAgICAgLnNldEJ1dHRvblRleHQoXCJXcml0ZSB0byBDb25maWdcIilcbiAgICAgICAgLnNldFdhcm5pbmcoKVxuICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgYXdhaXQgdGhpcy53cml0ZVRvQ29uZmlnKCk7XG4gICAgICAgIH0pXG4gICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGFjdGlvbnMpLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgYnRuXG4gICAgICAgIC5zZXRCdXR0b25UZXh0KFwiTG9hZCBmcm9tIENvbmZpZ1wiKVxuICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5sb2FkRnJvbUNvbmZpZygpO1xuICAgICAgICAgIHRoaXMucmVmcmVzaERpc3BsYXkoKTtcbiAgICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyB0ZXN0Um91dGUocm91dGU6IEFwaVJvdXRlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qga2V5ID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXBpS2V5c1tyb3V0ZS5rZXlOYW1lXTtcbiAgICBpZiAoIWtleSkge1xuICAgICAgbmV3IE5vdGljZShgTm8ga2V5IHNldCBmb3IgJHtyb3V0ZS5rZXlOYW1lfWApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7a2V5fWAsXG4gICAgICB9O1xuXG4gICAgICBpZiAocm91dGUucHJvdmlkZXIgPT09IFwiYW50aHJvcGljXCIpIHtcbiAgICAgICAgaGVhZGVyc1tcIngtYXBpLWtleVwiXSA9IGtleTtcbiAgICAgICAgaGVhZGVyc1tcImFudGhyb3BpYy12ZXJzaW9uXCJdID0gXCIyMDIzLTA2LTAxXCI7XG4gICAgICAgIGRlbGV0ZSBoZWFkZXJzW1wiQXV0aG9yaXphdGlvblwiXTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGVzdFVybCA9IHJvdXRlLmVuZHBvaW50LnJlcGxhY2UoL1xcLyskLywgXCJcIik7XG4gICAgICBsZXQgdXJsID0gdGVzdFVybDtcbiAgICAgIGlmIChyb3V0ZS5wcm92aWRlciA9PT0gXCJvcGVucm91dGVyXCIpIHVybCA9IFwiaHR0cHM6Ly9vcGVucm91dGVyLmFpL2FwaS92MS9tb2RlbHNcIjtcbiAgICAgIGVsc2UgaWYgKHJvdXRlLnByb3ZpZGVyID09PSBcImFudGhyb3BpY1wiKSB1cmwgPSBcImh0dHBzOi8vYXBpLmFudGhyb3BpYy5jb20vdjEvbW9kZWxzXCI7XG4gICAgICBlbHNlIGlmIChyb3V0ZS5wcm92aWRlciA9PT0gXCJvcGVuYWlcIikgdXJsID0gXCJodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL21vZGVsc1wiO1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgeyBoZWFkZXJzIH0pO1xuICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoYCR7cm91dGUucHJvdmlkZXJ9OiBDb25uZWN0ZWRgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ldyBOb3RpY2UoYCR7cm91dGUucHJvdmlkZXJ9OiBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICAgIGNvbnN0IGVyciA9IGUgYXMgRXJyb3I7XG4gICAgICBuZXcgTm90aWNlKGAke3JvdXRlLnByb3ZpZGVyfTogJHtlcnIubWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHdyaXRlVG9Db25maWcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbmxyUm9vdCA9IHRoaXMucGx1Z2luLnNldHRpbmdzLm5sclJvb3Q7XG4gICAgaWYgKCFubHJSb290KSB7XG4gICAgICBuZXcgTm90aWNlKFwiTkxSIFJvb3Qgbm90IHNldFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb25maWdQYXRoID0gcGF0aC5qb2luKG5sclJvb3QsIFwiY29uZmlnXCIsIFwibmV1cm8tbGluay1jb25maWcubWRcIik7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGNvbmZpZ1BhdGgpKSB7XG4gICAgICBuZXcgTm90aWNlKFwibmV1cm8tbGluay1jb25maWcubWQgbm90IGZvdW5kXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoY29uZmlnUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICBjb25zdCBmbU1hdGNoID0gY29udGVudC5tYXRjaCgvXi0tLVxcbihbXFxzXFxTXSo/KVxcbi0tLS8pO1xuICAgIGlmICghZm1NYXRjaCkge1xuICAgICAgbmV3IE5vdGljZShcIk5vIGZyb250bWF0dGVyIGluIGNvbmZpZ1wiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgZm0gPSBmbU1hdGNoWzFdO1xuXG4gICAgY29uc3Qgcm91dGVZYW1sID0gW1wiYXBpX3JvdXRlczpcIl07XG4gICAgZm9yIChjb25zdCByb3V0ZSBvZiB0aGlzLnJvdXRlcykge1xuICAgICAgcm91dGVZYW1sLnB1c2goYCAgLSBrZXk6ICR7cm91dGUua2V5TmFtZX1gKTtcbiAgICAgIHJvdXRlWWFtbC5wdXNoKGAgICAgcHJvdmlkZXI6ICR7cm91dGUucHJvdmlkZXJ9YCk7XG4gICAgICByb3V0ZVlhbWwucHVzaChgICAgIGVuZHBvaW50OiAke3JvdXRlLmVuZHBvaW50fWApO1xuICAgIH1cbiAgICBjb25zdCByb3V0ZUJsb2NrID0gcm91dGVZYW1sLmpvaW4oXCJcXG5cIik7XG5cbiAgICBjb25zdCBleGlzdGluZ1JvdXRlcyA9IGZtLm1hdGNoKC9hcGlfcm91dGVzOltcXHNcXFNdKj8oPz1cXG5bYS16XXxcXG4tLS0kfCQpLyk7XG4gICAgaWYgKGV4aXN0aW5nUm91dGVzKSB7XG4gICAgICBmbSA9IGZtLnJlcGxhY2UoZXhpc3RpbmdSb3V0ZXNbMF0sIHJvdXRlQmxvY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICBmbSArPSBcIlxcblwiICsgcm91dGVCbG9jaztcbiAgICB9XG5cbiAgICBjb25zdCBib2R5ID0gY29udGVudC5zdWJzdHJpbmcoZm1NYXRjaFswXS5sZW5ndGgpO1xuICAgIGZzLndyaXRlRmlsZVN5bmMoY29uZmlnUGF0aCwgYC0tLVxcbiR7Zm19XFxuLS0tJHtib2R5fWAsIFwidXRmLThcIik7XG5cbiAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcGlSb3V0ZXMgPSBbLi4udGhpcy5yb3V0ZXNdO1xuICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgIG5ldyBOb3RpY2UoYFdyb3RlICR7dGhpcy5yb3V0ZXMubGVuZ3RofSByb3V0ZXMgdG8gY29uZmlnYCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGxvYWRGcm9tQ29uZmlnKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG5sclJvb3QgPSB0aGlzLnBsdWdpbi5zZXR0aW5ncy5ubHJSb290O1xuICAgIGlmICghbmxyUm9vdCkge1xuICAgICAgbmV3IE5vdGljZShcIk5MUiBSb290IG5vdCBzZXRcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IHBhdGguam9pbihubHJSb290LCBcImNvbmZpZ1wiLCBcIm5ldXJvLWxpbmstY29uZmlnLm1kXCIpO1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhjb25maWdQYXRoKSkge1xuICAgICAgbmV3IE5vdGljZShcIm5ldXJvLWxpbmstY29uZmlnLm1kIG5vdCBmb3VuZFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGNvbmZpZ1BhdGgsIFwidXRmLThcIik7XG4gICAgY29uc3QgZm1NYXRjaCA9IGNvbnRlbnQubWF0Y2goL14tLS1cXG4oW1xcc1xcU10qPylcXG4tLS0vKTtcbiAgICBpZiAoIWZtTWF0Y2gpIHJldHVybjtcblxuICAgIGNvbnN0IGZtID0gZm1NYXRjaFsxXTtcbiAgICBjb25zdCByb3V0ZXNCbG9jayA9IGZtLm1hdGNoKC9hcGlfcm91dGVzOlxcbihbXFxzXFxTXSo/KSg/PVxcblthLXpdfFxcbiR8JCkvKTtcbiAgICBpZiAoIXJvdXRlc0Jsb2NrKSB7XG4gICAgICBuZXcgTm90aWNlKFwiTm8gYXBpX3JvdXRlcyBmb3VuZCBpbiBjb25maWdcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbG9hZGVkOiBBcGlSb3V0ZVtdID0gW107XG4gICAgY29uc3QgZW50cmllcyA9IHJvdXRlc0Jsb2NrWzFdLm1hdGNoQWxsKFxuICAgICAgLy0ga2V5OlxccyooXFxTKylcXG5cXHMrcHJvdmlkZXI6XFxzKihcXFMrKVxcblxccytlbmRwb2ludDpcXHMqKFxcUyspL2dcbiAgICApO1xuICAgIGZvciAoY29uc3QgbSBvZiBlbnRyaWVzKSB7XG4gICAgICBsb2FkZWQucHVzaCh7IGtleU5hbWU6IG1bMV0sIHByb3ZpZGVyOiBtWzJdLCBlbmRwb2ludDogbVszXSB9KTtcbiAgICB9XG5cbiAgICB0aGlzLnJvdXRlcyA9IGxvYWRlZDtcbiAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcGlSb3V0ZXMgPSBsb2FkZWQ7XG4gICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgbmV3IE5vdGljZShgTG9hZGVkICR7bG9hZGVkLmxlbmd0aH0gcm91dGVzIGZyb20gY29uZmlnYCk7XG4gIH1cblxuICBwcml2YXRlIHJlZnJlc2hEaXNwbGF5KCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gICAgdGhpcy5vbk9wZW4oKTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cnVuY2F0ZVVybCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICh1cmwubGVuZ3RoIDw9IDQwKSByZXR1cm4gdXJsO1xuICByZXR1cm4gdXJsLnN1YnN0cmluZygwLCAzNykgKyBcIi4uLlwiO1xufVxuIiwgImltcG9ydCB7XG4gIEl0ZW1WaWV3LFxuICBXb3Jrc3BhY2VMZWFmLFxuICBOb3RpY2UsXG4gIE1hcmtkb3duVmlldyxcbiAgc2V0SWNvbixcbn0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgdHlwZSBOTFJQbHVnaW4gZnJvbSBcIi4vbWFpblwiO1xuXG5leHBvcnQgY29uc3QgVklFV19UWVBFX0NIQVRCT1QgPSBcIm5sci1jaGF0Ym90LXZpZXdcIjtcblxuaW50ZXJmYWNlIENoYXRNZXNzYWdlIHtcbiAgcm9sZTogXCJ1c2VyXCIgfCBcImFzc2lzdGFudFwiIHwgXCJzeXN0ZW1cIjtcbiAgY29udGVudDogc3RyaW5nO1xuICBjb250ZXh0UGFnZXM/OiBzdHJpbmdbXTtcbiAgdGltZXN0YW1wOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBDaGF0Ym90VmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcbiAgcGx1Z2luOiBOTFJQbHVnaW47XG4gIHByaXZhdGUgbWVzc2FnZXM6IENoYXRNZXNzYWdlW10gPSBbXTtcbiAgcHJpdmF0ZSBtZXNzYWdlc0VsITogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgaW5wdXRFbCE6IEhUTUxUZXh0QXJlYUVsZW1lbnQ7XG4gIHByaXZhdGUgaXNTdHJlYW1pbmc6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihsZWFmOiBXb3Jrc3BhY2VMZWFmLCBwbHVnaW46IE5MUlBsdWdpbikge1xuICAgIHN1cGVyKGxlYWYpO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZ2V0Vmlld1R5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gVklFV19UWVBFX0NIQVRCT1Q7XG4gIH1cblxuICBnZXREaXNwbGF5VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBcIk5MUiBDaGF0Ym90XCI7XG4gIH1cblxuICBnZXRJY29uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFwibmxyLWJyYWluXCI7XG4gIH1cblxuICBhc3luYyBvbk9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5jb250YWluZXJFbC5jaGlsZHJlblsxXSBhcyBIVE1MRWxlbWVudDtcbiAgICBjb250YWluZXIuZW1wdHkoKTtcbiAgICBjb250YWluZXIuYWRkQ2xhc3MoXCJubHItY2hhdGJvdC1jb250YWluZXJcIik7XG5cbiAgICBjb25zdCBoZWFkZXIgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1jaGF0Ym90LWhlYWRlclwiIH0pO1xuICAgIGhlYWRlci5jcmVhdGVFbChcImg0XCIsIHsgdGV4dDogXCJOTFIgQ2hhdGJvdFwiIH0pO1xuXG4gICAgY29uc3QgaGVhZGVyQWN0aW9ucyA9IGhlYWRlci5jcmVhdGVEaXYoeyBjbHM6IFwibmxyLWNoYXRib3QtaGVhZGVyLWFjdGlvbnNcIiB9KTtcblxuICAgIGNvbnN0IGNsZWFyQnRuID0gaGVhZGVyQWN0aW9ucy5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG4gICAgICBjbHM6IFwibmxyLWNoYXRib3QtYnRuIG5sci1jaGF0Ym90LWJ0bi1zbWFsbFwiLFxuICAgICAgYXR0cjogeyBcImFyaWEtbGFiZWxcIjogXCJDbGVhciBjaGF0XCIgfSxcbiAgICB9KTtcbiAgICBzZXRJY29uKGNsZWFyQnRuLCBcInRyYXNoLTJcIik7XG4gICAgY2xlYXJCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgICAgIHRoaXMucmVuZGVyTWVzc2FnZXMoKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IG1vZGVsSW5mbyA9IGhlYWRlci5jcmVhdGVEaXYoeyBjbHM6IFwibmxyLWNoYXRib3QtbW9kZWwtaW5mb1wiIH0pO1xuICAgIG1vZGVsSW5mby5jcmVhdGVFbChcInNwYW5cIiwge1xuICAgICAgdGV4dDogdGhpcy5wbHVnaW4uc2V0dGluZ3MuY2hhdGJvdE1vZGVsLnNwbGl0KFwiL1wiKS5wb3AoKSB8fCBcInVua25vd25cIixcbiAgICAgIGNsczogXCJubHItY2hhdGJvdC1tb2RlbC1iYWRnZVwiLFxuICAgIH0pO1xuXG4gICAgdGhpcy5tZXNzYWdlc0VsID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJubHItY2hhdGJvdC1tZXNzYWdlc1wiIH0pO1xuXG4gICAgY29uc3QgaW5wdXRBcmVhID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJubHItY2hhdGJvdC1pbnB1dC1hcmVhXCIgfSk7XG5cbiAgICB0aGlzLmlucHV0RWwgPSBpbnB1dEFyZWEuY3JlYXRlRWwoXCJ0ZXh0YXJlYVwiLCB7XG4gICAgICBjbHM6IFwibmxyLWNoYXRib3QtaW5wdXRcIixcbiAgICAgIGF0dHI6IHsgcGxhY2Vob2xkZXI6IFwiQXNrIGFib3V0IHlvdXIga25vd2xlZGdlIGJhc2UuLi5cIiwgcm93czogXCIzXCIgfSxcbiAgICB9KTtcblxuICAgIHRoaXMuaW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIgJiYgIWUuc2hpZnRLZXkpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBidG5Sb3cgPSBpbnB1dEFyZWEuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1jaGF0Ym90LWJ0bi1yb3dcIiB9KTtcblxuICAgIGNvbnN0IHNlbmRCdG4gPSBidG5Sb3cuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuICAgICAgdGV4dDogXCJTZW5kXCIsXG4gICAgICBjbHM6IFwibmxyLWNoYXRib3QtYnRuIG5sci1jaGF0Ym90LWJ0bi1wcmltYXJ5XCIsXG4gICAgfSk7XG4gICAgc2VuZEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5zZW5kTWVzc2FnZSgpKTtcblxuICAgIGNvbnN0IHdpa2lCdG4gPSBidG5Sb3cuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuICAgICAgdGV4dDogXCJTYXZlIHRvIFdpa2lcIixcbiAgICAgIGNsczogXCJubHItY2hhdGJvdC1idG5cIixcbiAgICB9KTtcbiAgICB3aWtpQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLnNhdmVUb1dpa2koKSk7XG5cbiAgICBjb25zdCBrZGVuc2VCdG4gPSBidG5Sb3cuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuICAgICAgdGV4dDogXCJTZW5kIHRvIEstRGVuc2VcIixcbiAgICAgIGNsczogXCJubHItY2hhdGJvdC1idG5cIixcbiAgICB9KTtcbiAgICBrZGVuc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuZGlzcGF0Y2hUb0hhcm5lc3MoXCJrLWRlbnNlLWJ5b2tcIikpO1xuXG4gICAgY29uc3QgZm9yZ2VCdG4gPSBidG5Sb3cuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuICAgICAgdGV4dDogXCJTZW5kIHRvIEZvcmdlQ29kZVwiLFxuICAgICAgY2xzOiBcIm5sci1jaGF0Ym90LWJ0blwiLFxuICAgIH0pO1xuICAgIGZvcmdlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmRpc3BhdGNoVG9IYXJuZXNzKFwiZm9yZ2Vjb2RlXCIpKTtcblxuICAgIHRoaXMucmVuZGVyTWVzc2FnZXMoKTtcbiAgfVxuXG4gIGFzeW5jIG9uQ2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gbm90aGluZyB0byBjbGVhbiB1cFxuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJNZXNzYWdlcygpOiB2b2lkIHtcbiAgICB0aGlzLm1lc3NhZ2VzRWwuZW1wdHkoKTtcblxuICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5tZXNzYWdlc0VsLmNyZWF0ZURpdih7IGNsczogXCJubHItY2hhdGJvdC1lbXB0eVwiIH0pLmNyZWF0ZUVsKFwicFwiLCB7XG4gICAgICAgIHRleHQ6IFwiQXNrIHF1ZXN0aW9ucyBhYm91dCB5b3VyIG5ldXJvLWxpbmsga25vd2xlZGdlIGJhc2UuIFdpa2kgY29udGV4dCBpcyBhdXRvbWF0aWNhbGx5IGluamVjdGVkIHZpYSBSQUcuXCIsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IG1zZyBvZiB0aGlzLm1lc3NhZ2VzKSB7XG4gICAgICBjb25zdCBtc2dFbCA9IHRoaXMubWVzc2FnZXNFbC5jcmVhdGVEaXYoe1xuICAgICAgICBjbHM6IGBubHItY2hhdGJvdC1tZXNzYWdlIG5sci1jaGF0Ym90LW1lc3NhZ2UtJHttc2cucm9sZX1gLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHJvbGVFbCA9IG1zZ0VsLmNyZWF0ZURpdih7IGNsczogXCJubHItY2hhdGJvdC1tZXNzYWdlLXJvbGVcIiB9KTtcbiAgICAgIHJvbGVFbC5jcmVhdGVFbChcInNwYW5cIiwge1xuICAgICAgICB0ZXh0OiBtc2cucm9sZSA9PT0gXCJ1c2VyXCIgPyBcIllvdVwiIDogXCJBc3Npc3RhbnRcIixcbiAgICAgICAgY2xzOiBcIm5sci1jaGF0Ym90LXJvbGUtbGFiZWxcIixcbiAgICAgIH0pO1xuICAgICAgcm9sZUVsLmNyZWF0ZUVsKFwic3BhblwiLCB7XG4gICAgICAgIHRleHQ6IG5ldyBEYXRlKG1zZy50aW1lc3RhbXApLnRvTG9jYWxlVGltZVN0cmluZygpLFxuICAgICAgICBjbHM6IFwibmxyLWNoYXRib3QtdGltZXN0YW1wXCIsXG4gICAgICB9KTtcblxuICAgICAgbXNnRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1jaGF0Ym90LW1lc3NhZ2UtY29udGVudFwiLCB0ZXh0OiBtc2cuY29udGVudCB9KTtcblxuICAgICAgaWYgKG1zZy5jb250ZXh0UGFnZXMgJiYgbXNnLmNvbnRleHRQYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGN0eEVsID0gbXNnRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1jaGF0Ym90LWNvbnRleHRcIiB9KTtcbiAgICAgICAgY3R4RWwuY3JlYXRlRWwoXCJzcGFuXCIsIHsgdGV4dDogXCJDb250ZXh0OiBcIiwgY2xzOiBcIm5sci1jaGF0Ym90LWNvbnRleHQtbGFiZWxcIiB9KTtcbiAgICAgICAgZm9yIChjb25zdCBwYWdlIG9mIG1zZy5jb250ZXh0UGFnZXMpIHtcbiAgICAgICAgICBjb25zdCBsaW5rID0gY3R4RWwuY3JlYXRlRWwoXCJhXCIsIHtcbiAgICAgICAgICAgIHRleHQ6IHBhZ2UsXG4gICAgICAgICAgICBjbHM6IFwibmxyLWNoYXRib3QtY29udGV4dC1saW5rXCIsXG4gICAgICAgICAgICBocmVmOiBcIiNcIixcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9wZW5MaW5rVGV4dChwYWdlLCBcIlwiLCBmYWxzZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm1lc3NhZ2VzRWwuc2Nyb2xsVG9wID0gdGhpcy5tZXNzYWdlc0VsLnNjcm9sbEhlaWdodDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgc2VuZE1lc3NhZ2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY29udGVudCA9IHRoaXMuaW5wdXRFbC52YWx1ZS50cmltKCk7XG4gICAgaWYgKCFjb250ZW50IHx8IHRoaXMuaXNTdHJlYW1pbmcpIHJldHVybjtcblxuICAgIHRoaXMuaW5wdXRFbC52YWx1ZSA9IFwiXCI7XG4gICAgdGhpcy5pc1N0cmVhbWluZyA9IHRydWU7XG5cbiAgICB0aGlzLm1lc3NhZ2VzLnB1c2goe1xuICAgICAgcm9sZTogXCJ1c2VyXCIsXG4gICAgICBjb250ZW50LFxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgIH0pO1xuICAgIHRoaXMucmVuZGVyTWVzc2FnZXMoKTtcblxuICAgIGxldCBjb250ZXh0UGFnZXM6IHN0cmluZ1tdID0gW107XG4gICAgbGV0IHJhZ0NvbnRleHQgPSBcIlwiO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJhZ1Jlc3VsdCA9IGF3YWl0IHRoaXMucGx1Z2luLnJ1bk5sckNvbW1hbmQoW1wicmFnLXF1ZXJ5XCIsIGNvbnRlbnRdKTtcbiAgICAgIGlmIChyYWdSZXN1bHQpIHtcbiAgICAgICAgcmFnQ29udGV4dCA9IHJhZ1Jlc3VsdDtcbiAgICAgICAgY29uc3QgcGFnZU1hdGNoZXMgPSByYWdSZXN1bHQubWF0Y2hBbGwoL1xcW1xcWyhbXlxcXV0rKVxcXVxcXS9nKTtcbiAgICAgICAgZm9yIChjb25zdCBtIG9mIHBhZ2VNYXRjaGVzKSB7XG4gICAgICAgICAgY29udGV4dFBhZ2VzLnB1c2gobVsxXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbnRleHRQYWdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBjb25zdCBmaWxlTWF0Y2hlcyA9IHJhZ1Jlc3VsdC5tYXRjaEFsbCgvKD86XnxcXG4pKD86c291cmNlfGZpbGV8cGFnZSk6XFxzKiguKykvZ2kpO1xuICAgICAgICAgIGZvciAoY29uc3QgbSBvZiBmaWxlTWF0Y2hlcykge1xuICAgICAgICAgICAgY29udGV4dFBhZ2VzLnB1c2gobVsxXS50cmltKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gUkFHIHVuYXZhaWxhYmxlLCBwcm9jZWVkIHdpdGhvdXQgY29udGV4dFxuICAgIH1cblxuICAgIGNvbnN0IGFwaUtleSA9IHRoaXMucGx1Z2luLnNldHRpbmdzLmFwaUtleXNbXCJPUEVOUk9VVEVSX0FQSV9LRVlcIl07XG4gICAgaWYgKCFhcGlLZXkpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMucHVzaCh7XG4gICAgICAgIHJvbGU6IFwiYXNzaXN0YW50XCIsXG4gICAgICAgIGNvbnRlbnQ6IFwiT3BlblJvdXRlciBBUEkga2V5IG5vdCBjb25maWd1cmVkLiBTZXQgaXQgaW4gU2V0dGluZ3MgPiBOZXVyby1MaW5rIFJlY3Vyc2l2ZSA+IEFQSSBLZXlzLlwiLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICB9KTtcbiAgICAgIHRoaXMuaXNTdHJlYW1pbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMucmVuZGVyTWVzc2FnZXMoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzeXN0ZW1NZXNzYWdlID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MuY2hhdGJvdFN5c3RlbVByb21wdDtcbiAgICBjb25zdCBjb250ZXh0QmxvY2sgPSByYWdDb250ZXh0XG4gICAgICA/IGBcXG5cXG4tLS0gV2lraSBDb250ZXh0IC0tLVxcbiR7cmFnQ29udGV4dH1cXG4tLS0gRW5kIENvbnRleHQgLS0tYFxuICAgICAgOiBcIlwiO1xuXG4gICAgY29uc3QgYXBpTWVzc2FnZXMgPSBbXG4gICAgICB7IHJvbGU6IFwic3lzdGVtXCIgYXMgY29uc3QsIGNvbnRlbnQ6IHN5c3RlbU1lc3NhZ2UgKyBjb250ZXh0QmxvY2sgfSxcbiAgICAgIC4uLnRoaXMubWVzc2FnZXNcbiAgICAgICAgLmZpbHRlcigobSkgPT4gbS5yb2xlICE9PSBcInN5c3RlbVwiKVxuICAgICAgICAubWFwKChtKSA9PiAoeyByb2xlOiBtLnJvbGUsIGNvbnRlbnQ6IG0uY29udGVudCB9KSksXG4gICAgXTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiaHR0cHM6Ly9vcGVucm91dGVyLmFpL2FwaS92MS9jaGF0L2NvbXBsZXRpb25zXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YCxcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICBcIkhUVFAtUmVmZXJlclwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9IeXBlckZyZXF1ZW5jeVwiLFxuICAgICAgICAgIFwiWC1UaXRsZVwiOiBcIk5MUiBPYnNpZGlhbiBQbHVnaW5cIixcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIG1vZGVsOiB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jaGF0Ym90TW9kZWwsXG4gICAgICAgICAgbWVzc2FnZXM6IGFwaU1lc3NhZ2VzLFxuICAgICAgICAgIG1heF90b2tlbnM6IDQwOTYsXG4gICAgICAgIH0pLFxuICAgICAgfSk7XG5cbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyVGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxIHx8IGVyclRleHQuaW5jbHVkZXMoXCJub3QgZm91bmRcIikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE9wZW5Sb3V0ZXIgYXV0aCBmYWlsZWQgKCR7cmVzcG9uc2Uuc3RhdHVzfSkuIENoZWNrIHlvdXIgQVBJIGtleSBhdCBvcGVucm91dGVyLmFpL3NldHRpbmdzL2tleXMgXHUyMDE0IGN1cnJlbnQga2V5IHN0YXJ0cyB3aXRoOiAke2FwaUtleS5zdWJzdHJpbmcoMCwgOCl9Li4uYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBPcGVuUm91dGVyICR7cmVzcG9uc2Uuc3RhdHVzfTogJHtlcnJUZXh0fWApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkYXRhID0gKGF3YWl0IHJlc3BvbnNlLmpzb24oKSkgYXMge1xuICAgICAgICBjaG9pY2VzOiBBcnJheTx7IG1lc3NhZ2U6IHsgY29udGVudDogc3RyaW5nIH0gfT47XG4gICAgICB9O1xuICAgICAgY29uc3QgYXNzaXN0YW50Q29udGVudCA9IGRhdGEuY2hvaWNlcz8uWzBdPy5tZXNzYWdlPy5jb250ZW50IHx8IFwiTm8gcmVzcG9uc2UgcmVjZWl2ZWRcIjtcblxuICAgICAgdGhpcy5tZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgcm9sZTogXCJhc3Npc3RhbnRcIixcbiAgICAgICAgY29udGVudDogYXNzaXN0YW50Q29udGVudCxcbiAgICAgICAgY29udGV4dFBhZ2VzLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgICBjb25zdCBlcnIgPSBlIGFzIEVycm9yO1xuICAgICAgdGhpcy5tZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgcm9sZTogXCJhc3Npc3RhbnRcIixcbiAgICAgICAgY29udGVudDogYEVycm9yOiAke2Vyci5tZXNzYWdlfWAsXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuaXNTdHJlYW1pbmcgPSBmYWxzZTtcbiAgICB0aGlzLnJlbmRlck1lc3NhZ2VzKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNhdmVUb1dpa2koKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBuZXcgTm90aWNlKFwiTm8gbWVzc2FnZXMgdG8gc2F2ZVwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0QXNzaXN0YW50ID0gWy4uLnRoaXMubWVzc2FnZXNdLnJldmVyc2UoKS5maW5kKChtKSA9PiBtLnJvbGUgPT09IFwiYXNzaXN0YW50XCIpO1xuICAgIGlmICghbGFzdEFzc2lzdGFudCkge1xuICAgICAgbmV3IE5vdGljZShcIk5vIGFzc2lzdGFudCByZXNwb25zZSB0byBzYXZlXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGxhc3RVc2VyID0gWy4uLnRoaXMubWVzc2FnZXNdLnJldmVyc2UoKS5maW5kKChtKSA9PiBtLnJvbGUgPT09IFwidXNlclwiKTtcbiAgICBjb25zdCB0aXRsZSA9IGxhc3RVc2VyXG4gICAgICA/IGxhc3RVc2VyLmNvbnRlbnQuc3Vic3RyaW5nKDAsIDYwKS5yZXBsYWNlKC9bXmEtekEtWjAtOVxccy1dL2csIFwiXCIpLnRyaW0oKVxuICAgICAgOiBcImNoYXRib3Qtbm90ZVwiO1xuICAgIGNvbnN0IHNsdWcgPSB0aXRsZS5yZXBsYWNlKC9cXHMrL2csIFwiLVwiKS50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdChcIlRcIilbMF07XG5cbiAgICBjb25zdCBmcm9udG1hdHRlciA9IFtcbiAgICAgIFwiLS0tXCIsXG4gICAgICBgdGl0bGU6IFwiJHt0aXRsZX1cImAsXG4gICAgICAnZG9tYWluOiBjaGF0Ym90JyxcbiAgICAgIGBzb3VyY2VzOiBbY2hhdGJvdC0ke25vd31dYCxcbiAgICAgIFwiY29uZmlkZW5jZTogMC42XCIsXG4gICAgICBgbGFzdF91cGRhdGVkOiBcIiR7bm93fVwiYCxcbiAgICAgIFwib3Blbl9xdWVzdGlvbnM6IFtdXCIsXG4gICAgICBcIi0tLVwiLFxuICAgIF0uam9pbihcIlxcblwiKTtcblxuICAgIGNvbnN0IGNvbnRlbnQgPSBgJHtmcm9udG1hdHRlcn1cXG5cXG4jICR7dGl0bGV9XFxuXFxuJHtsYXN0QXNzaXN0YW50LmNvbnRlbnR9XFxuXFxuIyMgU291cmNlc1xcblxcbi0gR2VuZXJhdGVkIGJ5IE5MUiBDaGF0Ym90IG9uICR7bm93fVxcbmA7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZShgMDItS0ItbWFpbi8ke3NsdWd9Lm1kYCwgY29udGVudCk7XG4gICAgICBuZXcgTm90aWNlKGBXaWtpIHBhZ2UgY3JlYXRlZDogJHtmaWxlLnBhdGh9YCk7XG4gICAgICB0aGlzLmFwcC53b3Jrc3BhY2Uub3BlbkxpbmtUZXh0KGZpbGUucGF0aCwgXCJcIiwgZmFsc2UpO1xuICAgIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICAgIGNvbnN0IGVyciA9IGUgYXMgRXJyb3I7XG4gICAgICBpZiAoZXJyLm1lc3NhZ2UuaW5jbHVkZXMoXCJhbHJlYWR5IGV4aXN0c1wiKSkge1xuICAgICAgICBuZXcgTm90aWNlKFwiQSB3aWtpIHBhZ2Ugd2l0aCB0aGlzIG5hbWUgYWxyZWFkeSBleGlzdHNcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXcgTm90aWNlKGBGYWlsZWQgdG8gY3JlYXRlIHdpa2kgcGFnZTogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGRpc3BhdGNoVG9IYXJuZXNzKGhhcm5lc3NOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5tZXNzYWdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIG5ldyBOb3RpY2UoXCJObyBtZXNzYWdlcyB0byBkaXNwYXRjaFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0VXNlciA9IFsuLi50aGlzLm1lc3NhZ2VzXS5yZXZlcnNlKCkuZmluZCgobSkgPT4gbS5yb2xlID09PSBcInVzZXJcIik7XG4gICAgaWYgKCFsYXN0VXNlcikge1xuICAgICAgbmV3IE5vdGljZShcIk5vIHVzZXIgbWVzc2FnZSB0byBkaXNwYXRjaFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5wbHVnaW4ucnVuTmxyQ29tbWFuZChbXG4gICAgICAgIFwiaGFybmVzcy1kaXNwYXRjaFwiLFxuICAgICAgICBcIi0tdG9cIixcbiAgICAgICAgaGFybmVzc05hbWUsXG4gICAgICAgIFwiLS10YXNrXCIsXG4gICAgICAgIGxhc3RVc2VyLmNvbnRlbnQsXG4gICAgICBdKTtcbiAgICAgIG5ldyBOb3RpY2UoYERpc3BhdGNoZWQgdG8gJHtoYXJuZXNzTmFtZX1gKTtcblxuICAgICAgdGhpcy5tZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgcm9sZTogXCJzeXN0ZW1cIixcbiAgICAgICAgY29udGVudDogYERpc3BhdGNoZWQgdG8gJHtoYXJuZXNzTmFtZX06ICR7cmVzdWx0fWAsXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZW5kZXJNZXNzYWdlcygpO1xuICAgIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICAgIGNvbnN0IGVyciA9IGUgYXMgRXJyb3I7XG4gICAgICBuZXcgTm90aWNlKGBEaXNwYXRjaCBmYWlsZWQ6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHtcbiAgSXRlbVZpZXcsXG4gIFdvcmtzcGFjZUxlYWYsXG4gIE5vdGljZSxcbiAgc2V0SWNvbixcbn0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgdHlwZSBOTFJQbHVnaW4gZnJvbSBcIi4vbWFpblwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBjb25zdCBWSUVXX1RZUEVfU1RBVFMgPSBcIm5sci1zdGF0cy12aWV3XCI7XG5cbmludGVyZmFjZSBIZWFydGJlYXREYXRhIHtcbiAgc3RhdHVzOiBzdHJpbmc7XG4gIGxhc3RfY2hlY2s6IHN0cmluZztcbiAgZXJyb3JzOiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIFNlc3Npb25Mb2dFbnRyeSB7XG4gIHRvb2w6IHN0cmluZztcbiAgdGltZXN0YW1wOiBzdHJpbmc7XG4gIGR1cmF0aW9uX21zPzogbnVtYmVyO1xuICBzdWNjZXNzPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIFNjb3JlRW50cnkge1xuICBzZXNzaW9uX2lkPzogc3RyaW5nO1xuICBzY29yZTogbnVtYmVyO1xuICB0aW1lc3RhbXA6IHN0cmluZztcbiAgZGltZW5zaW9ucz86IFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0c1ZpZXcgZXh0ZW5kcyBJdGVtVmlldyB7XG4gIHBsdWdpbjogTkxSUGx1Z2luO1xuXG4gIGNvbnN0cnVjdG9yKGxlYWY6IFdvcmtzcGFjZUxlYWYsIHBsdWdpbjogTkxSUGx1Z2luKSB7XG4gICAgc3VwZXIobGVhZik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gIH1cblxuICBnZXRWaWV3VHlwZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBWSUVXX1RZUEVfU1RBVFM7XG4gIH1cblxuICBnZXREaXNwbGF5VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBcIk5MUiBTdGF0c1wiO1xuICB9XG5cbiAgZ2V0SWNvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiBcIm5sci1jaGFydFwiO1xuICB9XG5cbiAgYXN5bmMgb25PcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBhc3luYyBvbkNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIG5vdGhpbmcgdG8gY2xlYW4gdXBcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmVuZGVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyRWwuY2hpbGRyZW5bMV0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgY29udGFpbmVyLmVtcHR5KCk7XG4gICAgY29udGFpbmVyLmFkZENsYXNzKFwibmxyLXN0YXRzLWNvbnRhaW5lclwiKTtcblxuICAgIGNvbnN0IGhlYWRlciA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwibmxyLXN0YXRzLWhlYWRlclwiIH0pO1xuICAgIGhlYWRlci5jcmVhdGVFbChcImg0XCIsIHsgdGV4dDogXCJOTFIgRGFzaGJvYXJkXCIgfSk7XG5cbiAgICBjb25zdCByZWZyZXNoQnRuID0gaGVhZGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcbiAgICAgIGNsczogXCJubHItY2hhdGJvdC1idG4gbmxyLWNoYXRib3QtYnRuLXNtYWxsXCIsXG4gICAgICBhdHRyOiB7IFwiYXJpYS1sYWJlbFwiOiBcIlJlZnJlc2hcIiB9LFxuICAgIH0pO1xuICAgIHNldEljb24ocmVmcmVzaEJ0biwgXCJyZWZyZXNoLWN3XCIpO1xuICAgIHJlZnJlc2hCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMucmVuZGVyKCkpO1xuXG4gICAgY29uc3QgbmxyUm9vdCA9IHRoaXMucGx1Z2luLnNldHRpbmdzLm5sclJvb3Q7XG4gICAgaWYgKCFubHJSb290KSB7XG4gICAgICBjb250YWluZXIuY3JlYXRlRWwoXCJwXCIsIHtcbiAgICAgICAgdGV4dDogXCJOTFIgUm9vdCBwYXRoIG5vdCBjb25maWd1cmVkLiBTZXQgaXQgaW4gU2V0dGluZ3MuXCIsXG4gICAgICAgIGNsczogXCJubHItZXJyb3JcIixcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGhlYXJ0YmVhdCA9IHRoaXMucmVhZEhlYXJ0YmVhdChubHJSb290KTtcbiAgICBjb25zdCBzZXNzaW9uTG9nID0gdGhpcy5yZWFkSnNvbmw8U2Vzc2lvbkxvZ0VudHJ5PihwYXRoLmpvaW4obmxyUm9vdCwgXCJzdGF0ZVwiLCBcInNlc3Npb25fbG9nLmpzb25sXCIpKTtcbiAgICBjb25zdCBzY29yZUhpc3RvcnkgPSB0aGlzLnJlYWRKc29ubDxTY29yZUVudHJ5PihwYXRoLmpvaW4obmxyUm9vdCwgXCJzdGF0ZVwiLCBcInNjb3JlX2hpc3RvcnkuanNvbmxcIikpO1xuICAgIGNvbnN0IHdpa2lQYWdlcyA9IHRoaXMuY291bnRGaWxlcyhwYXRoLmpvaW4obmxyUm9vdCwgXCIwMi1LQi1tYWluXCIpLCBcIi5tZFwiKTtcbiAgICBjb25zdCBwZW5kaW5nVGFza3MgPSB0aGlzLmNvdW50UGVuZGluZ1Rhc2tzKG5sclJvb3QpO1xuICAgIGNvbnN0IGdhcENvdW50ID0gdGhpcy5jb3VudEZpbGVzKHBhdGguam9pbihubHJSb290LCBcIjA1LWluc2lnaHRzLWdhcHNcIiksIFwiLm1kXCIpO1xuXG4gICAgdGhpcy5yZW5kZXJIZWFsdGhDYXJkKGNvbnRhaW5lciwgaGVhcnRiZWF0KTtcbiAgICB0aGlzLnJlbmRlclN1bW1hcnlDYXJkcyhjb250YWluZXIsIHdpa2lQYWdlcywgcGVuZGluZ1Rhc2tzLCBnYXBDb3VudCwgc2Vzc2lvbkxvZywgc2NvcmVIaXN0b3J5KTtcbiAgICB0aGlzLnJlbmRlclRvb2xVc2FnZUNoYXJ0KGNvbnRhaW5lciwgc2Vzc2lvbkxvZyk7XG4gICAgdGhpcy5yZW5kZXJTY29yZVRyZW5kKGNvbnRhaW5lciwgc2NvcmVIaXN0b3J5KTtcbiAgICB0aGlzLnJlbmRlclJlY2VudEFjdGl2aXR5KGNvbnRhaW5lciwgc2Vzc2lvbkxvZyk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckhlYWx0aENhcmQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgaGVhcnRiZWF0OiBIZWFydGJlYXREYXRhIHwgbnVsbCk6IHZvaWQge1xuICAgIGNvbnN0IGNhcmQgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1zdGF0cy1jYXJkXCIgfSk7XG4gICAgY2FyZC5jcmVhdGVFbChcImg1XCIsIHsgdGV4dDogXCJTeXN0ZW0gSGVhbHRoXCIgfSk7XG5cbiAgICBpZiAoIWhlYXJ0YmVhdCkge1xuICAgICAgY2FyZC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIk5vIGhlYXJ0YmVhdCBkYXRhXCIsIGNsczogXCJubHItc3RhdHMtbXV0ZWRcIiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzdGF0dXNFbCA9IGNhcmQuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1zdGF0cy1oZWFsdGgtcm93XCIgfSk7XG4gICAgY29uc3Qgc3RhdHVzRG90ID0gc3RhdHVzRWwuY3JlYXRlRWwoXCJzcGFuXCIsIHtcbiAgICAgIGNsczogYG5sci1zdGF0cy1kb3QgbmxyLXN0YXRzLWRvdC0ke2hlYXJ0YmVhdC5zdGF0dXMgPT09IFwiaW5pdGlhbGl6ZWRcIiB8fCBoZWFydGJlYXQuc3RhdHVzID09PSBcImhlYWx0aHlcIiA/IFwiZ3JlZW5cIiA6IFwicmVkXCJ9YCxcbiAgICB9KTtcbiAgICBzdGF0dXNEb3QudGV4dENvbnRlbnQgPSBcIlxcdTI1Q0ZcIjtcbiAgICBzdGF0dXNFbC5jcmVhdGVFbChcInNwYW5cIiwgeyB0ZXh0OiBgIFN0YXR1czogJHtoZWFydGJlYXQuc3RhdHVzfWAgfSk7XG5cbiAgICBjYXJkLmNyZWF0ZUVsKFwicFwiLCB7XG4gICAgICB0ZXh0OiBgTGFzdCBjaGVjazogJHtuZXcgRGF0ZShoZWFydGJlYXQubGFzdF9jaGVjaykudG9Mb2NhbGVTdHJpbmcoKX1gLFxuICAgICAgY2xzOiBcIm5sci1zdGF0cy1tdXRlZFwiLFxuICAgIH0pO1xuXG4gICAgaWYgKGhlYXJ0YmVhdC5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZXJyTGlzdCA9IGNhcmQuY3JlYXRlRWwoXCJ1bFwiLCB7IGNsczogXCJubHItc3RhdHMtZXJyb3ItbGlzdFwiIH0pO1xuICAgICAgZm9yIChjb25zdCBlcnIgb2YgaGVhcnRiZWF0LmVycm9ycykge1xuICAgICAgICBlcnJMaXN0LmNyZWF0ZUVsKFwibGlcIiwgeyB0ZXh0OiBlcnIsIGNsczogXCJubHItZXJyb3JcIiB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlclN1bW1hcnlDYXJkcyhcbiAgICBjb250YWluZXI6IEhUTUxFbGVtZW50LFxuICAgIHdpa2lQYWdlczogbnVtYmVyLFxuICAgIHBlbmRpbmdUYXNrczogbnVtYmVyLFxuICAgIGdhcENvdW50OiBudW1iZXIsXG4gICAgc2Vzc2lvbkxvZzogU2Vzc2lvbkxvZ0VudHJ5W10sXG4gICAgc2NvcmVIaXN0b3J5OiBTY29yZUVudHJ5W11cbiAgKTogdm9pZCB7XG4gICAgY29uc3QgZ3JpZCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwibmxyLXN0YXRzLWdyaWRcIiB9KTtcblxuICAgIHRoaXMuY3JlYXRlTWV0cmljQ2FyZChncmlkLCBcIldpa2kgUGFnZXNcIiwgU3RyaW5nKHdpa2lQYWdlcyksIFwiZmlsZS10ZXh0XCIpO1xuICAgIHRoaXMuY3JlYXRlTWV0cmljQ2FyZChncmlkLCBcIlBlbmRpbmcgVGFza3NcIiwgU3RyaW5nKHBlbmRpbmdUYXNrcyksIFwibGlzdC10b2RvXCIpO1xuICAgIHRoaXMuY3JlYXRlTWV0cmljQ2FyZChncmlkLCBcIktub3dsZWRnZSBHYXBzXCIsIFN0cmluZyhnYXBDb3VudCksIFwiYWxlcnQtdHJpYW5nbGVcIik7XG5cbiAgICBjb25zdCBzdWNjZXNzQ291bnQgPSBzZXNzaW9uTG9nLmZpbHRlcigoZSkgPT4gZS5zdWNjZXNzID09PSB0cnVlKS5sZW5ndGg7XG4gICAgY29uc3QgdG90YWxXaXRoU3RhdHVzID0gc2Vzc2lvbkxvZy5maWx0ZXIoKGUpID0+IGUuc3VjY2VzcyAhPT0gdW5kZWZpbmVkKS5sZW5ndGg7XG4gICAgY29uc3QgcmF0ZSA9IHRvdGFsV2l0aFN0YXR1cyA+IDAgPyBNYXRoLnJvdW5kKChzdWNjZXNzQ291bnQgLyB0b3RhbFdpdGhTdGF0dXMpICogMTAwKSA6IDA7XG4gICAgdGhpcy5jcmVhdGVNZXRyaWNDYXJkKGdyaWQsIFwiU3VjY2VzcyBSYXRlXCIsIGAke3JhdGV9JWAsIFwiY2hlY2stY2lyY2xlXCIpO1xuXG4gICAgY29uc3QgYXZnU2NvcmUgPSBzY29yZUhpc3RvcnkubGVuZ3RoID4gMFxuICAgICAgPyAoc2NvcmVIaXN0b3J5LnJlZHVjZSgoc3VtLCBlKSA9PiBzdW0gKyBlLnNjb3JlLCAwKSAvIHNjb3JlSGlzdG9yeS5sZW5ndGgpLnRvRml4ZWQoMSlcbiAgICAgIDogXCJOL0FcIjtcbiAgICB0aGlzLmNyZWF0ZU1ldHJpY0NhcmQoZ3JpZCwgXCJBdmcgU2NvcmVcIiwgYXZnU2NvcmUsIFwic3RhclwiKTtcbiAgICB0aGlzLmNyZWF0ZU1ldHJpY0NhcmQoZ3JpZCwgXCJTZXNzaW9uc1wiLCBTdHJpbmcoc2NvcmVIaXN0b3J5Lmxlbmd0aCksIFwiYWN0aXZpdHlcIik7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZU1ldHJpY0NhcmQocGFyZW50OiBIVE1MRWxlbWVudCwgbGFiZWw6IHN0cmluZywgdmFsdWU6IHN0cmluZywgaWNvbjogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY2FyZCA9IHBhcmVudC5jcmVhdGVEaXYoeyBjbHM6IFwibmxyLXN0YXRzLW1ldHJpY1wiIH0pO1xuICAgIGNvbnN0IGljb25FbCA9IGNhcmQuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1zdGF0cy1tZXRyaWMtaWNvblwiIH0pO1xuICAgIHNldEljb24oaWNvbkVsLCBpY29uKTtcbiAgICBjYXJkLmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogdmFsdWUsIGNsczogXCJubHItc3RhdHMtbWV0cmljLXZhbHVlXCIgfSk7XG4gICAgY2FyZC5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGxhYmVsLCBjbHM6IFwibmxyLXN0YXRzLW1ldHJpYy1sYWJlbFwiIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJUb29sVXNhZ2VDaGFydChjb250YWluZXI6IEhUTUxFbGVtZW50LCBzZXNzaW9uTG9nOiBTZXNzaW9uTG9nRW50cnlbXSk6IHZvaWQge1xuICAgIGNvbnN0IGNhcmQgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1zdGF0cy1jYXJkXCIgfSk7XG4gICAgY2FyZC5jcmVhdGVFbChcImg1XCIsIHsgdGV4dDogXCJUb29sIFVzYWdlXCIgfSk7XG5cbiAgICBpZiAoc2Vzc2lvbkxvZy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNhcmQuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogXCJObyBzZXNzaW9uIGRhdGFcIiwgY2xzOiBcIm5sci1zdGF0cy1tdXRlZFwiIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRvb2xDb3VudHM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHNlc3Npb25Mb2cpIHtcbiAgICAgIGlmIChlbnRyeS50b29sKSB7XG4gICAgICAgIHRvb2xDb3VudHNbZW50cnkudG9vbF0gPSAodG9vbENvdW50c1tlbnRyeS50b29sXSB8fCAwKSArIDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc29ydGVkID0gT2JqZWN0LmVudHJpZXModG9vbENvdW50cykuc29ydCgoYSwgYikgPT4gYlsxXSAtIGFbMV0pLnNsaWNlKDAsIDE1KTtcbiAgICBpZiAoc29ydGVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY2FyZC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIk5vIHRvb2wgdXNhZ2UgZGF0YVwiLCBjbHM6IFwibmxyLXN0YXRzLW11dGVkXCIgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbWF4Q291bnQgPSBzb3J0ZWRbMF1bMV07XG4gICAgY29uc3QgY2hhcnRFbCA9IGNhcmQuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1zdGF0cy1iYXItY2hhcnRcIiB9KTtcblxuICAgIGZvciAoY29uc3QgW3Rvb2wsIGNvdW50XSBvZiBzb3J0ZWQpIHtcbiAgICAgIGNvbnN0IHJvdyA9IGNoYXJ0RWwuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1zdGF0cy1iYXItcm93XCIgfSk7XG4gICAgICByb3cuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1zdGF0cy1iYXItbGFiZWxcIiwgdGV4dDogdG9vbCB9KTtcblxuICAgICAgY29uc3QgYmFyQ29udGFpbmVyID0gcm93LmNyZWF0ZURpdih7IGNsczogXCJubHItc3RhdHMtYmFyLWNvbnRhaW5lclwiIH0pO1xuICAgICAgY29uc3QgYmFyID0gYmFyQ29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJubHItc3RhdHMtYmFyXCIgfSk7XG4gICAgICBjb25zdCBwY3QgPSBtYXhDb3VudCA+IDAgPyAoY291bnQgLyBtYXhDb3VudCkgKiAxMDAgOiAwO1xuICAgICAgYmFyLnN0eWxlLndpZHRoID0gYCR7cGN0fSVgO1xuXG4gICAgICByb3cuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1zdGF0cy1iYXItdmFsdWVcIiwgdGV4dDogU3RyaW5nKGNvdW50KSB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlclNjb3JlVHJlbmQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgc2NvcmVIaXN0b3J5OiBTY29yZUVudHJ5W10pOiB2b2lkIHtcbiAgICBjb25zdCBjYXJkID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJubHItc3RhdHMtY2FyZFwiIH0pO1xuICAgIGNhcmQuY3JlYXRlRWwoXCJoNVwiLCB7IHRleHQ6IFwiU2NvcmUgVHJlbmRcIiB9KTtcblxuICAgIGlmIChzY29yZUhpc3RvcnkubGVuZ3RoIDwgMikge1xuICAgICAgY2FyZC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIk5lZWQgYXQgbGVhc3QgMiBzZXNzaW9ucyBmb3IgdHJlbmRcIiwgY2xzOiBcIm5sci1zdGF0cy1tdXRlZFwiIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJlY2VudCA9IHNjb3JlSGlzdG9yeS5zbGljZSgtMjApO1xuICAgIGNvbnN0IGNhbnZhcyA9IGNhcmQuY3JlYXRlRWwoXCJjYW52YXNcIiwge1xuICAgICAgY2xzOiBcIm5sci1zdGF0cy1jYW52YXNcIixcbiAgICAgIGF0dHI6IHsgd2lkdGg6IFwiNDAwXCIsIGhlaWdodDogXCIxNTBcIiB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICBpZiAoIWN0eCkgcmV0dXJuO1xuXG4gICAgY29uc3Qgc2NvcmVzID0gcmVjZW50Lm1hcCgoZSkgPT4gZS5zY29yZSk7XG4gICAgY29uc3QgbWluU2NvcmUgPSBNYXRoLm1pbiguLi5zY29yZXMpO1xuICAgIGNvbnN0IG1heFNjb3JlID0gTWF0aC5tYXgoLi4uc2NvcmVzKTtcbiAgICBjb25zdCByYW5nZSA9IG1heFNjb3JlIC0gbWluU2NvcmUgfHwgMTtcblxuICAgIGNvbnN0IHcgPSBjYW52YXMud2lkdGg7XG4gICAgY29uc3QgaCA9IGNhbnZhcy5oZWlnaHQ7XG4gICAgY29uc3QgcGFkZGluZyA9IDIwO1xuICAgIGNvbnN0IHBsb3RXID0gdyAtIHBhZGRpbmcgKiAyO1xuICAgIGNvbnN0IHBsb3RIID0gaCAtIHBhZGRpbmcgKiAyO1xuXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gXCJ2YXIoLS10ZXh0LW11dGVkLCAjODg4KVwiO1xuICAgIGN0eC5saW5lV2lkdGggPSAwLjU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8ocGFkZGluZywgcGFkZGluZyk7XG4gICAgY3R4LmxpbmVUbyhwYWRkaW5nLCBoIC0gcGFkZGluZyk7XG4gICAgY3R4LmxpbmVUbyh3IC0gcGFkZGluZywgaCAtIHBhZGRpbmcpO1xuICAgIGN0eC5zdHJva2UoKTtcblxuICAgIGN0eC5zdHJva2VTdHlsZSA9IFwidmFyKC0taW50ZXJhY3RpdmUtYWNjZW50LCAjN2I2OGVlKVwiO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NvcmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCB4ID0gcGFkZGluZyArIChpIC8gKHNjb3Jlcy5sZW5ndGggLSAxKSkgKiBwbG90VztcbiAgICAgIGNvbnN0IHkgPSBoIC0gcGFkZGluZyAtICgoc2NvcmVzW2ldIC0gbWluU2NvcmUpIC8gcmFuZ2UpICogcGxvdEg7XG4gICAgICBpZiAoaSA9PT0gMCkgY3R4Lm1vdmVUbyh4LCB5KTtcbiAgICAgIGVsc2UgY3R4LmxpbmVUbyh4LCB5KTtcbiAgICB9XG4gICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzY29yZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHggPSBwYWRkaW5nICsgKGkgLyAoc2NvcmVzLmxlbmd0aCAtIDEpKSAqIHBsb3RXO1xuICAgICAgY29uc3QgeSA9IGggLSBwYWRkaW5nIC0gKChzY29yZXNbaV0gLSBtaW5TY29yZSkgLyByYW5nZSkgKiBwbG90SDtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcInZhcigtLWludGVyYWN0aXZlLWFjY2VudCwgIzdiNjhlZSlcIjtcbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGN0eC5hcmMoeCwgeSwgMywgMCwgTWF0aC5QSSAqIDIpO1xuICAgICAgY3R4LmZpbGwoKTtcbiAgICB9XG5cbiAgICBjdHguZmlsbFN0eWxlID0gXCJ2YXIoLS10ZXh0LW11dGVkLCAjODg4KVwiO1xuICAgIGN0eC5mb250ID0gXCIxMHB4IHNhbnMtc2VyaWZcIjtcbiAgICBjdHguZmlsbFRleHQobWF4U2NvcmUudG9GaXhlZCgxKSwgMiwgcGFkZGluZyArIDQpO1xuICAgIGN0eC5maWxsVGV4dChtaW5TY29yZS50b0ZpeGVkKDEpLCAyLCBoIC0gcGFkZGluZyArIDQpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJSZWNlbnRBY3Rpdml0eShjb250YWluZXI6IEhUTUxFbGVtZW50LCBzZXNzaW9uTG9nOiBTZXNzaW9uTG9nRW50cnlbXSk6IHZvaWQge1xuICAgIGNvbnN0IGNhcmQgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcIm5sci1zdGF0cy1jYXJkXCIgfSk7XG4gICAgY2FyZC5jcmVhdGVFbChcImg1XCIsIHsgdGV4dDogXCJSZWNlbnQgQWN0aXZpdHlcIiB9KTtcblxuICAgIGNvbnN0IHJlY2VudCA9IHNlc3Npb25Mb2cuc2xpY2UoLTEwKS5yZXZlcnNlKCk7XG4gICAgaWYgKHJlY2VudC5sZW5ndGggPT09IDApIHtcbiAgICAgIGNhcmQuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogXCJObyByZWNlbnQgYWN0aXZpdHlcIiwgY2xzOiBcIm5sci1zdGF0cy1tdXRlZFwiIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRhYmxlID0gY2FyZC5jcmVhdGVFbChcInRhYmxlXCIsIHsgY2xzOiBcIm5sci1zdGF0cy10YWJsZVwiIH0pO1xuICAgIGNvbnN0IHRoZWFkID0gdGFibGUuY3JlYXRlRWwoXCJ0aGVhZFwiKTtcbiAgICBjb25zdCBoZWFkZXJSb3cgPSB0aGVhZC5jcmVhdGVFbChcInRyXCIpO1xuICAgIGhlYWRlclJvdy5jcmVhdGVFbChcInRoXCIsIHsgdGV4dDogXCJUb29sXCIgfSk7XG4gICAgaGVhZGVyUm93LmNyZWF0ZUVsKFwidGhcIiwgeyB0ZXh0OiBcIlRpbWVcIiB9KTtcbiAgICBoZWFkZXJSb3cuY3JlYXRlRWwoXCJ0aFwiLCB7IHRleHQ6IFwiRHVyYXRpb25cIiB9KTtcbiAgICBoZWFkZXJSb3cuY3JlYXRlRWwoXCJ0aFwiLCB7IHRleHQ6IFwiU3RhdHVzXCIgfSk7XG5cbiAgICBjb25zdCB0Ym9keSA9IHRhYmxlLmNyZWF0ZUVsKFwidGJvZHlcIik7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiByZWNlbnQpIHtcbiAgICAgIGNvbnN0IHJvdyA9IHRib2R5LmNyZWF0ZUVsKFwidHJcIik7XG4gICAgICByb3cuY3JlYXRlRWwoXCJ0ZFwiLCB7IHRleHQ6IGVudHJ5LnRvb2wgfHwgXCJ1bmtub3duXCIgfSk7XG4gICAgICByb3cuY3JlYXRlRWwoXCJ0ZFwiLCB7XG4gICAgICAgIHRleHQ6IGVudHJ5LnRpbWVzdGFtcCA/IG5ldyBEYXRlKGVudHJ5LnRpbWVzdGFtcCkudG9Mb2NhbGVUaW1lU3RyaW5nKCkgOiBcIi1cIixcbiAgICAgIH0pO1xuICAgICAgcm93LmNyZWF0ZUVsKFwidGRcIiwge1xuICAgICAgICB0ZXh0OiBlbnRyeS5kdXJhdGlvbl9tcyAhPT0gdW5kZWZpbmVkID8gYCR7ZW50cnkuZHVyYXRpb25fbXN9bXNgIDogXCItXCIsXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHN0YXR1c0NlbGwgPSByb3cuY3JlYXRlRWwoXCJ0ZFwiKTtcbiAgICAgIGlmIChlbnRyeS5zdWNjZXNzID09PSB0cnVlKSB7XG4gICAgICAgIHN0YXR1c0NlbGwuY3JlYXRlRWwoXCJzcGFuXCIsIHsgdGV4dDogXCJcXHUyNzEzXCIsIGNsczogXCJubHItc3RhdHMtc3VjY2Vzc1wiIH0pO1xuICAgICAgfSBlbHNlIGlmIChlbnRyeS5zdWNjZXNzID09PSBmYWxzZSkge1xuICAgICAgICBzdGF0dXNDZWxsLmNyZWF0ZUVsKFwic3BhblwiLCB7IHRleHQ6IFwiXFx1MjcxN1wiLCBjbHM6IFwibmxyLXN0YXRzLWZhaWx1cmVcIiB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXR1c0NlbGwuY3JlYXRlRWwoXCJzcGFuXCIsIHsgdGV4dDogXCItXCIgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZWFkSGVhcnRiZWF0KG5sclJvb3Q6IHN0cmluZyk6IEhlYXJ0YmVhdERhdGEgfCBudWxsIHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihubHJSb290LCBcInN0YXRlXCIsIFwiaGVhcnRiZWF0Lmpzb25cIik7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsIFwidXRmLThcIik7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBIZWFydGJlYXREYXRhO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZWFkSnNvbmw8VD4oZmlsZVBhdGg6IHN0cmluZyk6IFRbXSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsIFwidXRmLThcIik7XG4gICAgICByZXR1cm4gY29udGVudFxuICAgICAgICAuc3BsaXQoXCJcXG5cIilcbiAgICAgICAgLmZpbHRlcigobGluZSkgPT4gbGluZS50cmltKCkpXG4gICAgICAgIC5tYXAoKGxpbmUpID0+IEpTT04ucGFyc2UobGluZSkgYXMgVCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjb3VudEZpbGVzKGRpclBhdGg6IHN0cmluZywgZXh0ZW5zaW9uOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyUGF0aCkpIHJldHVybiAwO1xuICAgICAgcmV0dXJuIGZzLnJlYWRkaXJTeW5jKGRpclBhdGgpLmZpbHRlcigoZikgPT4gZi5lbmRzV2l0aChleHRlbnNpb24pKS5sZW5ndGg7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNvdW50UGVuZGluZ1Rhc2tzKG5sclJvb3Q6IHN0cmluZyk6IG51bWJlciB7XG4gICAgY29uc3QgdGFza0RpciA9IHBhdGguam9pbihubHJSb290LCBcIjA3LW5ldXJvLWxpbmstdGFza1wiKTtcbiAgICB0cnkge1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRhc2tEaXIpKSByZXR1cm4gMDtcbiAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmModGFza0RpcikuZmlsdGVyKChmKSA9PiBmLmVuZHNXaXRoKFwiLm1kXCIpKTtcbiAgICAgIGxldCBwZW5kaW5nID0gMDtcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKHRhc2tEaXIsIGZpbGUpLCBcInV0Zi04XCIpO1xuICAgICAgICAgIGlmIChjb250ZW50LmluY2x1ZGVzKFwic3RhdHVzOiBwZW5kaW5nXCIpKSB7XG4gICAgICAgICAgICBwZW5kaW5nKys7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyBza2lwIHVucmVhZGFibGUgZmlsZXNcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHBlbmRpbmc7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUtPOzs7QUNMUCxzQkFPTztBQUVQLFNBQW9CO0FBQ3BCLFdBQXNCO0FBQ3RCLDJCQUF5QjtBQUN6QixrQkFBMEI7QUFFMUIsSUFBTSxvQkFBZ0IsdUJBQVUsNkJBQVE7QUE4QnhDLElBQU0sZUFBdUc7QUFBQTtBQUFBLEVBRTNHLEVBQUUsS0FBSyxzQkFBc0IsT0FBTyxzQkFBc0IsTUFBTSxxREFBcUQsTUFBTSxhQUFhO0FBQUEsRUFDeEksRUFBRSxLQUFLLHFCQUFxQixPQUFPLHFCQUFxQixNQUFNLDJGQUEyRixNQUFNLFlBQVk7QUFBQTtBQUFBLEVBRTNLLEVBQUUsS0FBSyxvQkFBb0IsT0FBTyx3QkFBd0IsTUFBTSxxRUFBcUUsTUFBTSxZQUFZO0FBQUEsRUFDdkosRUFBRSxLQUFLLHNCQUFzQixPQUFPLHNCQUFzQixNQUFNLHVFQUF1RSxNQUFNLFlBQVk7QUFBQTtBQUFBLEVBRXpKLEVBQUUsS0FBSyxxQkFBcUIsT0FBTyx3QkFBd0IsTUFBTSx1RUFBa0UsWUFBWSx1Q0FBdUMsTUFBTSxZQUFZO0FBQUEsRUFDeE0sRUFBRSxLQUFLLGNBQWMsT0FBTyxjQUFjLE1BQU0sdUNBQXVDLFlBQVkseUJBQXlCLE1BQU0sWUFBWTtBQUFBLEVBQzlJLEVBQUUsS0FBSyxhQUFhLE9BQU8sa0JBQWtCLE1BQU0sb0RBQW9ELFlBQVkseUJBQXlCLE1BQU0saUJBQWlCO0FBQUEsRUFDbkssRUFBRSxLQUFLLGtCQUFrQixPQUFPLGtCQUFrQixNQUFNLHFDQUFxQyxZQUFZLHlCQUF5QixNQUFNLFlBQVk7QUFBQSxFQUNwSixFQUFFLEtBQUssa0JBQWtCLE9BQU8sa0JBQWtCLE1BQU0sa0RBQWtELFlBQVksaUJBQWlCLE1BQU0sWUFBWTtBQUFBO0FBQUEsRUFFekosRUFBRSxLQUFLLG9CQUFvQixPQUFPLG9CQUFvQixNQUFNLG1FQUFtRSxNQUFNLFFBQVE7QUFDL0k7QUFFTyxJQUFNLG1CQUFnQztBQUFBLEVBQzNDLFNBQVM7QUFBQSxFQUNULGVBQWU7QUFBQSxFQUNmLFdBQVc7QUFBQSxFQUNYLFNBQVMsQ0FBQztBQUFBLEVBQ1YsV0FBVyxDQUFDO0FBQUEsRUFDWixlQUFlO0FBQUEsRUFDZixvQkFBb0I7QUFBQSxFQUNwQixlQUFlO0FBQUEsRUFDZixhQUFhO0FBQUEsRUFDYixnQkFBZ0I7QUFBQSxFQUNoQixjQUFjO0FBQUEsRUFDZCxXQUFXO0FBQUEsRUFDWCxjQUFjO0FBQUEsRUFDZCxxQkFBcUI7QUFBQSxFQUNyQixXQUFXLENBQUM7QUFDZDtBQUVPLElBQU0sZ0JBQU4sY0FBNEIsaUNBQWlCO0FBQUEsRUFHbEQsWUFBWSxLQUFVLFFBQW1CO0FBQ3ZDLFVBQU0sS0FBSyxNQUFNO0FBQ2pCLFNBQUssU0FBUztBQUFBLEVBQ2hCO0FBQUEsRUFFQSxVQUFnQjtBQUNkLFVBQU0sRUFBRSxZQUFZLElBQUk7QUFDeEIsZ0JBQVksTUFBTTtBQUVsQixTQUFLLG1CQUFtQixXQUFXO0FBQ25DLFNBQUssMEJBQTBCLFdBQVc7QUFDMUMsU0FBSyxxQkFBcUIsV0FBVztBQUNyQyxTQUFLLHFCQUFxQixXQUFXO0FBQ3JDLFNBQUssaUJBQWlCLFdBQVc7QUFDakMsU0FBSyxxQkFBcUIsV0FBVztBQUNyQyxTQUFLLHFCQUFxQixXQUFXO0FBQUEsRUFDdkM7QUFBQSxFQUVRLG1CQUFtQixhQUFnQztBQUN6RCxnQkFBWSxTQUFTLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUU1QyxRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxVQUFVLEVBQ2xCLFFBQVEsMkNBQTJDLEVBQ25EO0FBQUEsTUFBUSxDQUFDLFNBQ1IsS0FDRyxlQUFlLCtCQUErQixFQUM5QyxTQUFTLEtBQUssT0FBTyxTQUFTLE9BQU8sRUFDckMsU0FBUyxPQUFPLFVBQVU7QUFDekIsYUFBSyxPQUFPLFNBQVMsVUFBVTtBQUMvQixjQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsTUFDakMsQ0FBQztBQUFBLElBQ0wsRUFDQztBQUFBLE1BQVUsQ0FBQyxRQUNWLElBQUksY0FBYyxhQUFhLEVBQUUsUUFBUSxZQUFZO0FBQ25ELGNBQU0sV0FBVyxLQUFLLE9BQU8sY0FBYztBQUMzQyxZQUFJLFVBQVU7QUFDWixlQUFLLE9BQU8sU0FBUyxVQUFVO0FBQy9CLGdCQUFNLEtBQUssT0FBTyxhQUFhO0FBQy9CLGVBQUssUUFBUTtBQUNiLGNBQUksdUJBQU8sc0JBQXNCLFFBQVEsRUFBRTtBQUFBLFFBQzdDLE9BQU87QUFDTCxjQUFJLHVCQUFPLGdDQUFnQztBQUFBLFFBQzdDO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUVGLFFBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLHdCQUF3QixFQUNoQyxRQUFRLHdFQUF3RSxFQUNoRjtBQUFBLE1BQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSwyQkFBMkIsRUFDMUMsU0FBUyxLQUFLLE9BQU8sU0FBUyxhQUFhLEVBQzNDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGFBQUssT0FBTyxTQUFTLGdCQUFnQjtBQUNyQyxjQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsTUFDakMsQ0FBQztBQUFBLElBQ0w7QUFFRixRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxxQkFBcUIsRUFDN0IsUUFBUSxrQ0FBa0MsRUFDMUM7QUFBQSxNQUFRLENBQUMsU0FDUixLQUNHLFNBQVMsS0FBSyxPQUFPLFNBQVMsU0FBUyxFQUN2QyxZQUFZLElBQUk7QUFBQSxJQUNyQjtBQUFBLEVBQ0o7QUFBQSxFQUVRLDBCQUEwQixhQUFnQztBQUNoRSxnQkFBWSxTQUFTLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3BELGdCQUFZLFNBQVMsS0FBSztBQUFBLE1BQ3hCLE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxJQUNQLENBQUM7QUFFRCxVQUFNLFVBQVUsS0FBSyxPQUFPLFNBQVM7QUFDckMsUUFBSSxDQUFDLFNBQVM7QUFDWixVQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxvQkFBb0IsRUFDNUIsUUFBUSwyREFBMkQ7QUFDdEU7QUFBQSxJQUNGO0FBRUEsVUFBTSxjQUFjO0FBQUEsTUFDbEIsRUFBRSxNQUFNLFVBQVUsTUFBTSx1QkFBdUI7QUFBQSxNQUMvQyxFQUFFLE1BQU0sYUFBYSxNQUFNLG9DQUFvQztBQUFBLE1BQy9ELEVBQUUsTUFBTSxjQUFjLE1BQU0sZ0NBQWdDO0FBQUEsTUFDNUQsRUFBRSxNQUFNLG9CQUFvQixNQUFNLHVCQUF1QjtBQUFBLE1BQ3pELEVBQUUsTUFBTSwwQkFBMEIsTUFBTSwrQkFBK0I7QUFBQSxNQUN2RSxFQUFFLE1BQU0sb0JBQW9CLE1BQU0sd0JBQXdCO0FBQUEsTUFDMUQsRUFBRSxNQUFNLDRCQUE0QixNQUFNLDRCQUE0QjtBQUFBLE1BQ3RFLEVBQUUsTUFBTSxpQ0FBaUMsTUFBTSx3QkFBd0I7QUFBQSxNQUN2RSxFQUFFLE1BQU0sdUJBQXVCLE1BQU0sK0JBQStCO0FBQUEsTUFDcEUsRUFBRSxNQUFNLHNCQUFzQixNQUFNLGFBQWE7QUFBQSxNQUNqRCxFQUFFLE1BQU0sZ0JBQWdCLE1BQU0scUJBQXFCO0FBQUEsTUFDbkQsRUFBRSxNQUFNLG9CQUFvQixNQUFNLHFCQUFxQjtBQUFBLE1BQ3ZELEVBQUUsTUFBTSxVQUFVLE1BQU0sc0JBQXNCO0FBQUEsSUFDaEQ7QUFHQSxVQUFNLGFBQWtCLFVBQUssU0FBUyxVQUFVLGVBQWU7QUFDL0QsUUFBSSxpQkFBMkIsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUk7QUFDNUQsUUFBTyxjQUFXLFVBQVUsR0FBRztBQUM3QixZQUFNLFVBQWEsZ0JBQWEsWUFBWSxPQUFPO0FBQ25ELFlBQU0sUUFBUSxRQUFRLE1BQU0sdUJBQXVCO0FBQ25ELFVBQUksU0FBUyxNQUFNLENBQUMsRUFBRSxLQUFLLE1BQU0sT0FBTztBQUN0Qyx5QkFBaUIsTUFBTSxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRSxPQUFPLE9BQU87QUFBQSxNQUMxRTtBQUFBLElBQ0Y7QUFFQSxlQUFXLFVBQVUsYUFBYTtBQUNoQyxZQUFNLFlBQVksZUFBZSxTQUFTLE9BQU8sSUFBSTtBQUNyRCxVQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxPQUFPLElBQUksRUFDbkIsUUFBUSxPQUFPLElBQUksRUFDbkI7QUFBQSxRQUFVLENBQUMsV0FDVixPQUFPLFNBQVMsU0FBUyxFQUFFLFNBQVMsT0FBTyxVQUFVO0FBQ25ELGNBQUksU0FBUyxDQUFDLGVBQWUsU0FBUyxPQUFPLElBQUksR0FBRztBQUNsRCwyQkFBZSxLQUFLLE9BQU8sSUFBSTtBQUFBLFVBQ2pDLFdBQVcsQ0FBQyxPQUFPO0FBQ2pCLGtCQUFNLE1BQU0sZUFBZSxRQUFRLE9BQU8sSUFBSTtBQUM5QyxnQkFBSSxPQUFPO0FBQUcsNkJBQWUsT0FBTyxLQUFLLENBQUM7QUFBQSxVQUM1QztBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNKO0FBRUEsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCO0FBQUEsTUFBVSxDQUFDLFFBQ1YsSUFDRyxjQUFjLG9CQUFvQixFQUNsQyxPQUFPLEVBQ1AsUUFBUSxZQUFZO0FBQ25CLGNBQU0sS0FBSyxpQkFBaUIsY0FBYztBQUFBLE1BQzVDLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQUFBLEVBRUEsTUFBYyxpQkFBaUIsU0FBa0M7QUFDL0QsVUFBTSxVQUFVLEtBQUssT0FBTyxTQUFTO0FBQ3JDLFFBQUksQ0FBQztBQUFTO0FBRWQsVUFBTSxhQUFrQixVQUFLLFNBQVMsVUFBVSxlQUFlO0FBQy9ELFFBQUksQ0FBSSxjQUFXLFVBQVUsR0FBRztBQUM5QixVQUFJLHVCQUFPLHlCQUF5QjtBQUNwQztBQUFBLElBQ0Y7QUFFQSxRQUFJLFVBQWEsZ0JBQWEsWUFBWSxPQUFPO0FBQ2pELFVBQU0sYUFBYSxRQUFRLEtBQUssSUFBSTtBQUVwQyxRQUFJLFFBQVEsU0FBUyxnQkFBZ0IsR0FBRztBQUN0QyxnQkFBVSxRQUFRLFFBQVEsdUJBQXVCLGtCQUFrQixVQUFVLEVBQUU7QUFBQSxJQUNqRixPQUFPO0FBRUwsZ0JBQVUsUUFBUSxRQUFRLFNBQVM7QUFBQSxpQkFBb0IsVUFBVTtBQUFBLElBQU87QUFBQSxJQUMxRTtBQUVBLElBQUcsaUJBQWMsWUFBWSxTQUFTLE9BQU87QUFDN0MsUUFBSSx1QkFBTywwQkFBMEIsUUFBUSxNQUFNLGtCQUFrQjtBQUFBLEVBQ3ZFO0FBQUEsRUFFUSxxQkFBcUIsYUFBZ0M7QUFDM0QsZ0JBQVksU0FBUyxNQUFNLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUcxRCxlQUFXLE9BQU8sY0FBYztBQUM5QixVQUFJLElBQUksY0FBYyxDQUFDLEtBQUssT0FBTyxTQUFTLFFBQVEsSUFBSSxHQUFHLEdBQUc7QUFDNUQsYUFBSyxPQUFPLFNBQVMsUUFBUSxJQUFJLEdBQUcsSUFBSSxJQUFJO0FBQUEsTUFDOUM7QUFBQSxJQUNGO0FBRUEsUUFBSSxjQUFjO0FBQ2xCLGVBQVcsT0FBTyxjQUFjO0FBRTlCLFlBQU0sVUFDSixJQUFJLElBQUksU0FBUyxZQUFZLEtBQUssSUFBSSxJQUFJLFNBQVMsV0FBVyxJQUFJLGtCQUNsRSxJQUFJLElBQUksU0FBUyxZQUFZLEtBQUssSUFBSSxJQUFJLFNBQVMsVUFBVSxJQUFJLHlCQUNqRSxJQUFJLElBQUksU0FBUyxXQUFXLEtBQUssSUFBSSxJQUFJLFNBQVMsUUFBUSxLQUFLLElBQUksSUFBSSxTQUFTLE9BQU8sSUFBSSx5QkFDM0Y7QUFDRixVQUFJLFlBQVksYUFBYTtBQUMzQixvQkFBWSxTQUFTLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUM1QyxzQkFBYztBQUFBLE1BQ2hCO0FBRUEsWUFBTSxhQUFhLENBQUMsSUFBSSxJQUFJLFNBQVMsS0FBSyxLQUFLLENBQUMsSUFBSSxJQUFJLFNBQVMsS0FBSztBQUN0RSxZQUFNLFVBQVUsSUFBSSx3QkFBUSxXQUFXLEVBQ3BDLFFBQVEsSUFBSSxLQUFLLEVBQ2pCLFFBQVEsSUFBSSxJQUFJO0FBRW5CLGNBQVEsUUFBUSxDQUFDLFNBQVM7QUFDeEIsY0FBTSxjQUFjLElBQUksY0FBYyxJQUFJO0FBQzFDLGFBQ0csZUFBZSxXQUFXLEVBQzFCLFNBQVMsS0FBSyxPQUFPLFNBQVMsUUFBUSxJQUFJLEdBQUcsS0FBSyxFQUFFO0FBQ3ZELFlBQUksWUFBWTtBQUNkLGVBQUssUUFBUSxPQUFPO0FBQUEsUUFDdEI7QUFDQSxhQUFLLFNBQVMsT0FBTyxVQUFVO0FBQzdCLGVBQUssT0FBTyxTQUFTLFFBQVEsSUFBSSxHQUFHLElBQUk7QUFDeEMsZ0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxRQUNqQyxDQUFDO0FBQUEsTUFDSCxDQUFDO0FBRUQsY0FBUTtBQUFBLFFBQVUsQ0FBQyxRQUNqQixJQUNHLGNBQWMsTUFBTSxFQUNwQixPQUFPLEVBQ1AsUUFBUSxZQUFZO0FBQ25CLGdCQUFNLEtBQUssV0FBVyxJQUFJLEdBQUc7QUFBQSxRQUMvQixDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0Y7QUFFQSxRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxzQkFBc0IsRUFDOUIsUUFBUSx3REFBd0QsRUFDaEU7QUFBQSxNQUFVLENBQUMsUUFDVixJQUNHLGNBQWMsTUFBTSxFQUNwQixXQUFXLEVBQ1gsUUFBUSxZQUFZO0FBQ25CLGNBQU0sS0FBSyxlQUFlO0FBQUEsTUFDNUIsQ0FBQztBQUFBLElBQ0w7QUFFRixRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSx3QkFBd0IsRUFDaEMsUUFBUSwrQ0FBK0MsRUFDdkQ7QUFBQSxNQUFVLENBQUMsUUFDVixJQUNHLGNBQWMsTUFBTSxFQUNwQixRQUFRLFlBQVk7QUFDbkIsY0FBTSxLQUFLLGVBQWU7QUFDMUIsYUFBSyxRQUFRO0FBQUEsTUFDZixDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFBQSxFQUVRLHFCQUFxQixhQUFnQztBQUMzRCxnQkFBWSxTQUFTLE1BQU0sRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRTFELFVBQU0sWUFBWSxLQUFLLE9BQU8sU0FBUztBQUV2QyxRQUFJLFVBQVUsV0FBVyxHQUFHO0FBQzFCLFVBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLHlCQUF5QixFQUNqQyxRQUFRLGtDQUFrQyxFQUMxQztBQUFBLFFBQVUsQ0FBQyxRQUNWLElBQUksY0FBYyxrQkFBa0IsRUFBRSxRQUFRLFlBQVk7QUFDeEQsZ0JBQU0sS0FBSyx3QkFBd0I7QUFDbkMsZUFBSyxRQUFRO0FBQUEsUUFDZixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0o7QUFFQSxhQUFTLElBQUksR0FBRyxJQUFJLFVBQVUsUUFBUSxLQUFLO0FBQ3pDLFlBQU0sSUFBSSxVQUFVLENBQUM7QUFDckIsWUFBTSxVQUFVLElBQUksd0JBQVEsV0FBVyxFQUNwQyxRQUFRLEVBQUUsSUFBSSxFQUNkLFFBQVEsR0FBRyxFQUFFLElBQUksTUFBTSxFQUFFLElBQUksTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUVoRCxVQUFJLEVBQUUsS0FBSztBQUNULGdCQUFRO0FBQUEsVUFBVSxDQUFDLFFBQ2pCLElBQUksY0FBYyxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsWUFBWTtBQUNyRCxrQkFBTSxLQUFLLHNCQUFzQixDQUFDO0FBQUEsVUFDcEMsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBRUEsY0FBUTtBQUFBLFFBQVUsQ0FBQyxRQUNqQixJQUNHLGNBQWMsUUFBUSxFQUN0QixXQUFXLEVBQ1gsUUFBUSxZQUFZO0FBQ25CLG9CQUFVLE9BQU8sR0FBRyxDQUFDO0FBQ3JCLGdCQUFNLEtBQUssT0FBTyxhQUFhO0FBQy9CLGVBQUssUUFBUTtBQUFBLFFBQ2YsQ0FBQztBQUFBLE1BQ0w7QUFBQSxJQUNGO0FBRUEsUUFBSSx3QkFBUSxXQUFXLEVBQUU7QUFBQSxNQUFVLENBQUMsUUFDbEMsSUFBSSxjQUFjLGFBQWEsRUFBRSxRQUFRLE1BQU07QUFDN0Msa0JBQVUsS0FBSztBQUFBLFVBQ2IsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsS0FBSztBQUFBLFVBQ0wsV0FBVztBQUFBLFVBQ1gsTUFBTTtBQUFBLFVBQ04sY0FBYyxDQUFDO0FBQUEsUUFDakIsQ0FBQztBQUNELGFBQUssT0FBTyxhQUFhO0FBQ3pCLGFBQUssUUFBUTtBQUFBLE1BQ2YsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQUEsRUFFUSxpQkFBaUIsYUFBZ0M7QUFDdkQsZ0JBQVksU0FBUyxNQUFNLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFHaEQsUUFBSSxDQUFDLEtBQUssT0FBTyxTQUFTLHNCQUFzQixLQUFLLE9BQU8sU0FBUyxTQUFTO0FBQzVFLFdBQUssT0FBTyxTQUFTLHFCQUEwQixVQUFLLEtBQUssT0FBTyxTQUFTLFNBQVMsc0JBQXNCO0FBQUEsSUFDMUc7QUFFQSxRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxpQkFBaUIsRUFDekIsUUFBUSwrQkFBK0IsRUFDdkM7QUFBQSxNQUFZLENBQUMsU0FDWixLQUNHLFVBQVUsU0FBUyxPQUFPLEVBQzFCLFVBQVUsUUFBUSxVQUFVLEVBQzVCLFNBQVMsS0FBSyxPQUFPLFNBQVMsYUFBYSxFQUMzQyxTQUFTLE9BQU8sVUFBVTtBQUN6QixhQUFLLE9BQU8sU0FBUyxnQkFBZ0I7QUFDckMsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNMO0FBRUYsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEseUJBQXlCLEVBQ2pDLFFBQVEsc0VBQXNFLEVBQzlFO0FBQUEsTUFBUSxDQUFDLFNBQ1IsS0FDRyxlQUFvQixVQUFLLEtBQUssT0FBTyxTQUFTLFdBQVcsdUJBQXVCLHNCQUFzQixDQUFDLEVBQ3ZHLFNBQVMsS0FBSyxPQUFPLFNBQVMsa0JBQWtCLEVBQ2hELFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGFBQUssT0FBTyxTQUFTLHFCQUFxQjtBQUMxQyxjQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsTUFDakMsQ0FBQztBQUFBLElBQ0w7QUFFRixRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxpQkFBaUIsRUFDekIsUUFBUSw2QkFBNkIsRUFDckM7QUFBQSxNQUFRLENBQUMsU0FDUixLQUNHLFNBQVMsT0FBTyxLQUFLLE9BQU8sU0FBUyxhQUFhLENBQUMsRUFDbkQsU0FBUyxPQUFPLFVBQVU7QUFDekIsY0FBTSxTQUFTLFNBQVMsT0FBTyxFQUFFO0FBQ2pDLFlBQUksQ0FBQyxNQUFNLE1BQU0sS0FBSyxTQUFTLEtBQUssU0FBUyxPQUFPO0FBQ2xELGVBQUssT0FBTyxTQUFTLGdCQUFnQjtBQUNyQyxnQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFFBQ2pDO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDTDtBQUVGLFFBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLGNBQWMsRUFDdEIsUUFBUSxnRUFBZ0UsRUFDeEU7QUFBQSxNQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsNEJBQTRCLEVBQzNDLFNBQVMsS0FBSyxPQUFPLFNBQVMsV0FBVyxFQUN6QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixhQUFLLE9BQU8sU0FBUyxjQUFjO0FBQ25DLGNBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxNQUNqQyxDQUFDO0FBQUEsSUFDTDtBQUdGLGdCQUFZLFNBQVMsTUFBTSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDaEUsZ0JBQVksU0FBUyxLQUFLO0FBQUEsTUFDeEIsTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLElBQ1AsQ0FBQztBQUVELFVBQU0sT0FBTyxLQUFLLE9BQU8sU0FBUyxpQkFBaUI7QUFDbkQsVUFBTSxVQUFVLEtBQUssT0FBTyxTQUFTO0FBQ3JDLFFBQUksUUFBUTtBQUNaLFFBQUksU0FBUztBQUNYLFlBQU0sVUFBZSxVQUFLLFNBQVMsV0FBVyxNQUFNO0FBQ3BELFVBQU8sY0FBVyxPQUFPLEdBQUc7QUFDMUIsY0FBTSxVQUFhLGdCQUFhLFNBQVMsT0FBTztBQUNoRCxjQUFNLFFBQVEsUUFBUSxNQUFNLG9CQUFvQjtBQUNoRCxZQUFJO0FBQU8sa0JBQVEsTUFBTSxDQUFDLEVBQUUsS0FBSztBQUFBLE1BQ25DO0FBQUEsSUFDRjtBQUVBLFVBQU0sVUFBVSxLQUFLLE9BQU8sa0JBQWtCO0FBRzlDLFVBQU0sY0FBYyxLQUFLLFVBQVU7QUFBQSxNQUNqQyxZQUFZO0FBQUEsUUFDVixjQUFjO0FBQUEsVUFDWixNQUFNO0FBQUEsVUFDTixTQUFTO0FBQUEsVUFDVCxNQUFNLENBQUMsS0FBSztBQUFBLFVBQ1osS0FBSyxFQUFFLFVBQVUsV0FBVyxzQkFBc0I7QUFBQSxRQUNwRDtBQUFBLE1BQ0Y7QUFBQSxJQUNGLEdBQUcsTUFBTSxDQUFDO0FBR1YsVUFBTSxVQUFVLEtBQUssT0FBTyxTQUFTLGNBQ2pDLFdBQVcsS0FBSyxPQUFPLFNBQVMsV0FBVyxLQUMzQyxvQkFBb0IsSUFBSTtBQUM1QixVQUFNLGFBQWEsS0FBSyxVQUFVO0FBQUEsTUFDaEMsWUFBWTtBQUFBLFFBQ1YsY0FBYztBQUFBLFVBQ1osTUFBTTtBQUFBLFVBQ04sS0FBSyxHQUFHLE9BQU87QUFBQSxVQUNmLFNBQVMsRUFBRSxlQUFlLFVBQVUsU0FBUyxpQkFBaUIsR0FBRztBQUFBLFFBQ25FO0FBQUEsTUFDRjtBQUFBLElBQ0YsR0FBRyxNQUFNLENBQUM7QUFFVixVQUFNLFdBQVcsWUFBWSxTQUFTLE9BQU8sRUFBRSxLQUFLLGlCQUFpQixDQUFDO0FBQ3RFLGFBQVMsU0FBUyxNQUFNLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUM5RSxhQUFTLFNBQVMsT0FBTyxFQUFFLEtBQUssaUJBQWlCLENBQUMsRUFBRSxTQUFTLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMxRixRQUFJLHdCQUFRLFFBQVEsRUFBRTtBQUFBLE1BQVUsQ0FBQyxRQUMvQixJQUFJLGNBQWMsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLFFBQVEsWUFBWTtBQUNsRSxjQUFNLFVBQVUsVUFBVSxVQUFVLFdBQVc7QUFDL0MsWUFBSSx1QkFBTyx5QkFBeUI7QUFBQSxNQUN0QyxDQUFDO0FBQUEsSUFDSDtBQUVBLFVBQU0sVUFBVSxZQUFZLFNBQVMsT0FBTyxFQUFFLEtBQUssaUJBQWlCLENBQUM7QUFDckUsWUFBUSxTQUFTLE1BQU0sRUFBRSxNQUFNLDhEQUE4RCxDQUFDO0FBQzlGLFlBQVEsU0FBUyxPQUFPLEVBQUUsS0FBSyxpQkFBaUIsQ0FBQyxFQUFFLFNBQVMsUUFBUSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3hGLFFBQUksd0JBQVEsT0FBTyxFQUFFO0FBQUEsTUFBVSxDQUFDLFFBQzlCLElBQUksY0FBYyxrQkFBa0IsRUFBRSxPQUFPLEVBQUUsUUFBUSxZQUFZO0FBQ2pFLGNBQU0sVUFBVSxVQUFVLFVBQVUsVUFBVTtBQUM5QyxZQUFJLHVCQUFPLHdCQUF3QjtBQUFBLE1BQ3JDLENBQUM7QUFBQSxJQUNIO0FBR0EsVUFBTSxVQUFVLFlBQVksU0FBUyxPQUFPLEVBQUUsS0FBSyxpQkFBaUIsQ0FBQztBQUNyRSxZQUFRLFNBQVMsTUFBTSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDaEUsWUFBUSxTQUFTLE9BQU8sRUFBRSxLQUFLLGlCQUFpQixDQUFDLEVBQUUsU0FBUyxRQUFRO0FBQUEsTUFDbEUsTUFBTSxhQUFhLE9BQU87QUFBQSxlQUF5QixRQUFRLE1BQU0sVUFBVSxHQUFHLENBQUMsSUFBSSxRQUFRLFlBQVk7QUFBQSxVQUFhLE9BQU87QUFBQSxRQUE0QixPQUFPO0FBQUEsSUFDaEssQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUVRLHFCQUFxQixhQUFnQztBQUMzRCxnQkFBWSxTQUFTLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU5QyxRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxpQkFBaUIsRUFDekIsUUFBUSx5REFBeUQsRUFDakU7QUFBQSxNQUFVLENBQUMsV0FDVixPQUFPLFNBQVMsS0FBSyxPQUFPLFNBQVMsY0FBYyxFQUFFLFNBQVMsT0FBTyxVQUFVO0FBQzdFLGFBQUssT0FBTyxTQUFTLGlCQUFpQjtBQUN0QyxjQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsTUFDakMsQ0FBQztBQUFBLElBQ0g7QUFFRixRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxlQUFlLEVBQ3ZCLFFBQVEsNERBQTRELEVBQ3BFO0FBQUEsTUFBVSxDQUFDLFdBQ1YsT0FBTyxTQUFTLEtBQUssT0FBTyxTQUFTLFlBQVksRUFBRSxTQUFTLE9BQU8sVUFBVTtBQUMzRSxhQUFLLE9BQU8sU0FBUyxlQUFlO0FBQ3BDLGNBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxNQUNqQyxDQUFDO0FBQUEsSUFDSDtBQUVGLFFBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLFlBQVksRUFDcEIsUUFBUSw0Q0FBNEMsRUFDcEQ7QUFBQSxNQUFVLENBQUMsV0FDVixPQUFPLFNBQVMsS0FBSyxPQUFPLFNBQVMsU0FBUyxFQUFFLFNBQVMsT0FBTyxVQUFVO0FBQ3hFLGFBQUssT0FBTyxTQUFTLFlBQVk7QUFDakMsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDSjtBQUFBLEVBRVEscUJBQXFCLGFBQWdDO0FBQzNELGdCQUFZLFNBQVMsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTlDLFFBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLE9BQU8sRUFDZixRQUFRLHlDQUF5QyxFQUNqRDtBQUFBLE1BQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSxvQ0FBb0MsRUFDbkQsU0FBUyxLQUFLLE9BQU8sU0FBUyxZQUFZLEVBQzFDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGFBQUssT0FBTyxTQUFTLGVBQWU7QUFDcEMsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNMO0FBRUYsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEsZUFBZSxFQUN2QixRQUFRLGtEQUFrRCxFQUMxRDtBQUFBLE1BQVksQ0FBQyxTQUNaLEtBQ0csZUFBZSx5QkFBeUIsRUFDeEMsU0FBUyxLQUFLLE9BQU8sU0FBUyxtQkFBbUIsRUFDakQsU0FBUyxPQUFPLFVBQVU7QUFDekIsYUFBSyxPQUFPLFNBQVMsc0JBQXNCO0FBQzNDLGNBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxNQUNqQyxDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFBQSxFQUVBLE1BQWMsV0FBVyxTQUFnQztBQUN2RCxVQUFNLFFBQVEsS0FBSyxPQUFPLFNBQVMsUUFBUSxPQUFPO0FBQ2xELFVBQU0sTUFBTSxhQUFhLEtBQUssQ0FBQyxNQUFNLEVBQUUsUUFBUSxPQUFPO0FBQ3RELFVBQU0sUUFBUSxLQUFLLFNBQVM7QUFDNUIsVUFBTSxPQUFPLEtBQUssUUFBUTtBQUUxQixRQUFJLENBQUMsT0FBTztBQUNWLFVBQUksdUJBQU8sR0FBRyxLQUFLLFdBQVc7QUFDOUI7QUFBQSxJQUNGO0FBRUEsUUFBSTtBQUVGLFVBQUksU0FBUyxhQUFhO0FBQ3hCLFlBQUksdUJBQU8sR0FBRyxLQUFLLGdCQUFnQjtBQUNuQztBQUFBLE1BQ0Y7QUFHQSxVQUFJLEtBQUssV0FBVyxhQUFhLEdBQUc7QUFDbEMsY0FBTSxTQUFTLEtBQUssVUFBVSxFQUFFO0FBQ2hDLFlBQUksTUFBTSxXQUFXLE1BQU0sR0FBRztBQUM1QixjQUFJLHVCQUFPLEdBQUcsS0FBSyxtQkFBbUIsTUFBTSxhQUFhO0FBQUEsUUFDM0QsT0FBTztBQUNMLGNBQUksdUJBQU8sR0FBRyxLQUFLLDZCQUE2QixNQUFNLEdBQUc7QUFBQSxRQUMzRDtBQUNBO0FBQUEsTUFDRjtBQUdBLFVBQUksS0FBSyxXQUFXLFNBQVMsR0FBRztBQUM5QixjQUFNLFNBQVMsS0FBSyxVQUFVLENBQUM7QUFDL0IsWUFBSSx1QkFBTyxNQUFNLFdBQVcsTUFBTSxJQUM5QixHQUFHLEtBQUssS0FBSyxLQUFLLFlBQ2xCLEdBQUcsS0FBSyxjQUFjLE1BQU0sU0FBUztBQUN6QztBQUFBLE1BQ0Y7QUFHQSxVQUFJLFNBQVMsYUFBYTtBQUN4QixZQUFJLE1BQU07QUFFVixZQUFJLFlBQVk7QUFBYyxnQkFBTSxNQUFNLFFBQVEsT0FBTyxFQUFFLElBQUk7QUFBQSxpQkFFdEQsWUFBWTtBQUFxQixnQkFBTSxNQUFNLFFBQVEsd0JBQXdCLEVBQUU7QUFJeEYsWUFBSTtBQUNGLGdCQUFNLE9BQU8sTUFBTSxNQUFNLEdBQUc7QUFDNUIsY0FBSSx1QkFBTyxHQUFHLEtBQUssZ0JBQWdCLEtBQUssTUFBTSxVQUFVO0FBQUEsUUFDMUQsUUFBUTtBQUNOLGdCQUFNLE9BQU8sWUFBWSxzQkFDckIsc0RBQ0EsWUFBWSxlQUNaLHlDQUNBLFlBQVksbUJBQ1osd0NBQ0E7QUFDSixjQUFJLHVCQUFPLEdBQUcsS0FBSyxrQkFBa0IsSUFBSSxFQUFFO0FBQUEsUUFDN0M7QUFDQTtBQUFBLE1BQ0Y7QUFHQSxVQUFJLFNBQVMsY0FBYztBQUN6QixjQUFNLE9BQU8sTUFBTSxNQUFNLHVDQUF1QztBQUFBLFVBQzlELFNBQVMsRUFBRSxlQUFlLFVBQVUsS0FBSyxHQUFHO0FBQUEsUUFDOUMsQ0FBQztBQUNELFlBQUksS0FBSyxJQUFJO0FBQ1gsY0FBSSx1QkFBTyxHQUFHLEtBQUssb0JBQW9CO0FBQUEsUUFDekMsT0FBTztBQUNMLGNBQUksdUJBQU8sR0FBRyxLQUFLLFVBQVUsS0FBSyxNQUFNLHVEQUFrRDtBQUFBLFFBQzVGO0FBQ0E7QUFBQSxNQUNGO0FBR0EsVUFBSSxTQUFTLGFBQWE7QUFDeEIsY0FBTSxPQUFPLE1BQU0sTUFBTSx1Q0FBdUM7QUFBQSxVQUM5RCxRQUFRO0FBQUEsVUFDUixTQUFTO0FBQUEsWUFDUCxlQUFlLFVBQVUsS0FBSztBQUFBLFlBQzlCLGdCQUFnQjtBQUFBLFVBQ2xCO0FBQUEsVUFDQSxNQUFNLEtBQUssVUFBVSxFQUFFLEtBQUssdUJBQXVCLFNBQVMsQ0FBQyxVQUFVLEdBQUcsaUJBQWlCLEtBQUssQ0FBQztBQUFBLFFBQ25HLENBQUM7QUFDRCxZQUFJLEtBQUssTUFBTSxLQUFLLFdBQVcsT0FBTyxLQUFLLFdBQVcsS0FBSztBQUN6RCxjQUFJLHVCQUFPLEdBQUcsS0FBSyxvQkFBb0I7QUFBQSxRQUN6QyxXQUFXLEtBQUssV0FBVyxPQUFPLEtBQUssV0FBVyxLQUFLO0FBQ3JELGNBQUksdUJBQU8sR0FBRyxLQUFLLGtCQUFrQixLQUFLLE1BQU0sR0FBRztBQUFBLFFBQ3JELFdBQVcsS0FBSyxXQUFXLEtBQUs7QUFDOUIsY0FBSSx1QkFBTyxHQUFHLEtBQUssbUNBQW1DLEtBQUssTUFBTSxHQUFHO0FBQUEsUUFDdEUsT0FBTztBQUNMLGNBQUksdUJBQU8sR0FBRyxLQUFLLFVBQVUsS0FBSyxNQUFNLEVBQUU7QUFBQSxRQUM1QztBQUNBO0FBQUEsTUFDRjtBQUdBLFVBQUksU0FBUyxTQUFTO0FBQ3BCLFlBQUk7QUFDRixnQkFBTSxjQUFjLFNBQVMsQ0FBQyxVQUFVLGlCQUFpQixLQUFLLENBQUM7QUFDL0QsY0FBSSx1QkFBTyxHQUFHLEtBQUsscUJBQXFCO0FBQUEsUUFDMUMsUUFBUTtBQUVOLGdCQUFNLGFBQWEsQ0FBQyx3QkFBd0IseUJBQXlCO0FBQ3JFLGNBQUksYUFBYTtBQUNqQixxQkFBVyxLQUFLLFlBQVk7QUFDMUIsZ0JBQU8sY0FBVyxDQUFDLEdBQUc7QUFDcEIsa0JBQUk7QUFDRixzQkFBTSxjQUFjLEdBQUcsQ0FBQyxVQUFVLGlCQUFpQixLQUFLLENBQUM7QUFDekQsb0JBQUksdUJBQU8sR0FBRyxLQUFLLHFCQUFxQjtBQUN4Qyw2QkFBYTtBQUNiO0FBQUEsY0FDRixRQUFRO0FBQUEsY0FBaUI7QUFBQSxZQUMzQjtBQUFBLFVBQ0Y7QUFDQSxjQUFJLENBQUMsWUFBWTtBQUNmLGdCQUFJLHVCQUFPLEdBQUcsS0FBSyw4REFBeUQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUs7QUFBQSxVQUN4RztBQUFBLFFBQ0Y7QUFDQTtBQUFBLE1BQ0Y7QUFFQSxVQUFJLHVCQUFPLEdBQUcsS0FBSyxnQkFBZ0I7QUFBQSxJQUNyQyxTQUFTLEdBQVk7QUFDbkIsWUFBTSxNQUFNO0FBQ1osVUFBSSx1QkFBTyxHQUFHLEtBQUssa0JBQWEsSUFBSSxPQUFPLEVBQUU7QUFBQSxJQUMvQztBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQWMsc0JBQXNCLFNBQXVDO0FBQ3pFLFFBQUksQ0FBQyxRQUFRLEtBQUs7QUFDaEIsVUFBSSx1QkFBTyxHQUFHLFFBQVEsSUFBSSxxQkFBcUI7QUFDL0M7QUFBQSxJQUNGO0FBQ0EsUUFBSTtBQUNGLFlBQU0sV0FBVyxNQUFNLE1BQU0sUUFBUSxHQUFHO0FBQ3hDLFVBQUksdUJBQU8sR0FBRyxRQUFRLElBQUksS0FBSyxTQUFTLEtBQUssT0FBTyxTQUFTLE1BQU0sRUFBRTtBQUFBLElBQ3ZFLFNBQVMsR0FBWTtBQUNuQixZQUFNLE1BQU07QUFDWixVQUFJLHVCQUFPLEdBQUcsUUFBUSxJQUFJLG1CQUFtQixJQUFJLE9BQU8sRUFBRTtBQUFBLElBQzVEO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBYyxpQkFBZ0M7QUFDNUMsVUFBTSxVQUFVLEtBQUssT0FBTyxTQUFTO0FBQ3JDLFFBQUksQ0FBQyxTQUFTO0FBQ1osVUFBSSx1QkFBTyx1QkFBdUI7QUFDbEM7QUFBQSxJQUNGO0FBRUEsVUFBTSxhQUFrQixVQUFLLFNBQVMsU0FBUztBQUMvQyxRQUFJLENBQUksY0FBVyxVQUFVLEdBQUc7QUFDOUIsTUFBRyxhQUFVLFlBQVksRUFBRSxXQUFXLEtBQUssQ0FBQztBQUFBLElBQzlDO0FBRUEsVUFBTSxVQUFlLFVBQUssWUFBWSxNQUFNO0FBQzVDLFVBQU0sUUFBa0I7QUFBQSxNQUN0QjtBQUFBLE1BQ0Esc0NBQXFDLG9CQUFJLEtBQUssR0FBRSxZQUFZLENBQUM7QUFBQSxNQUM3RDtBQUFBLElBQ0Y7QUFFQSxlQUFXLE9BQU8sY0FBYztBQUM5QixZQUFNLFFBQVEsS0FBSyxPQUFPLFNBQVMsUUFBUSxJQUFJLEdBQUcsS0FBSztBQUN2RCxVQUFJLE9BQU87QUFDVCxjQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUU7QUFBQSxNQUNsQztBQUFBLElBQ0Y7QUFFQSxJQUFHLGlCQUFjLFNBQVMsTUFBTSxLQUFLLElBQUksSUFBSSxNQUFNLE9BQU87QUFDMUQsUUFBSSx1QkFBTyxTQUFTLE1BQU0sU0FBUyxDQUFDLFlBQVksT0FBTyxFQUFFO0FBQUEsRUFDM0Q7QUFBQSxFQUVBLE1BQWMsaUJBQWdDO0FBQzVDLFVBQU0sVUFBVSxLQUFLLE9BQU8sU0FBUztBQUNyQyxRQUFJLENBQUMsU0FBUztBQUNaLFVBQUksdUJBQU8sdUJBQXVCO0FBQ2xDO0FBQUEsSUFDRjtBQUVBLFVBQU0sVUFBZSxVQUFLLFNBQVMsV0FBVyxNQUFNO0FBQ3BELFFBQUksQ0FBSSxjQUFXLE9BQU8sR0FBRztBQUMzQixVQUFJLHVCQUFPLHdCQUF3QjtBQUNuQztBQUFBLElBQ0Y7QUFFQSxVQUFNLFVBQWEsZ0JBQWEsU0FBUyxPQUFPO0FBQ2hELFFBQUksU0FBUztBQUViLGVBQVcsUUFBUSxRQUFRLE1BQU0sSUFBSSxHQUFHO0FBQ3RDLFlBQU0sVUFBVSxLQUFLLEtBQUs7QUFDMUIsVUFBSSxDQUFDLFdBQVcsUUFBUSxXQUFXLEdBQUc7QUFBRztBQUN6QyxZQUFNLFFBQVEsUUFBUSxRQUFRLEdBQUc7QUFDakMsVUFBSSxVQUFVO0FBQUk7QUFDbEIsWUFBTSxNQUFNLFFBQVEsVUFBVSxHQUFHLEtBQUssRUFBRSxLQUFLO0FBQzdDLFlBQU0sUUFBUSxRQUFRLFVBQVUsUUFBUSxDQUFDLEVBQUUsS0FBSztBQUNoRCxVQUFJLGFBQWEsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLEdBQUcsR0FBRztBQUMzQyxhQUFLLE9BQU8sU0FBUyxRQUFRLEdBQUcsSUFBSTtBQUNwQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsVUFBTSxLQUFLLE9BQU8sYUFBYTtBQUMvQixRQUFJLHVCQUFPLFVBQVUsTUFBTSx5QkFBeUI7QUFBQSxFQUN0RDtBQUFBLEVBRUEsTUFBYywwQkFBeUM7QUFDckQsVUFBTSxVQUFVLEtBQUssT0FBTyxTQUFTO0FBQ3JDLFFBQUksQ0FBQyxTQUFTO0FBQ1osVUFBSSx1QkFBTyx1QkFBdUI7QUFDbEM7QUFBQSxJQUNGO0FBRUEsVUFBTSxhQUFrQixVQUFLLFNBQVMsVUFBVSwwQkFBMEI7QUFDMUUsUUFBSSxDQUFJLGNBQVcsVUFBVSxHQUFHO0FBQzlCLFVBQUksdUJBQU8sb0NBQW9DO0FBQy9DO0FBQUEsSUFDRjtBQUVBLFVBQU0sVUFBYSxnQkFBYSxZQUFZLE9BQU87QUFDbkQsVUFBTSxVQUFVLFFBQVEsTUFBTSx1QkFBdUI7QUFDckQsUUFBSSxDQUFDLFNBQVM7QUFDWixVQUFJLHVCQUFPLHdDQUF3QztBQUNuRDtBQUFBLElBQ0Y7QUFFQSxVQUFNLEtBQUssUUFBUSxDQUFDO0FBQ3BCLFVBQU0sWUFBNkIsQ0FBQztBQUNwQyxVQUFNLGVBQWUsR0FBRyxNQUFNLDRDQUE0QztBQUUxRSxRQUFJLGNBQWM7QUFDaEIsWUFBTSxVQUFVLGFBQWEsQ0FBQyxFQUFFO0FBQUEsUUFDOUI7QUFBQSxNQUNGO0FBQ0EsaUJBQVcsU0FBUyxTQUFTO0FBQzNCLGNBQU0sT0FBTyxNQUFNLENBQUM7QUFDcEIsY0FBTSxRQUFRLE1BQU0sQ0FBQztBQUNyQixjQUFNLFNBQVMsQ0FBQyxRQUF3QjtBQUN0QyxnQkFBTSxJQUFJLE1BQU0sTUFBTSxJQUFJLE9BQU8sR0FBRyxHQUFHLFdBQVcsQ0FBQztBQUNuRCxpQkFBTyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssSUFBSTtBQUFBLFFBQzNCO0FBQ0EsY0FBTSxZQUFZLE1BQU0sTUFBTSxvQ0FBb0M7QUFDbEUsY0FBTSxlQUFlLFlBQ2pCLFVBQVUsQ0FBQyxFQUNSLE1BQU0sSUFBSSxFQUNWLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxZQUFZLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFDM0MsT0FBTyxPQUFPLElBQ2pCLENBQUM7QUFFTCxrQkFBVSxLQUFLO0FBQUEsVUFDYjtBQUFBLFVBQ0EsTUFBTSxPQUFPLE1BQU07QUFBQSxVQUNuQixRQUFRLE9BQU8sUUFBUTtBQUFBLFVBQ3ZCLEtBQUssT0FBTyxLQUFLLEtBQUs7QUFBQSxVQUN0QixXQUFXLE9BQU8sYUFBYTtBQUFBLFVBQy9CLE1BQU0sT0FBTyxNQUFNO0FBQUEsVUFDbkI7QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUVBLFNBQUssT0FBTyxTQUFTLFlBQVk7QUFDakMsVUFBTSxLQUFLLE9BQU8sYUFBYTtBQUMvQixRQUFJLHVCQUFPLFVBQVUsVUFBVSxNQUFNLHdCQUF3QjtBQUFBLEVBQy9EO0FBQ0Y7OztBQ3IxQkEsSUFBQUMsbUJBQTJEOzs7QUNBM0QsSUFBQUMsbUJBQStEO0FBRy9ELElBQUFDLE1BQW9CO0FBQ3BCLElBQUFDLFFBQXNCO0FBRWYsSUFBTSxvQkFBTixjQUFnQyx1QkFBTTtBQUFBLEVBSzNDLFlBQVksS0FBVSxRQUFtQixTQUF5QjtBQUNoRSxVQUFNLEdBQUc7QUFDVCxTQUFLLFNBQVM7QUFDZCxTQUFLLFFBQVEsQ0FBQztBQUNkLFNBQUssVUFBVSxVQUNYLEVBQUUsR0FBRyxRQUFRLElBQ2I7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFFBQVE7QUFBQSxNQUNSLEtBQUs7QUFBQSxNQUNMLFdBQVc7QUFBQSxNQUNYLE1BQU07QUFBQSxNQUNOLGNBQWMsQ0FBQztBQUFBLElBQ2pCO0FBQUEsRUFDTjtBQUFBLEVBRUEsU0FBZTtBQUNiLFVBQU0sRUFBRSxVQUFVLElBQUk7QUFDdEIsY0FBVSxTQUFTLE1BQU0sRUFBRSxNQUFNLEtBQUssUUFBUSxnQkFBZ0IsU0FBUyxLQUFLLFFBQVEsSUFBSSxHQUFHLENBQUM7QUFFNUYsUUFBSSx5QkFBUSxTQUFTLEVBQ2xCLFFBQVEsTUFBTSxFQUNkLFFBQVEsb0NBQW9DLEVBQzVDO0FBQUEsTUFBUSxDQUFDLFNBQ1IsS0FDRyxlQUFlLFlBQVksRUFDM0IsU0FBUyxLQUFLLFFBQVEsSUFBSSxFQUMxQixTQUFTLENBQUMsTUFBTTtBQUFFLGFBQUssUUFBUSxPQUFPO0FBQUEsTUFBRyxDQUFDO0FBQUEsSUFDL0M7QUFFRixRQUFJLHlCQUFRLFNBQVMsRUFDbEIsUUFBUSxNQUFNLEVBQ2Q7QUFBQSxNQUFZLENBQUMsU0FDWixLQUNHLFVBQVUsU0FBUyxXQUFXLEVBQzlCLFVBQVUsT0FBTyxZQUFZLEVBQzdCLFVBQVUsT0FBTyxZQUFZLEVBQzdCLFNBQVMsS0FBSyxRQUFRLElBQUksRUFDMUIsU0FBUyxDQUFDLE1BQU07QUFBRSxhQUFLLFFBQVEsT0FBTztBQUFBLE1BQUcsQ0FBQztBQUFBLElBQy9DO0FBRUYsUUFBSSx5QkFBUSxTQUFTLEVBQ2xCLFFBQVEsUUFBUSxFQUNoQjtBQUFBLE1BQVksQ0FBQyxTQUNaLEtBQ0csVUFBVSxVQUFVLFFBQVEsRUFDNUIsVUFBVSxZQUFZLFVBQVUsRUFDaEMsVUFBVSxTQUFTLE9BQU8sRUFDMUIsU0FBUyxLQUFLLFFBQVEsTUFBTSxFQUM1QixTQUFTLENBQUMsTUFBTTtBQUFFLGFBQUssUUFBUSxTQUFTO0FBQUEsTUFBRyxDQUFDO0FBQUEsSUFDakQ7QUFFRixRQUFJLHlCQUFRLFNBQVMsRUFDbEIsUUFBUSxLQUFLLEVBQ2IsUUFBUSw0REFBNEQsRUFDcEU7QUFBQSxNQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsdUJBQXVCLEVBQ3RDLFNBQVMsS0FBSyxRQUFRLEdBQUcsRUFDekIsU0FBUyxDQUFDLE1BQU07QUFBRSxhQUFLLFFBQVEsTUFBTTtBQUFBLE1BQUcsQ0FBQztBQUFBLElBQzlDO0FBRUYsUUFBSSx5QkFBUSxTQUFTLEVBQ2xCLFFBQVEsc0JBQXNCLEVBQzlCLFFBQVEsMkNBQTJDLEVBQ25EO0FBQUEsTUFBUSxDQUFDLFNBQ1IsS0FDRyxlQUFlLG9CQUFvQixFQUNuQyxTQUFTLEtBQUssUUFBUSxTQUFTLEVBQy9CLFNBQVMsQ0FBQyxNQUFNO0FBQUUsYUFBSyxRQUFRLFlBQVk7QUFBQSxNQUFHLENBQUM7QUFBQSxJQUNwRDtBQUVGLFFBQUkseUJBQVEsU0FBUyxFQUNsQixRQUFRLE1BQU0sRUFDZDtBQUFBLE1BQVksQ0FBQyxTQUNaLEtBQ0csVUFBVSxXQUFXLFNBQVMsRUFDOUIsVUFBVSxZQUFZLFVBQVUsRUFDaEMsVUFBVSxrQkFBa0IsZ0JBQWdCLEVBQzVDLFVBQVUsVUFBVSxRQUFRLEVBQzVCLFVBQVUsY0FBYyxZQUFZLEVBQ3BDLFNBQVMsS0FBSyxRQUFRLFFBQVEsVUFBVSxFQUN4QyxTQUFTLENBQUMsTUFBTTtBQUFFLGFBQUssUUFBUSxPQUFPO0FBQUEsTUFBRyxDQUFDO0FBQUEsSUFDL0M7QUFFRixRQUFJLHlCQUFRLFNBQVMsRUFDbEIsUUFBUSxjQUFjLEVBQ3RCLFFBQVEsc0NBQXNDLEVBQzlDO0FBQUEsTUFBUSxDQUFDLFNBQ1IsS0FDRyxlQUFlLGtDQUFrQyxFQUNqRCxTQUFTLEtBQUssUUFBUSxhQUFhLEtBQUssSUFBSSxDQUFDLEVBQzdDLFNBQVMsQ0FBQyxNQUFNO0FBQ2YsYUFBSyxRQUFRLGVBQWUsRUFDekIsTUFBTSxHQUFHLEVBQ1QsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFDbkIsT0FBTyxPQUFPO0FBQUEsTUFDbkIsQ0FBQztBQUFBLElBQ0w7QUFFRixVQUFNLFNBQVMsVUFBVSxVQUFVLEVBQUUsS0FBSyxvQkFBb0IsQ0FBQztBQUUvRCxRQUFJLEtBQUssUUFBUSxLQUFLO0FBQ3BCLFVBQUkseUJBQVEsTUFBTSxFQUFFO0FBQUEsUUFBVSxDQUFDLFFBQzdCLElBQ0csY0FBYyxpQkFBaUIsRUFDL0IsT0FBTyxFQUNQLFFBQVEsWUFBWTtBQUNuQixnQkFBTSxLQUFLLGVBQWU7QUFBQSxRQUM1QixDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0Y7QUFFQSxRQUFJLHlCQUFRLE1BQU0sRUFBRTtBQUFBLE1BQVUsQ0FBQyxRQUM3QixJQUNHLGNBQWMsTUFBTSxFQUNwQixPQUFPLEVBQ1AsUUFBUSxZQUFZO0FBQ25CLGNBQU0sS0FBSyxLQUFLO0FBQUEsTUFDbEIsQ0FBQztBQUFBLElBQ0w7QUFFQSxRQUFJLHlCQUFRLE1BQU0sRUFBRTtBQUFBLE1BQVUsQ0FBQyxRQUM3QixJQUNHLGNBQWMsZ0JBQWdCLEVBQzlCLFdBQVcsRUFDWCxRQUFRLFlBQVk7QUFDbkIsY0FBTSxLQUFLLEtBQUs7QUFDaEIsY0FBTSxLQUFLLGNBQWM7QUFBQSxNQUMzQixDQUFDO0FBQUEsSUFDTDtBQUVBLFNBQUssbUJBQW1CLFNBQVM7QUFBQSxFQUNuQztBQUFBLEVBRVEsbUJBQW1CLFdBQThCO0FBQ3ZELGNBQVUsU0FBUyxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVsRCxVQUFNLFVBQVUsS0FBSyxPQUFPLFNBQVM7QUFDckMsUUFBSSxDQUFDLFNBQVM7QUFDWixnQkFBVSxTQUFTLEtBQUssRUFBRSxNQUFNLHNDQUFzQyxLQUFLLGtCQUFrQixDQUFDO0FBQzlGO0FBQUEsSUFDRjtBQUVBLFVBQU0sYUFBa0IsV0FBSyxTQUFTLFVBQVUsMEJBQTBCO0FBQzFFLFFBQUksQ0FBSSxlQUFXLFVBQVUsR0FBRztBQUM5QixnQkFBVSxTQUFTLEtBQUssRUFBRSxNQUFNLHNDQUFzQyxLQUFLLGtCQUFrQixDQUFDO0FBQzlGO0FBQUEsSUFDRjtBQUVBLFVBQU0sVUFBYSxpQkFBYSxZQUFZLE9BQU87QUFDbkQsVUFBTSxVQUFVLFFBQVEsTUFBTSx1QkFBdUI7QUFDckQsUUFBSSxDQUFDO0FBQVM7QUFFZCxVQUFNLGFBQWEsUUFBUSxDQUFDLEVBQUUsTUFBTSw2QkFBNkI7QUFDakUsUUFBSSxDQUFDO0FBQVk7QUFFakIsVUFBTSxRQUFzRCxDQUFDO0FBQzdELFVBQU0sY0FBYyxXQUFXLENBQUMsRUFBRSxTQUFTLCtDQUErQztBQUMxRixlQUFXLEtBQUssYUFBYTtBQUMzQixZQUFNLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxHQUFHLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUFBLElBQzlDO0FBRUEsUUFBSSxNQUFNLFdBQVcsR0FBRztBQUN0QixnQkFBVSxTQUFTLEtBQUssRUFBRSxNQUFNLDRCQUE0QixLQUFLLGtCQUFrQixDQUFDO0FBQ3BGO0FBQUEsSUFDRjtBQUVBLFVBQU0sUUFBUSxVQUFVLFNBQVMsU0FBUyxFQUFFLEtBQUssa0JBQWtCLENBQUM7QUFDcEUsVUFBTSxRQUFRLE1BQU0sU0FBUyxPQUFPO0FBQ3BDLFVBQU0sWUFBWSxNQUFNLFNBQVMsSUFBSTtBQUNyQyxjQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQzVDLGNBQVUsU0FBUyxNQUFNLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFN0MsVUFBTSxRQUFRLE1BQU0sU0FBUyxPQUFPO0FBQ3BDLGVBQVcsUUFBUSxPQUFPO0FBQ3hCLFlBQU0sTUFBTSxNQUFNLFNBQVMsSUFBSTtBQUMvQixVQUFJLFNBQVMsTUFBTSxFQUFFLE1BQU0sS0FBSyxRQUFRLENBQUM7QUFDekMsWUFBTSxZQUFZLElBQUksU0FBUyxNQUFNLEVBQUUsTUFBTSxLQUFLLFNBQVMsQ0FBQztBQUM1RCxVQUFJLEtBQUssYUFBYSxLQUFLLFFBQVEsTUFBTTtBQUN2QyxrQkFBVSxTQUFTLHFCQUFxQjtBQUFBLE1BQzFDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQWMsaUJBQWdDO0FBQzVDLFFBQUksQ0FBQyxLQUFLLFFBQVEsS0FBSztBQUNyQixVQUFJLHdCQUFPLG1CQUFtQjtBQUM5QjtBQUFBLElBQ0Y7QUFDQSxRQUFJO0FBQ0YsWUFBTSxXQUFXLE1BQU0sTUFBTSxLQUFLLFFBQVEsR0FBRztBQUM3QyxVQUFJLHdCQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksS0FBSyxTQUFTLEtBQUssY0FBYyxRQUFRLFNBQVMsTUFBTSxFQUFFLEVBQUU7QUFBQSxJQUM3RixTQUFTLEdBQVk7QUFDbkIsWUFBTSxNQUFNO0FBQ1osVUFBSSx3QkFBTyxHQUFHLEtBQUssUUFBUSxJQUFJLG1CQUFtQixJQUFJLE9BQU8sRUFBRTtBQUFBLElBQ2pFO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBYyxPQUFzQjtBQUNsQyxRQUFJLENBQUMsS0FBSyxRQUFRLE1BQU07QUFDdEIsVUFBSSx3QkFBTywwQkFBMEI7QUFDckM7QUFBQSxJQUNGO0FBRUEsVUFBTSxZQUFZLEtBQUssT0FBTyxTQUFTO0FBQ3ZDLFVBQU0sY0FBYyxVQUFVLFVBQVUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxLQUFLLFFBQVEsSUFBSTtBQUMzRSxRQUFJLGVBQWUsR0FBRztBQUNwQixnQkFBVSxXQUFXLElBQUksRUFBRSxHQUFHLEtBQUssUUFBUTtBQUFBLElBQzdDLE9BQU87QUFDTCxnQkFBVSxLQUFLLEVBQUUsR0FBRyxLQUFLLFFBQVEsQ0FBQztBQUFBLElBQ3BDO0FBRUEsVUFBTSxLQUFLLE9BQU8sYUFBYTtBQUMvQixRQUFJLHdCQUFPLFlBQVksS0FBSyxRQUFRLElBQUksU0FBUztBQUNqRCxTQUFLLE1BQU07QUFBQSxFQUNiO0FBQUEsRUFFQSxNQUFjLGdCQUErQjtBQUMzQyxVQUFNLFVBQVUsS0FBSyxPQUFPLFNBQVM7QUFDckMsUUFBSSxDQUFDLFNBQVM7QUFDWixVQUFJLHdCQUFPLGtCQUFrQjtBQUM3QjtBQUFBLElBQ0Y7QUFFQSxVQUFNLGFBQWtCLFdBQUssU0FBUyxVQUFVLDBCQUEwQjtBQUMxRSxRQUFJLENBQUksZUFBVyxVQUFVLEdBQUc7QUFDOUIsVUFBSSx3QkFBTyxvQ0FBb0M7QUFDL0M7QUFBQSxJQUNGO0FBRUEsVUFBTSxVQUFhLGlCQUFhLFlBQVksT0FBTztBQUNuRCxVQUFNLFVBQVUsUUFBUSxNQUFNLHVCQUF1QjtBQUNyRCxRQUFJLENBQUMsU0FBUztBQUNaLFVBQUksd0JBQU8sZ0NBQWdDO0FBQzNDO0FBQUEsSUFDRjtBQUVBLFVBQU0sSUFBSSxLQUFLO0FBQ2YsVUFBTSxZQUFZO0FBQUEsTUFDaEIsS0FBSyxFQUFFLElBQUk7QUFBQSxNQUNYLGFBQWEsRUFBRSxJQUFJO0FBQUEsTUFDbkIsZUFBZSxFQUFFLE1BQU07QUFBQSxNQUN2QixhQUFhLEVBQUUsSUFBSTtBQUFBLElBQ3JCO0FBQ0EsUUFBSSxFQUFFO0FBQUssZ0JBQVUsS0FBSyxZQUFZLEVBQUUsR0FBRyxFQUFFO0FBQzdDLFFBQUksRUFBRTtBQUFXLGdCQUFVLEtBQUssb0JBQW9CLEVBQUUsU0FBUyxFQUFFO0FBQ2pFLFFBQUksRUFBRSxhQUFhLFNBQVMsR0FBRztBQUM3QixnQkFBVSxLQUFLLG1CQUFtQjtBQUNsQyxpQkFBVyxPQUFPLEVBQUUsY0FBYztBQUNoQyxrQkFBVSxLQUFLLFdBQVcsR0FBRyxFQUFFO0FBQUEsTUFDakM7QUFBQSxJQUNGO0FBQ0EsVUFBTSxXQUFXLFVBQVUsS0FBSyxJQUFJO0FBRXBDLFFBQUksS0FBSyxRQUFRLENBQUM7QUFDbEIsVUFBTSxrQkFBa0IsSUFBSSxPQUFPLEtBQUssRUFBRSxJQUFJLHNCQUFzQixHQUFHO0FBQ3ZFLFFBQUksZ0JBQWdCLEtBQUssRUFBRSxHQUFHO0FBQzVCLFdBQUssR0FBRyxRQUFRLGlCQUFpQixXQUFXLElBQUk7QUFBQSxJQUNsRCxPQUFPO0FBQ0wsWUFBTSxhQUFhLEdBQUcsUUFBUSxnQkFBZ0I7QUFDOUMsVUFBSSxjQUFjLEdBQUc7QUFDbkIsYUFBSyxHQUFHLFVBQVUsR0FBRyxVQUFVLElBQUksV0FBVyxPQUFPLEdBQUcsVUFBVSxVQUFVO0FBQUEsTUFDOUUsT0FBTztBQUNMLGNBQU0sT0FBTztBQUFBLE1BQ2Y7QUFBQSxJQUNGO0FBRUEsVUFBTSxPQUFPLFFBQVEsVUFBVSxRQUFRLENBQUMsRUFBRSxNQUFNO0FBQ2hELElBQUcsa0JBQWMsWUFBWTtBQUFBLEVBQVEsRUFBRTtBQUFBLEtBQVEsSUFBSSxJQUFJLE9BQU87QUFDOUQsUUFBSSx3QkFBTyxXQUFXLEVBQUUsSUFBSSxvQkFBb0I7QUFBQSxFQUNsRDtBQUFBLEVBRUEsVUFBZ0I7QUFDZCxTQUFLLFVBQVUsTUFBTTtBQUFBLEVBQ3ZCO0FBQ0Y7OztBQ2hTQSxJQUFBQyxtQkFBNEM7QUFFNUMsSUFBQUMsTUFBb0I7QUFDcEIsSUFBQUMsUUFBc0I7QUFFZixJQUFNLGdCQUFOLGNBQTRCLHVCQUFNO0FBQUEsRUFHdkMsWUFBWSxLQUFVLFFBQW1CO0FBQ3ZDLFVBQU0sR0FBRztBQUNULFNBQUssU0FBUztBQUFBLEVBQ2hCO0FBQUEsRUFFQSxTQUFlO0FBQ2IsVUFBTSxFQUFFLFVBQVUsSUFBSTtBQUN0QixjQUFVLFNBQVMscUJBQXFCO0FBQ3hDLGNBQVUsU0FBUyxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUVyRCxTQUFLLFlBQVksU0FBUztBQUMxQixTQUFLLFlBQVksU0FBUztBQUMxQixTQUFLLFlBQVksU0FBUztBQUMxQixTQUFLLFlBQVksU0FBUztBQUMxQixTQUFLLFlBQVksU0FBUztBQUFBLEVBQzVCO0FBQUEsRUFFUSxZQUFZLFdBQThCO0FBQ2hELFVBQU0sVUFBVSxVQUFVLFVBQVUsRUFBRSxLQUFLLGlCQUFpQixDQUFDO0FBQzdELFlBQVEsU0FBUyxNQUFNLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUU3RCxVQUFNLFNBQVMsS0FBSyxPQUFPLFNBQVMsaUJBQWlCO0FBQ3JELFVBQU0sV0FBVyxRQUFRLFVBQVUsRUFBRSxLQUFLLG1CQUFtQixDQUFDO0FBRTlELFFBQUkseUJBQVEsT0FBTyxFQUNoQixRQUFRLG9CQUFvQixFQUM1QixRQUFRLHdCQUF3QixNQUFNLEVBQUUsRUFDeEM7QUFBQSxNQUFVLENBQUMsUUFDVixJQUNHLGNBQWMsUUFBUSxFQUN0QixPQUFPLEVBQ1AsUUFBUSxZQUFZO0FBQ25CLFlBQUk7QUFDRixnQkFBTSxLQUFLLE9BQU8sY0FBYyxDQUFDLFdBQVcsQ0FBQztBQUM3QyxtQkFBUyxNQUFNO0FBQ2YsbUJBQVMsU0FBUyxRQUFRLEVBQUUsTUFBTSxrQ0FBa0MsS0FBSyxvQkFBb0IsQ0FBQztBQUFBLFFBQ2hHLFFBQVE7QUFDTixtQkFBUyxNQUFNO0FBQ2YsbUJBQVMsU0FBUyxRQUFRLEVBQUUsTUFBTSxzQ0FBc0MsS0FBSyxvQkFBb0IsQ0FBQztBQUFBLFFBQ3BHO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDTDtBQUVGLFVBQU0sc0JBQXNCLFFBQVEsVUFBVSxFQUFFLEtBQUsseUJBQXlCLENBQUM7QUFDL0Usd0JBQW9CLFNBQVMsS0FBSyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDaEUsVUFBTSxZQUFZLG9CQUFvQixTQUFTLE9BQU8sRUFBRSxLQUFLLGlCQUFpQixDQUFDO0FBQy9FLGNBQVUsU0FBUyxRQUFRO0FBQUEsTUFDekIsTUFBTTtBQUFBLElBQ1IsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUVRLFlBQVksV0FBOEI7QUFDaEQsVUFBTSxVQUFVLFVBQVUsVUFBVSxFQUFFLEtBQUssaUJBQWlCLENBQUM7QUFDN0QsWUFBUSxTQUFTLE1BQU0sRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBRTNFLFVBQU0sVUFBVSxLQUFLLE9BQU8sU0FBUyxXQUFXO0FBQ2hELFVBQU0sU0FBUyxLQUFLLE9BQU8sU0FBUyxpQkFBaUI7QUFFckQsVUFBTSxZQUFZLEtBQUs7QUFBQSxNQUNyQjtBQUFBLFFBQ0UsWUFBWTtBQUFBLFVBQ1Ysd0JBQXdCO0FBQUEsWUFDdEIsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFlBQ1QsTUFBTSxDQUFDLEtBQUs7QUFBQSxZQUNaLEtBQUssRUFBRSxVQUFVLFFBQVE7QUFBQSxVQUMzQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBRUEsWUFBUSxTQUFTLEtBQUssRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELFVBQU0sWUFBWSxRQUFRLFNBQVMsT0FBTyxFQUFFLEtBQUssaUJBQWlCLENBQUM7QUFDbkUsY0FBVSxTQUFTLFFBQVEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU5QyxRQUFJLHlCQUFRLE9BQU8sRUFBRTtBQUFBLE1BQVUsQ0FBQyxRQUM5QixJQUNHLGNBQWMsbUJBQW1CLEVBQ2pDLE9BQU8sRUFDUCxRQUFRLFlBQVk7QUFDbkIsY0FBTSxVQUFVLFVBQVUsVUFBVSxTQUFTO0FBQzdDLFlBQUksd0JBQU8sZ0NBQWdDO0FBQUEsTUFDN0MsQ0FBQztBQUFBLElBQ0w7QUFFQSxRQUFJLHlCQUFRLE9BQU8sRUFBRTtBQUFBLE1BQVUsQ0FBQyxRQUM5QixJQUNHLGNBQWMsNEJBQTRCLEVBQzFDLFdBQVcsRUFDWCxRQUFRLFlBQVk7QUFDbkIsY0FBTSxLQUFLLGdCQUFnQixRQUFRLE9BQU87QUFBQSxNQUM1QyxDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0Y7QUFBQSxFQUVRLFlBQVksV0FBOEI7QUFDaEQsVUFBTSxVQUFVLFVBQVUsVUFBVSxFQUFFLEtBQUssaUJBQWlCLENBQUM7QUFDN0QsWUFBUSxTQUFTLE1BQU0sRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRTdELFlBQVEsU0FBUyxLQUFLO0FBQUEsTUFDcEIsTUFBTTtBQUFBLElBQ1IsQ0FBQztBQUVELFVBQU0sY0FBYyxLQUFLLE9BQU8sU0FBUyxzQkFDL0IsV0FBSyxLQUFLLE9BQU8sU0FBUyxXQUFXLElBQUksc0JBQXNCO0FBRXpFLFFBQUkseUJBQVEsT0FBTyxFQUNoQixRQUFRLGNBQWMsRUFDdEI7QUFBQSxNQUFRLENBQUMsU0FDUixLQUFLLFNBQVMsV0FBVyxFQUFFLFlBQVksSUFBSTtBQUFBLElBQzdDO0FBRUYsVUFBTSxXQUFXLFFBQVEsVUFBVSxFQUFFLEtBQUssbUJBQW1CLENBQUM7QUFFOUQsUUFBSSx5QkFBUSxPQUFPLEVBQUU7QUFBQSxNQUFVLENBQUMsUUFDOUIsSUFDRyxjQUFjLGtCQUFrQixFQUNoQyxPQUFPLEVBQ1AsUUFBUSxZQUFZO0FBQ25CLGNBQU0sS0FBSyx1QkFBdUIsV0FBVztBQUM3QyxpQkFBUyxNQUFNO0FBQ2YsaUJBQVMsU0FBUyxRQUFRLEVBQUUsTUFBTSw0QkFBNEIsS0FBSyxvQkFBb0IsQ0FBQztBQUFBLE1BQzFGLENBQUM7QUFBQSxJQUNMO0FBRUEsUUFBSSx5QkFBUSxPQUFPLEVBQUU7QUFBQSxNQUFVLENBQUMsUUFDOUIsSUFDRyxjQUFjLHNCQUFzQixFQUNwQyxRQUFRLFlBQVk7QUFDbkIsWUFBTyxlQUFXLFdBQVcsR0FBRztBQUM5QixnQkFBTSxVQUFhLGlCQUFhLGFBQWEsT0FBTztBQUNwRCxnQkFBTSxNQUFNLFFBQVEsU0FBUyxPQUFPLEVBQUUsS0FBSyxpQkFBaUIsQ0FBQztBQUM3RCxjQUFJLFNBQVMsUUFBUSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQUEsUUFDeEMsT0FBTztBQUNMLGNBQUksd0JBQU8sMEJBQTBCLFdBQVc7QUFBQSxRQUNsRDtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNGO0FBQUEsRUFFUSxZQUFZLFdBQThCO0FBQ2hELFVBQU0sVUFBVSxVQUFVLFVBQVUsRUFBRSxLQUFLLGlCQUFpQixDQUFDO0FBQzdELFlBQVEsU0FBUyxNQUFNLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUV2RSxZQUFRLFNBQVMsS0FBSztBQUFBLE1BQ3BCLE1BQU07QUFBQSxJQUNSLENBQUM7QUFFRCxVQUFNLE9BQU8sS0FBSyxPQUFPLFNBQVMsaUJBQWlCO0FBR25ELFFBQUksUUFBUTtBQUNaLFVBQU0sVUFBVSxLQUFLLE9BQU8sU0FBUztBQUNyQyxRQUFJLFNBQVM7QUFDWCxZQUFNLFVBQWUsV0FBSyxTQUFTLFdBQVcsTUFBTTtBQUNwRCxVQUFPLGVBQVcsT0FBTyxHQUFHO0FBQzFCLGNBQU0sVUFBYSxpQkFBYSxTQUFTLE9BQU87QUFDaEQsY0FBTSxRQUFRLFFBQVEsTUFBTSxvQkFBb0I7QUFDaEQsWUFBSTtBQUFPLGtCQUFRLE1BQU0sQ0FBQyxFQUFFLEtBQUs7QUFBQSxNQUNuQztBQUFBLElBQ0Y7QUFFQSxZQUFRLFNBQVMsS0FBSyxFQUFFLE1BQU0sNEJBQTRCLElBQUksR0FBRyxDQUFDO0FBQ2xFLFlBQVEsU0FBUyxLQUFLLEVBQUUsTUFBTSxVQUFVLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFFcEUsVUFBTSxrQkFBa0IsS0FBSyxVQUFVO0FBQUEsTUFDckMsWUFBWTtBQUFBLFFBQ1Ysd0JBQXdCO0FBQUEsVUFDdEIsTUFBTTtBQUFBLFVBQ04sS0FBSyxvQkFBb0IsSUFBSTtBQUFBLFVBQzdCLFNBQVM7QUFBQSxZQUNQLGVBQWUsVUFBVSxLQUFLO0FBQUEsVUFDaEM7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsR0FBRyxNQUFNLENBQUM7QUFFVixZQUFRLFNBQVMsS0FBSyxFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDN0UsVUFBTSxZQUFZLFFBQVEsU0FBUyxPQUFPLEVBQUUsS0FBSyxpQkFBaUIsQ0FBQztBQUNuRSxjQUFVLFNBQVMsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFcEQsUUFBSSx5QkFBUSxPQUFPLEVBQUU7QUFBQSxNQUFVLENBQUMsUUFDOUIsSUFDRyxjQUFjLGlCQUFpQixFQUMvQixPQUFPLEVBQ1AsUUFBUSxZQUFZO0FBQ25CLGNBQU0sVUFBVSxVQUFVLFVBQVUsZUFBZTtBQUNuRCxZQUFJLHdCQUFPLHVDQUF1QztBQUFBLE1BQ3BELENBQUM7QUFBQSxJQUNMO0FBRUEsUUFBSSx5QkFBUSxPQUFPLEVBQ2hCLFFBQVEsTUFBTSxFQUNkO0FBQUEsTUFBUSxDQUFDLFNBQ1IsS0FDRyxTQUFTLE9BQU8sSUFBSSxDQUFDLEVBQ3JCLFNBQVMsT0FBTyxNQUFNO0FBQ3JCLGNBQU0sSUFBSSxTQUFTLEdBQUcsRUFBRTtBQUN4QixZQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxLQUFLLElBQUksT0FBTztBQUNuQyxlQUFLLE9BQU8sU0FBUyxnQkFBZ0I7QUFDckMsZ0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxRQUNqQztBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBQUEsRUFFUSxZQUFZLFdBQThCO0FBQ2hELFVBQU0sVUFBVSxVQUFVLFVBQVUsRUFBRSxLQUFLLGlCQUFpQixDQUFDO0FBQzdELFlBQVEsU0FBUyxNQUFNLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUVsRSxZQUFRLFNBQVMsS0FBSztBQUFBLE1BQ3BCLE1BQU07QUFBQSxJQUNSLENBQUM7QUFFRCxRQUFJLHlCQUFRLE9BQU8sRUFDaEIsUUFBUSxjQUFjLEVBQ3RCO0FBQUEsTUFBUSxDQUFDLFNBQ1IsS0FDRyxlQUFlLDRCQUE0QixFQUMzQyxTQUFTLEtBQUssT0FBTyxTQUFTLFdBQVcsRUFDekMsU0FBUyxPQUFPLE1BQU07QUFDckIsYUFBSyxPQUFPLFNBQVMsY0FBYztBQUNuQyxjQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsTUFDakMsQ0FBQztBQUFBLElBQ0w7QUFFRixVQUFNLFdBQVcsS0FBSyxPQUFPLFNBQVMsY0FDbEMsY0FBYyxLQUFLLE9BQU8sU0FBUyxhQUFhLGFBQWEsS0FBSyxPQUFPLFNBQVMsV0FBVyxLQUM3RixjQUFjLEtBQUssT0FBTyxTQUFTLGFBQWE7QUFFcEQsVUFBTSxNQUFNLFFBQVEsU0FBUyxPQUFPLEVBQUUsS0FBSyxpQkFBaUIsQ0FBQztBQUM3RCxRQUFJLFNBQVMsUUFBUSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRXZDLFFBQUkseUJBQVEsT0FBTyxFQUFFO0FBQUEsTUFBVSxDQUFDLFFBQzlCLElBQ0csY0FBYyxjQUFjLEVBQzVCLFFBQVEsWUFBWTtBQUNuQixjQUFNLFVBQVUsVUFBVSxVQUFVLFFBQVE7QUFDNUMsWUFBSSx3QkFBTyxzQkFBc0I7QUFBQSxNQUNuQyxDQUFDO0FBQUEsSUFDTDtBQUVBLFFBQUkseUJBQVEsT0FBTyxFQUFFO0FBQUEsTUFBVSxDQUFDLFFBQzlCLElBQ0csY0FBYyxlQUFlLEVBQzdCLE9BQU8sRUFDUCxRQUFRLFlBQVk7QUFDbkIsWUFBSTtBQUNGLGdCQUFNLFNBQVMsTUFBTSxLQUFLLE9BQU8sY0FBYyxDQUFDLE9BQU8sQ0FBQztBQUN4RCxjQUFJLHdCQUFPLGVBQWU7QUFDMUIsa0JBQVEsU0FBUyxPQUFPLEVBQUUsS0FBSyxpQkFBaUIsQ0FBQyxFQUFFLFNBQVMsUUFBUSxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBQUEsUUFDdEYsU0FBUyxHQUFZO0FBQ25CLGdCQUFNLE1BQU07QUFDWixjQUFJLHdCQUFPLGlCQUFpQixJQUFJLE9BQU8sRUFBRTtBQUFBLFFBQzNDO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQWMsZ0JBQWdCLFFBQWdCLFNBQWdDO0FBQzVFLFVBQU0sT0FBTyxRQUFRLElBQUksUUFBUSxRQUFRLElBQUksZUFBZTtBQUM1RCxVQUFNLGlCQUFzQixXQUFLLE1BQU0sY0FBYztBQUVyRCxRQUFJLFdBQW9DLENBQUM7QUFDekMsUUFBTyxlQUFXLGNBQWMsR0FBRztBQUNqQyxVQUFJO0FBQ0YsbUJBQVcsS0FBSyxNQUFTLGlCQUFhLGdCQUFnQixPQUFPLENBQUM7QUFBQSxNQUNoRSxRQUFRO0FBQ04sWUFBSSx3QkFBTyx5Q0FBeUM7QUFDcEQ7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUVBLFVBQU0sYUFBYyxTQUFTLFlBQVksS0FBSyxDQUFDO0FBQy9DLGVBQVcsc0JBQXNCLElBQUk7QUFBQSxNQUNuQyxNQUFNO0FBQUEsTUFDTixTQUFTO0FBQUEsTUFDVCxNQUFNLENBQUMsS0FBSztBQUFBLE1BQ1osS0FBSyxFQUFFLFVBQVUsUUFBUTtBQUFBLElBQzNCO0FBQ0EsYUFBUyxZQUFZLElBQUk7QUFFekIsSUFBRyxrQkFBYyxnQkFBZ0IsS0FBSyxVQUFVLFVBQVUsTUFBTSxDQUFDLElBQUksTUFBTSxPQUFPO0FBQ2xGLFFBQUksd0JBQU8sOENBQThDO0FBQUEsRUFDM0Q7QUFBQSxFQUVBLE1BQWMsdUJBQXVCLGFBQW9DO0FBQ3ZFLFVBQU0sVUFBVTtBQUFBLE1BQ2QsU0FBUztBQUFBLE1BQ1QsU0FBUztBQUFBLE1BQ1QsV0FBVztBQUFBLFFBQ1QsTUFBTTtBQUFBLFFBQ04sU0FBUyxLQUFLLE9BQU8sU0FBUyxpQkFBaUI7QUFBQSxRQUMvQyxNQUFNLENBQUMsS0FBSztBQUFBLE1BQ2Q7QUFBQSxNQUNBLE9BQU87QUFBQSxRQUNMLEVBQUUsVUFBVSxtQkFBbUIsVUFBVSxjQUFjO0FBQUEsUUFDdkQsRUFBRSxVQUFVLGlCQUFpQixVQUFVLFlBQVk7QUFBQSxRQUNuRCxFQUFFLFVBQVUsbUJBQW1CLFVBQVUsY0FBYztBQUFBLFFBQ3ZELEVBQUUsVUFBVSxpQkFBaUIsVUFBVSxZQUFZO0FBQUEsUUFDbkQsRUFBRSxVQUFVLG1CQUFtQixVQUFVLGNBQWM7QUFBQSxRQUN2RCxFQUFFLFVBQVUsaUJBQWlCLFVBQVUsWUFBWTtBQUFBLFFBQ25ELEVBQUUsVUFBVSx5QkFBeUIsVUFBVSxjQUFjO0FBQUEsUUFDN0QsRUFBRSxVQUFVLHlCQUF5QixVQUFVLG9CQUFvQjtBQUFBLFFBQ25FLEVBQUUsVUFBVSxzQkFBc0IsVUFBVSxpQkFBaUI7QUFBQSxRQUM3RCxFQUFFLFVBQVUscUJBQXFCLFVBQVUsZ0JBQWdCO0FBQUEsUUFDM0QsRUFBRSxVQUFVLGNBQWMsVUFBVSxTQUFTO0FBQUEsUUFDN0MsRUFBRSxVQUFVLHVCQUF1QixVQUFVLGtCQUFrQjtBQUFBLFFBQy9ELEVBQUUsVUFBVSxvQkFBb0IsVUFBVSxlQUFlO0FBQUEsUUFDekQsRUFBRSxVQUFVLGlCQUFpQixVQUFVLFlBQVk7QUFBQSxRQUNuRCxFQUFFLFVBQVUsbUJBQW1CLFVBQVUsY0FBYztBQUFBLFFBQ3ZELEVBQUUsVUFBVSxtQkFBbUIsVUFBVSxjQUFjO0FBQUEsUUFDdkQsRUFBRSxVQUFVLHdCQUF3QixVQUFVLG1CQUFtQjtBQUFBLFFBQ2pFLEVBQUUsVUFBVSxvQkFBb0IsVUFBVSxlQUFlO0FBQUEsUUFDekQsRUFBRSxVQUFVLG1CQUFtQixVQUFVLGNBQWM7QUFBQSxRQUN2RCxFQUFFLFVBQVUsc0JBQXNCLFVBQVUsaUJBQWlCO0FBQUEsUUFDN0QsRUFBRSxVQUFVLHVCQUF1QixVQUFVLGtCQUFrQjtBQUFBLFFBQy9ELEVBQUUsVUFBVSxpQkFBaUIsVUFBVSxZQUFZO0FBQUEsUUFDbkQsRUFBRSxVQUFVLG1CQUFtQixVQUFVLGNBQWM7QUFBQSxNQUN6RDtBQUFBLElBQ0Y7QUFFQSxVQUFNLE1BQVcsY0FBUSxXQUFXO0FBQ3BDLFFBQUksQ0FBSSxlQUFXLEdBQUcsR0FBRztBQUN2QixNQUFHLGNBQVUsS0FBSyxFQUFFLFdBQVcsS0FBSyxDQUFDO0FBQUEsSUFDdkM7QUFFQSxJQUFHLGtCQUFjLGFBQWEsS0FBSyxVQUFVLFNBQVMsTUFBTSxDQUFDLElBQUksTUFBTSxPQUFPO0FBQzlFLFFBQUksd0JBQU8sOEJBQThCLFdBQVcsRUFBRTtBQUFBLEVBQ3hEO0FBQUEsRUFFQSxVQUFnQjtBQUNkLFNBQUssVUFBVSxNQUFNO0FBQUEsRUFDdkI7QUFDRjs7O0FDeFZBLElBQUFDLG1CQUErRDtBQUUvRCxJQUFBQyxNQUFvQjtBQUNwQixJQUFBQyxRQUFzQjtBQVF0QixJQUFNLFlBQVk7QUFBQSxFQUNoQixFQUFFLE9BQU8sY0FBYyxPQUFPLGNBQWMsVUFBVSwrQkFBK0I7QUFBQSxFQUNyRixFQUFFLE9BQU8sYUFBYSxPQUFPLGFBQWEsVUFBVSwrQkFBK0I7QUFBQSxFQUNuRixFQUFFLE9BQU8sVUFBVSxPQUFPLFVBQVUsVUFBVSw0QkFBNEI7QUFBQSxFQUMxRSxFQUFFLE9BQU8sVUFBVSxPQUFPLFdBQVcsVUFBVSx3QkFBd0I7QUFBQSxFQUN2RSxFQUFFLE9BQU8sU0FBUyxPQUFPLFNBQVMsVUFBVSx3QkFBd0I7QUFBQSxFQUNwRSxFQUFFLE9BQU8sVUFBVSxPQUFPLFVBQVUsVUFBVSxHQUFHO0FBQ25EO0FBRU8sSUFBTSxpQkFBTixjQUE2Qix1QkFBTTtBQUFBLEVBSXhDLFlBQVksS0FBVSxRQUFtQjtBQUN2QyxVQUFNLEdBQUc7QUFDVCxTQUFLLFNBQVM7QUFDZCxTQUFLLFNBQVMsQ0FBQyxHQUFJLEtBQUssT0FBTyxTQUFTLGFBQWEsQ0FBQyxDQUFFO0FBQUEsRUFDMUQ7QUFBQSxFQUVBLFNBQWU7QUFDYixVQUFNLEVBQUUsVUFBVSxJQUFJO0FBQ3RCLGNBQVUsU0FBUyxzQkFBc0I7QUFDekMsY0FBVSxTQUFTLE1BQU0sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3BELGNBQVUsU0FBUyxLQUFLO0FBQUEsTUFDdEIsTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLElBQ1AsQ0FBQztBQUVELFNBQUssYUFBYSxTQUFTO0FBQzNCLFNBQUssZUFBZSxTQUFTO0FBQzdCLFNBQUssY0FBYyxTQUFTO0FBQUEsRUFDOUI7QUFBQSxFQUVRLGFBQWEsV0FBOEI7QUFDakQsVUFBTSxrQkFBa0IsVUFBVSxVQUFVLEVBQUUsS0FBSyxpQkFBaUIsQ0FBQztBQUVyRSxRQUFJLEtBQUssT0FBTyxXQUFXLEdBQUc7QUFDNUIsc0JBQWdCLFNBQVMsS0FBSyxFQUFFLE1BQU0sd0JBQXdCLEtBQUssa0JBQWtCLENBQUM7QUFDdEY7QUFBQSxJQUNGO0FBRUEsVUFBTSxRQUFRLGdCQUFnQixTQUFTLFNBQVMsRUFBRSxLQUFLLGtCQUFrQixDQUFDO0FBQzFFLFVBQU0sUUFBUSxNQUFNLFNBQVMsT0FBTztBQUNwQyxVQUFNLFlBQVksTUFBTSxTQUFTLElBQUk7QUFDckMsY0FBVSxTQUFTLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN4QyxjQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQzdDLGNBQVUsU0FBUyxNQUFNLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDN0MsY0FBVSxTQUFTLE1BQU0sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUMzQyxjQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDO0FBRXJDLFVBQU0sUUFBUSxNQUFNLFNBQVMsT0FBTztBQUNwQyxhQUFTLElBQUksR0FBRyxJQUFJLEtBQUssT0FBTyxRQUFRLEtBQUs7QUFDM0MsWUFBTSxRQUFRLEtBQUssT0FBTyxDQUFDO0FBQzNCLFlBQU0sTUFBTSxNQUFNLFNBQVMsSUFBSTtBQUMvQixVQUFJLFNBQVMsTUFBTSxFQUFFLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDMUMsVUFBSSxTQUFTLE1BQU0sRUFBRSxNQUFNLE1BQU0sU0FBUyxDQUFDO0FBQzNDLFVBQUksU0FBUyxNQUFNLEVBQUUsTUFBTSxZQUFZLE1BQU0sUUFBUSxFQUFFLENBQUM7QUFFeEQsWUFBTSxhQUFhLElBQUksU0FBUyxJQUFJO0FBQ3BDLFlBQU0sU0FBUyxDQUFDLENBQUMsS0FBSyxPQUFPLFNBQVMsUUFBUSxNQUFNLE9BQU87QUFDM0QsaUJBQVcsU0FBUyxRQUFRO0FBQUEsUUFDMUIsTUFBTSxTQUFTLG1CQUFtQjtBQUFBLFFBQ2xDLEtBQUssU0FBUyxzQkFBc0I7QUFBQSxNQUN0QyxDQUFDO0FBRUQsWUFBTSxhQUFhLElBQUksU0FBUyxJQUFJO0FBQ3BDLFlBQU0sVUFBVSxXQUFXLFNBQVMsVUFBVTtBQUFBLFFBQzVDLE1BQU07QUFBQSxRQUNOLEtBQUs7QUFBQSxNQUNQLENBQUM7QUFDRCxjQUFRLGlCQUFpQixTQUFTLE1BQU0sS0FBSyxVQUFVLEtBQUssQ0FBQztBQUU3RCxZQUFNLFlBQVksV0FBVyxTQUFTLFVBQVU7QUFBQSxRQUM5QyxNQUFNO0FBQUEsUUFDTixLQUFLO0FBQUEsTUFDUCxDQUFDO0FBQ0QsZ0JBQVUsaUJBQWlCLFNBQVMsTUFBTTtBQUN4QyxhQUFLLE9BQU8sT0FBTyxHQUFHLENBQUM7QUFDdkIsYUFBSyxlQUFlO0FBQUEsTUFDdEIsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQUEsRUFFUSxlQUFlLFdBQThCO0FBQ25ELGNBQVUsU0FBUyxNQUFNLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFOUMsVUFBTSxXQUFxQixFQUFFLFNBQVMsSUFBSSxVQUFVLElBQUksVUFBVSxHQUFHO0FBRXJFLFFBQUkseUJBQVEsU0FBUyxFQUNsQixRQUFRLGtCQUFrQixFQUMxQjtBQUFBLE1BQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSxvQkFBb0IsRUFDbkMsU0FBUyxDQUFDLE1BQU07QUFBRSxpQkFBUyxVQUFVO0FBQUEsTUFBRyxDQUFDO0FBQUEsSUFDOUM7QUFFRixRQUFJLHlCQUFRLFNBQVMsRUFDbEIsUUFBUSxVQUFVLEVBQ2xCLFlBQVksQ0FBQyxTQUE0QjtBQUN4QyxpQkFBVyxLQUFLLFdBQVc7QUFDekIsYUFBSyxVQUFVLEVBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxNQUNqQztBQUNBLFdBQUssU0FBUyxDQUFDLE1BQU07QUFDbkIsaUJBQVMsV0FBVztBQUNwQixjQUFNLFFBQVEsVUFBVSxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztBQUNqRCxZQUFJLFNBQVMsTUFBTSxVQUFVO0FBQzNCLG1CQUFTLFdBQVcsTUFBTTtBQUFBLFFBQzVCO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSCxDQUFDO0FBRUgsUUFBSSx5QkFBUSxTQUFTLEVBQ2xCLFFBQVEsVUFBVSxFQUNsQjtBQUFBLE1BQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSw0QkFBNEIsRUFDM0MsU0FBUyxDQUFDLE1BQU07QUFBRSxpQkFBUyxXQUFXO0FBQUEsTUFBRyxDQUFDO0FBQUEsSUFDL0M7QUFFRixRQUFJLHlCQUFRLFNBQVMsRUFBRTtBQUFBLE1BQVUsQ0FBQyxRQUNoQyxJQUNHLGNBQWMsV0FBVyxFQUN6QixPQUFPLEVBQ1AsUUFBUSxNQUFNO0FBQ2IsWUFBSSxDQUFDLFNBQVMsV0FBVyxDQUFDLFNBQVMsVUFBVTtBQUMzQyxjQUFJLHdCQUFPLG9DQUFvQztBQUMvQztBQUFBLFFBQ0Y7QUFDQSxZQUFJLENBQUMsU0FBUyxVQUFVO0FBQ3RCLGdCQUFNLFFBQVEsVUFBVSxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsU0FBUyxRQUFRO0FBQ2pFLG1CQUFTLFdBQVcsT0FBTyxZQUFZO0FBQUEsUUFDekM7QUFDQSxhQUFLLE9BQU8sS0FBSyxFQUFFLEdBQUcsU0FBUyxDQUFDO0FBQ2hDLGFBQUssZUFBZTtBQUFBLE1BQ3RCLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDRjtBQUFBLEVBRVEsY0FBYyxXQUE4QjtBQUNsRCxVQUFNLFVBQVUsVUFBVSxVQUFVLEVBQUUsS0FBSyxvQkFBb0IsQ0FBQztBQUVoRSxRQUFJLHlCQUFRLE9BQU8sRUFBRTtBQUFBLE1BQVUsQ0FBQyxRQUM5QixJQUNHLGNBQWMsYUFBYSxFQUMzQixPQUFPLEVBQ1AsUUFBUSxZQUFZO0FBQ25CLGFBQUssT0FBTyxTQUFTLFlBQVksQ0FBQyxHQUFHLEtBQUssTUFBTTtBQUNoRCxjQUFNLEtBQUssT0FBTyxhQUFhO0FBQy9CLFlBQUksd0JBQU8sU0FBUyxLQUFLLE9BQU8sTUFBTSxTQUFTO0FBQUEsTUFDakQsQ0FBQztBQUFBLElBQ0w7QUFFQSxRQUFJLHlCQUFRLE9BQU8sRUFBRTtBQUFBLE1BQVUsQ0FBQyxRQUM5QixJQUNHLGNBQWMsaUJBQWlCLEVBQy9CLFdBQVcsRUFDWCxRQUFRLFlBQVk7QUFDbkIsY0FBTSxLQUFLLGNBQWM7QUFBQSxNQUMzQixDQUFDO0FBQUEsSUFDTDtBQUVBLFFBQUkseUJBQVEsT0FBTyxFQUFFO0FBQUEsTUFBVSxDQUFDLFFBQzlCLElBQ0csY0FBYyxrQkFBa0IsRUFDaEMsUUFBUSxZQUFZO0FBQ25CLGNBQU0sS0FBSyxlQUFlO0FBQzFCLGFBQUssZUFBZTtBQUFBLE1BQ3RCLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBYyxVQUFVLE9BQWdDO0FBQ3RELFVBQU0sTUFBTSxLQUFLLE9BQU8sU0FBUyxRQUFRLE1BQU0sT0FBTztBQUN0RCxRQUFJLENBQUMsS0FBSztBQUNSLFVBQUksd0JBQU8sa0JBQWtCLE1BQU0sT0FBTyxFQUFFO0FBQzVDO0FBQUEsSUFDRjtBQUVBLFFBQUk7QUFDRixZQUFNLFVBQWtDO0FBQUEsUUFDdEMsZUFBZSxVQUFVLEdBQUc7QUFBQSxNQUM5QjtBQUVBLFVBQUksTUFBTSxhQUFhLGFBQWE7QUFDbEMsZ0JBQVEsV0FBVyxJQUFJO0FBQ3ZCLGdCQUFRLG1CQUFtQixJQUFJO0FBQy9CLGVBQU8sUUFBUSxlQUFlO0FBQUEsTUFDaEM7QUFFQSxZQUFNLFVBQVUsTUFBTSxTQUFTLFFBQVEsUUFBUSxFQUFFO0FBQ2pELFVBQUksTUFBTTtBQUNWLFVBQUksTUFBTSxhQUFhO0FBQWMsY0FBTTtBQUFBLGVBQ2xDLE1BQU0sYUFBYTtBQUFhLGNBQU07QUFBQSxlQUN0QyxNQUFNLGFBQWE7QUFBVSxjQUFNO0FBRTVDLFlBQU0sV0FBVyxNQUFNLE1BQU0sS0FBSyxFQUFFLFFBQVEsQ0FBQztBQUM3QyxVQUFJLFNBQVMsSUFBSTtBQUNmLFlBQUksd0JBQU8sR0FBRyxNQUFNLFFBQVEsYUFBYTtBQUFBLE1BQzNDLE9BQU87QUFDTCxZQUFJLHdCQUFPLEdBQUcsTUFBTSxRQUFRLFVBQVUsU0FBUyxNQUFNLEVBQUU7QUFBQSxNQUN6RDtBQUFBLElBQ0YsU0FBUyxHQUFZO0FBQ25CLFlBQU0sTUFBTTtBQUNaLFVBQUksd0JBQU8sR0FBRyxNQUFNLFFBQVEsS0FBSyxJQUFJLE9BQU8sRUFBRTtBQUFBLElBQ2hEO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBYyxnQkFBK0I7QUFDM0MsVUFBTSxVQUFVLEtBQUssT0FBTyxTQUFTO0FBQ3JDLFFBQUksQ0FBQyxTQUFTO0FBQ1osVUFBSSx3QkFBTyxrQkFBa0I7QUFDN0I7QUFBQSxJQUNGO0FBRUEsVUFBTSxhQUFrQixXQUFLLFNBQVMsVUFBVSxzQkFBc0I7QUFDdEUsUUFBSSxDQUFJLGVBQVcsVUFBVSxHQUFHO0FBQzlCLFVBQUksd0JBQU8sZ0NBQWdDO0FBQzNDO0FBQUEsSUFDRjtBQUVBLFVBQU0sVUFBYSxpQkFBYSxZQUFZLE9BQU87QUFDbkQsVUFBTSxVQUFVLFFBQVEsTUFBTSx1QkFBdUI7QUFDckQsUUFBSSxDQUFDLFNBQVM7QUFDWixVQUFJLHdCQUFPLDBCQUEwQjtBQUNyQztBQUFBLElBQ0Y7QUFFQSxRQUFJLEtBQUssUUFBUSxDQUFDO0FBRWxCLFVBQU0sWUFBWSxDQUFDLGFBQWE7QUFDaEMsZUFBVyxTQUFTLEtBQUssUUFBUTtBQUMvQixnQkFBVSxLQUFLLFlBQVksTUFBTSxPQUFPLEVBQUU7QUFDMUMsZ0JBQVUsS0FBSyxpQkFBaUIsTUFBTSxRQUFRLEVBQUU7QUFDaEQsZ0JBQVUsS0FBSyxpQkFBaUIsTUFBTSxRQUFRLEVBQUU7QUFBQSxJQUNsRDtBQUNBLFVBQU0sYUFBYSxVQUFVLEtBQUssSUFBSTtBQUV0QyxVQUFNLGlCQUFpQixHQUFHLE1BQU0seUNBQXlDO0FBQ3pFLFFBQUksZ0JBQWdCO0FBQ2xCLFdBQUssR0FBRyxRQUFRLGVBQWUsQ0FBQyxHQUFHLFVBQVU7QUFBQSxJQUMvQyxPQUFPO0FBQ0wsWUFBTSxPQUFPO0FBQUEsSUFDZjtBQUVBLFVBQU0sT0FBTyxRQUFRLFVBQVUsUUFBUSxDQUFDLEVBQUUsTUFBTTtBQUNoRCxJQUFHLGtCQUFjLFlBQVk7QUFBQSxFQUFRLEVBQUU7QUFBQSxLQUFRLElBQUksSUFBSSxPQUFPO0FBRTlELFNBQUssT0FBTyxTQUFTLFlBQVksQ0FBQyxHQUFHLEtBQUssTUFBTTtBQUNoRCxVQUFNLEtBQUssT0FBTyxhQUFhO0FBQy9CLFFBQUksd0JBQU8sU0FBUyxLQUFLLE9BQU8sTUFBTSxtQkFBbUI7QUFBQSxFQUMzRDtBQUFBLEVBRUEsTUFBYyxpQkFBZ0M7QUFDNUMsVUFBTSxVQUFVLEtBQUssT0FBTyxTQUFTO0FBQ3JDLFFBQUksQ0FBQyxTQUFTO0FBQ1osVUFBSSx3QkFBTyxrQkFBa0I7QUFDN0I7QUFBQSxJQUNGO0FBRUEsVUFBTSxhQUFrQixXQUFLLFNBQVMsVUFBVSxzQkFBc0I7QUFDdEUsUUFBSSxDQUFJLGVBQVcsVUFBVSxHQUFHO0FBQzlCLFVBQUksd0JBQU8sZ0NBQWdDO0FBQzNDO0FBQUEsSUFDRjtBQUVBLFVBQU0sVUFBYSxpQkFBYSxZQUFZLE9BQU87QUFDbkQsVUFBTSxVQUFVLFFBQVEsTUFBTSx1QkFBdUI7QUFDckQsUUFBSSxDQUFDO0FBQVM7QUFFZCxVQUFNLEtBQUssUUFBUSxDQUFDO0FBQ3BCLFVBQU0sY0FBYyxHQUFHLE1BQU0sMENBQTBDO0FBQ3ZFLFFBQUksQ0FBQyxhQUFhO0FBQ2hCLFVBQUksd0JBQU8sK0JBQStCO0FBQzFDO0FBQUEsSUFDRjtBQUVBLFVBQU0sU0FBcUIsQ0FBQztBQUM1QixVQUFNLFVBQVUsWUFBWSxDQUFDLEVBQUU7QUFBQSxNQUM3QjtBQUFBLElBQ0Y7QUFDQSxlQUFXLEtBQUssU0FBUztBQUN2QixhQUFPLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxHQUFHLFVBQVUsRUFBRSxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQUEsSUFDL0Q7QUFFQSxTQUFLLFNBQVM7QUFDZCxTQUFLLE9BQU8sU0FBUyxZQUFZO0FBQ2pDLFVBQU0sS0FBSyxPQUFPLGFBQWE7QUFDL0IsUUFBSSx3QkFBTyxVQUFVLE9BQU8sTUFBTSxxQkFBcUI7QUFBQSxFQUN6RDtBQUFBLEVBRVEsaUJBQXVCO0FBQzdCLFNBQUssVUFBVSxNQUFNO0FBQ3JCLFNBQUssT0FBTztBQUFBLEVBQ2Q7QUFBQSxFQUVBLFVBQWdCO0FBQ2QsU0FBSyxVQUFVLE1BQU07QUFBQSxFQUN2QjtBQUNGO0FBRUEsU0FBUyxZQUFZLEtBQXFCO0FBQ3hDLE1BQUksSUFBSSxVQUFVO0FBQUksV0FBTztBQUM3QixTQUFPLElBQUksVUFBVSxHQUFHLEVBQUUsSUFBSTtBQUNoQzs7O0FDMVRBLElBQUFDLG1CQU1PO0FBR0EsSUFBTSxvQkFBb0I7QUFTMUIsSUFBTSxjQUFOLGNBQTBCLDBCQUFTO0FBQUEsRUFPeEMsWUFBWSxNQUFxQixRQUFtQjtBQUNsRCxVQUFNLElBQUk7QUFOWixTQUFRLFdBQTBCLENBQUM7QUFHbkMsU0FBUSxjQUF1QjtBQUk3QixTQUFLLFNBQVM7QUFBQSxFQUNoQjtBQUFBLEVBRUEsY0FBc0I7QUFDcEIsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUVBLGlCQUF5QjtBQUN2QixXQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsVUFBa0I7QUFDaEIsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUVBLE1BQU0sU0FBd0I7QUFDNUIsVUFBTSxZQUFZLEtBQUssWUFBWSxTQUFTLENBQUM7QUFDN0MsY0FBVSxNQUFNO0FBQ2hCLGNBQVUsU0FBUyx1QkFBdUI7QUFFMUMsVUFBTSxTQUFTLFVBQVUsVUFBVSxFQUFFLEtBQUsscUJBQXFCLENBQUM7QUFDaEUsV0FBTyxTQUFTLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUU3QyxVQUFNLGdCQUFnQixPQUFPLFVBQVUsRUFBRSxLQUFLLDZCQUE2QixDQUFDO0FBRTVFLFVBQU0sV0FBVyxjQUFjLFNBQVMsVUFBVTtBQUFBLE1BQ2hELEtBQUs7QUFBQSxNQUNMLE1BQU0sRUFBRSxjQUFjLGFBQWE7QUFBQSxJQUNyQyxDQUFDO0FBQ0Qsa0NBQVEsVUFBVSxTQUFTO0FBQzNCLGFBQVMsaUJBQWlCLFNBQVMsTUFBTTtBQUN2QyxXQUFLLFdBQVcsQ0FBQztBQUNqQixXQUFLLGVBQWU7QUFBQSxJQUN0QixDQUFDO0FBRUQsVUFBTSxZQUFZLE9BQU8sVUFBVSxFQUFFLEtBQUsseUJBQXlCLENBQUM7QUFDcEUsY0FBVSxTQUFTLFFBQVE7QUFBQSxNQUN6QixNQUFNLEtBQUssT0FBTyxTQUFTLGFBQWEsTUFBTSxHQUFHLEVBQUUsSUFBSSxLQUFLO0FBQUEsTUFDNUQsS0FBSztBQUFBLElBQ1AsQ0FBQztBQUVELFNBQUssYUFBYSxVQUFVLFVBQVUsRUFBRSxLQUFLLHVCQUF1QixDQUFDO0FBRXJFLFVBQU0sWUFBWSxVQUFVLFVBQVUsRUFBRSxLQUFLLHlCQUF5QixDQUFDO0FBRXZFLFNBQUssVUFBVSxVQUFVLFNBQVMsWUFBWTtBQUFBLE1BQzVDLEtBQUs7QUFBQSxNQUNMLE1BQU0sRUFBRSxhQUFhLG9DQUFvQyxNQUFNLElBQUk7QUFBQSxJQUNyRSxDQUFDO0FBRUQsU0FBSyxRQUFRLGlCQUFpQixXQUFXLENBQUMsTUFBcUI7QUFDN0QsVUFBSSxFQUFFLFFBQVEsV0FBVyxDQUFDLEVBQUUsVUFBVTtBQUNwQyxVQUFFLGVBQWU7QUFDakIsYUFBSyxZQUFZO0FBQUEsTUFDbkI7QUFBQSxJQUNGLENBQUM7QUFFRCxVQUFNLFNBQVMsVUFBVSxVQUFVLEVBQUUsS0FBSyxzQkFBc0IsQ0FBQztBQUVqRSxVQUFNLFVBQVUsT0FBTyxTQUFTLFVBQVU7QUFBQSxNQUN4QyxNQUFNO0FBQUEsTUFDTixLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQ0QsWUFBUSxpQkFBaUIsU0FBUyxNQUFNLEtBQUssWUFBWSxDQUFDO0FBRTFELFVBQU0sVUFBVSxPQUFPLFNBQVMsVUFBVTtBQUFBLE1BQ3hDLE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxJQUNQLENBQUM7QUFDRCxZQUFRLGlCQUFpQixTQUFTLE1BQU0sS0FBSyxXQUFXLENBQUM7QUFFekQsVUFBTSxZQUFZLE9BQU8sU0FBUyxVQUFVO0FBQUEsTUFDMUMsTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLElBQ1AsQ0FBQztBQUNELGNBQVUsaUJBQWlCLFNBQVMsTUFBTSxLQUFLLGtCQUFrQixjQUFjLENBQUM7QUFFaEYsVUFBTSxXQUFXLE9BQU8sU0FBUyxVQUFVO0FBQUEsTUFDekMsTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLElBQ1AsQ0FBQztBQUNELGFBQVMsaUJBQWlCLFNBQVMsTUFBTSxLQUFLLGtCQUFrQixXQUFXLENBQUM7QUFFNUUsU0FBSyxlQUFlO0FBQUEsRUFDdEI7QUFBQSxFQUVBLE1BQU0sVUFBeUI7QUFBQSxFQUUvQjtBQUFBLEVBRVEsaUJBQXVCO0FBQzdCLFNBQUssV0FBVyxNQUFNO0FBRXRCLFFBQUksS0FBSyxTQUFTLFdBQVcsR0FBRztBQUM5QixXQUFLLFdBQVcsVUFBVSxFQUFFLEtBQUssb0JBQW9CLENBQUMsRUFBRSxTQUFTLEtBQUs7QUFBQSxRQUNwRSxNQUFNO0FBQUEsTUFDUixDQUFDO0FBQ0Q7QUFBQSxJQUNGO0FBRUEsZUFBVyxPQUFPLEtBQUssVUFBVTtBQUMvQixZQUFNLFFBQVEsS0FBSyxXQUFXLFVBQVU7QUFBQSxRQUN0QyxLQUFLLDJDQUEyQyxJQUFJLElBQUk7QUFBQSxNQUMxRCxDQUFDO0FBRUQsWUFBTSxTQUFTLE1BQU0sVUFBVSxFQUFFLEtBQUssMkJBQTJCLENBQUM7QUFDbEUsYUFBTyxTQUFTLFFBQVE7QUFBQSxRQUN0QixNQUFNLElBQUksU0FBUyxTQUFTLFFBQVE7QUFBQSxRQUNwQyxLQUFLO0FBQUEsTUFDUCxDQUFDO0FBQ0QsYUFBTyxTQUFTLFFBQVE7QUFBQSxRQUN0QixNQUFNLElBQUksS0FBSyxJQUFJLFNBQVMsRUFBRSxtQkFBbUI7QUFBQSxRQUNqRCxLQUFLO0FBQUEsTUFDUCxDQUFDO0FBRUQsWUFBTSxVQUFVLEVBQUUsS0FBSywrQkFBK0IsTUFBTSxJQUFJLFFBQVEsQ0FBQztBQUV6RSxVQUFJLElBQUksZ0JBQWdCLElBQUksYUFBYSxTQUFTLEdBQUc7QUFDbkQsY0FBTSxRQUFRLE1BQU0sVUFBVSxFQUFFLEtBQUssc0JBQXNCLENBQUM7QUFDNUQsY0FBTSxTQUFTLFFBQVEsRUFBRSxNQUFNLGFBQWEsS0FBSyw0QkFBNEIsQ0FBQztBQUM5RSxtQkFBVyxRQUFRLElBQUksY0FBYztBQUNuQyxnQkFBTSxPQUFPLE1BQU0sU0FBUyxLQUFLO0FBQUEsWUFDL0IsTUFBTTtBQUFBLFlBQ04sS0FBSztBQUFBLFlBQ0wsTUFBTTtBQUFBLFVBQ1IsQ0FBQztBQUNELGVBQUssaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQ3BDLGNBQUUsZUFBZTtBQUNqQixpQkFBSyxJQUFJLFVBQVUsYUFBYSxNQUFNLElBQUksS0FBSztBQUFBLFVBQ2pELENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFFQSxTQUFLLFdBQVcsWUFBWSxLQUFLLFdBQVc7QUFBQSxFQUM5QztBQUFBLEVBRUEsTUFBYyxjQUE2QjtBQUN6QyxVQUFNLFVBQVUsS0FBSyxRQUFRLE1BQU0sS0FBSztBQUN4QyxRQUFJLENBQUMsV0FBVyxLQUFLO0FBQWE7QUFFbEMsU0FBSyxRQUFRLFFBQVE7QUFDckIsU0FBSyxjQUFjO0FBRW5CLFNBQUssU0FBUyxLQUFLO0FBQUEsTUFDakIsTUFBTTtBQUFBLE1BQ047QUFBQSxNQUNBLFdBQVcsS0FBSyxJQUFJO0FBQUEsSUFDdEIsQ0FBQztBQUNELFNBQUssZUFBZTtBQUVwQixRQUFJLGVBQXlCLENBQUM7QUFDOUIsUUFBSSxhQUFhO0FBRWpCLFFBQUk7QUFDRixZQUFNLFlBQVksTUFBTSxLQUFLLE9BQU8sY0FBYyxDQUFDLGFBQWEsT0FBTyxDQUFDO0FBQ3hFLFVBQUksV0FBVztBQUNiLHFCQUFhO0FBQ2IsY0FBTSxjQUFjLFVBQVUsU0FBUyxtQkFBbUI7QUFDMUQsbUJBQVcsS0FBSyxhQUFhO0FBQzNCLHVCQUFhLEtBQUssRUFBRSxDQUFDLENBQUM7QUFBQSxRQUN4QjtBQUNBLFlBQUksYUFBYSxXQUFXLEdBQUc7QUFDN0IsZ0JBQU0sY0FBYyxVQUFVLFNBQVMsd0NBQXdDO0FBQy9FLHFCQUFXLEtBQUssYUFBYTtBQUMzQix5QkFBYSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQztBQUFBLFVBQy9CO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLFFBQVE7QUFBQSxJQUVSO0FBRUEsVUFBTSxTQUFTLEtBQUssT0FBTyxTQUFTLFFBQVEsb0JBQW9CO0FBQ2hFLFFBQUksQ0FBQyxRQUFRO0FBQ1gsV0FBSyxTQUFTLEtBQUs7QUFBQSxRQUNqQixNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsUUFDVCxXQUFXLEtBQUssSUFBSTtBQUFBLE1BQ3RCLENBQUM7QUFDRCxXQUFLLGNBQWM7QUFDbkIsV0FBSyxlQUFlO0FBQ3BCO0FBQUEsSUFDRjtBQUVBLFVBQU0sZ0JBQWdCLEtBQUssT0FBTyxTQUFTO0FBQzNDLFVBQU0sZUFBZSxhQUNqQjtBQUFBO0FBQUE7QUFBQSxFQUE2QixVQUFVO0FBQUEsdUJBQ3ZDO0FBRUosVUFBTSxjQUFjO0FBQUEsTUFDbEIsRUFBRSxNQUFNLFVBQW1CLFNBQVMsZ0JBQWdCLGFBQWE7QUFBQSxNQUNqRSxHQUFHLEtBQUssU0FDTCxPQUFPLENBQUMsTUFBTSxFQUFFLFNBQVMsUUFBUSxFQUNqQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFNBQVMsRUFBRSxRQUFRLEVBQUU7QUFBQSxJQUN0RDtBQUVBLFFBQUk7QUFDRixZQUFNLFdBQVcsTUFBTSxNQUFNLGlEQUFpRDtBQUFBLFFBQzVFLFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxVQUNQLGVBQWUsVUFBVSxNQUFNO0FBQUEsVUFDL0IsZ0JBQWdCO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUEsVUFDaEIsV0FBVztBQUFBLFFBQ2I7QUFBQSxRQUNBLE1BQU0sS0FBSyxVQUFVO0FBQUEsVUFDbkIsT0FBTyxLQUFLLE9BQU8sU0FBUztBQUFBLFVBQzVCLFVBQVU7QUFBQSxVQUNWLFlBQVk7QUFBQSxRQUNkLENBQUM7QUFBQSxNQUNILENBQUM7QUFFRCxVQUFJLENBQUMsU0FBUyxJQUFJO0FBQ2hCLGNBQU0sVUFBVSxNQUFNLFNBQVMsS0FBSztBQUNwQyxZQUFJLFNBQVMsV0FBVyxPQUFPLFFBQVEsU0FBUyxXQUFXLEdBQUc7QUFDNUQsZ0JBQU0sSUFBSSxNQUFNLDJCQUEyQixTQUFTLE1BQU0sd0ZBQW1GLE9BQU8sVUFBVSxHQUFHLENBQUMsQ0FBQyxLQUFLO0FBQUEsUUFDMUs7QUFDQSxjQUFNLElBQUksTUFBTSxjQUFjLFNBQVMsTUFBTSxLQUFLLE9BQU8sRUFBRTtBQUFBLE1BQzdEO0FBRUEsWUFBTSxPQUFRLE1BQU0sU0FBUyxLQUFLO0FBR2xDLFlBQU0sbUJBQW1CLEtBQUssVUFBVSxDQUFDLEdBQUcsU0FBUyxXQUFXO0FBRWhFLFdBQUssU0FBUyxLQUFLO0FBQUEsUUFDakIsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLFFBQ1Q7QUFBQSxRQUNBLFdBQVcsS0FBSyxJQUFJO0FBQUEsTUFDdEIsQ0FBQztBQUFBLElBQ0gsU0FBUyxHQUFZO0FBQ25CLFlBQU0sTUFBTTtBQUNaLFdBQUssU0FBUyxLQUFLO0FBQUEsUUFDakIsTUFBTTtBQUFBLFFBQ04sU0FBUyxVQUFVLElBQUksT0FBTztBQUFBLFFBQzlCLFdBQVcsS0FBSyxJQUFJO0FBQUEsTUFDdEIsQ0FBQztBQUFBLElBQ0g7QUFFQSxTQUFLLGNBQWM7QUFDbkIsU0FBSyxlQUFlO0FBQUEsRUFDdEI7QUFBQSxFQUVBLE1BQWMsYUFBNEI7QUFDeEMsUUFBSSxLQUFLLFNBQVMsV0FBVyxHQUFHO0FBQzlCLFVBQUksd0JBQU8scUJBQXFCO0FBQ2hDO0FBQUEsSUFDRjtBQUVBLFVBQU0sZ0JBQWdCLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLFdBQVc7QUFDckYsUUFBSSxDQUFDLGVBQWU7QUFDbEIsVUFBSSx3QkFBTywrQkFBK0I7QUFDMUM7QUFBQSxJQUNGO0FBRUEsVUFBTSxXQUFXLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLE1BQU07QUFDM0UsVUFBTSxRQUFRLFdBQ1YsU0FBUyxRQUFRLFVBQVUsR0FBRyxFQUFFLEVBQUUsUUFBUSxvQkFBb0IsRUFBRSxFQUFFLEtBQUssSUFDdkU7QUFDSixVQUFNLE9BQU8sTUFBTSxRQUFRLFFBQVEsR0FBRyxFQUFFLFlBQVk7QUFDcEQsVUFBTSxPQUFNLG9CQUFJLEtBQUssR0FBRSxZQUFZLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUVqRCxVQUFNLGNBQWM7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsV0FBVyxLQUFLO0FBQUEsTUFDaEI7QUFBQSxNQUNBLHFCQUFxQixHQUFHO0FBQUEsTUFDeEI7QUFBQSxNQUNBLGtCQUFrQixHQUFHO0FBQUEsTUFDckI7QUFBQSxNQUNBO0FBQUEsSUFDRixFQUFFLEtBQUssSUFBSTtBQUVYLFVBQU0sVUFBVSxHQUFHLFdBQVc7QUFBQTtBQUFBLElBQVMsS0FBSztBQUFBO0FBQUEsRUFBTyxjQUFjLE9BQU87QUFBQTtBQUFBO0FBQUE7QUFBQSxnQ0FBbUQsR0FBRztBQUFBO0FBRTlILFFBQUk7QUFDRixZQUFNLE9BQU8sTUFBTSxLQUFLLElBQUksTUFBTSxPQUFPLGNBQWMsSUFBSSxPQUFPLE9BQU87QUFDekUsVUFBSSx3QkFBTyxzQkFBc0IsS0FBSyxJQUFJLEVBQUU7QUFDNUMsV0FBSyxJQUFJLFVBQVUsYUFBYSxLQUFLLE1BQU0sSUFBSSxLQUFLO0FBQUEsSUFDdEQsU0FBUyxHQUFZO0FBQ25CLFlBQU0sTUFBTTtBQUNaLFVBQUksSUFBSSxRQUFRLFNBQVMsZ0JBQWdCLEdBQUc7QUFDMUMsWUFBSSx3QkFBTywyQ0FBMkM7QUFBQSxNQUN4RCxPQUFPO0FBQ0wsWUFBSSx3QkFBTywrQkFBK0IsSUFBSSxPQUFPLEVBQUU7QUFBQSxNQUN6RDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFjLGtCQUFrQixhQUFvQztBQUNsRSxRQUFJLEtBQUssU0FBUyxXQUFXLEdBQUc7QUFDOUIsVUFBSSx3QkFBTyx5QkFBeUI7QUFDcEM7QUFBQSxJQUNGO0FBRUEsVUFBTSxXQUFXLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLE1BQU07QUFDM0UsUUFBSSxDQUFDLFVBQVU7QUFDYixVQUFJLHdCQUFPLDZCQUE2QjtBQUN4QztBQUFBLElBQ0Y7QUFFQSxRQUFJO0FBQ0YsWUFBTSxTQUFTLE1BQU0sS0FBSyxPQUFPLGNBQWM7QUFBQSxRQUM3QztBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0EsU0FBUztBQUFBLE1BQ1gsQ0FBQztBQUNELFVBQUksd0JBQU8saUJBQWlCLFdBQVcsRUFBRTtBQUV6QyxXQUFLLFNBQVMsS0FBSztBQUFBLFFBQ2pCLE1BQU07QUFBQSxRQUNOLFNBQVMsaUJBQWlCLFdBQVcsS0FBSyxNQUFNO0FBQUEsUUFDaEQsV0FBVyxLQUFLLElBQUk7QUFBQSxNQUN0QixDQUFDO0FBQ0QsV0FBSyxlQUFlO0FBQUEsSUFDdEIsU0FBUyxHQUFZO0FBQ25CLFlBQU0sTUFBTTtBQUNaLFVBQUksd0JBQU8sb0JBQW9CLElBQUksT0FBTyxFQUFFO0FBQUEsSUFDOUM7QUFBQSxFQUNGO0FBQ0Y7OztBQy9WQSxJQUFBQyxtQkFLTztBQUVQLElBQUFDLE1BQW9CO0FBQ3BCLElBQUFDLFFBQXNCO0FBRWYsSUFBTSxrQkFBa0I7QUFzQnhCLElBQU0sWUFBTixjQUF3QiwwQkFBUztBQUFBLEVBR3RDLFlBQVksTUFBcUIsUUFBbUI7QUFDbEQsVUFBTSxJQUFJO0FBQ1YsU0FBSyxTQUFTO0FBQUEsRUFDaEI7QUFBQSxFQUVBLGNBQXNCO0FBQ3BCLFdBQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxpQkFBeUI7QUFDdkIsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUVBLFVBQWtCO0FBQ2hCLFdBQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxNQUFNLFNBQXdCO0FBQzVCLFVBQU0sS0FBSyxPQUFPO0FBQUEsRUFDcEI7QUFBQSxFQUVBLE1BQU0sVUFBeUI7QUFBQSxFQUUvQjtBQUFBLEVBRUEsTUFBYyxTQUF3QjtBQUNwQyxVQUFNLFlBQVksS0FBSyxZQUFZLFNBQVMsQ0FBQztBQUM3QyxjQUFVLE1BQU07QUFDaEIsY0FBVSxTQUFTLHFCQUFxQjtBQUV4QyxVQUFNLFNBQVMsVUFBVSxVQUFVLEVBQUUsS0FBSyxtQkFBbUIsQ0FBQztBQUM5RCxXQUFPLFNBQVMsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFL0MsVUFBTSxhQUFhLE9BQU8sU0FBUyxVQUFVO0FBQUEsTUFDM0MsS0FBSztBQUFBLE1BQ0wsTUFBTSxFQUFFLGNBQWMsVUFBVTtBQUFBLElBQ2xDLENBQUM7QUFDRCxrQ0FBUSxZQUFZLFlBQVk7QUFDaEMsZUFBVyxpQkFBaUIsU0FBUyxNQUFNLEtBQUssT0FBTyxDQUFDO0FBRXhELFVBQU0sVUFBVSxLQUFLLE9BQU8sU0FBUztBQUNyQyxRQUFJLENBQUMsU0FBUztBQUNaLGdCQUFVLFNBQVMsS0FBSztBQUFBLFFBQ3RCLE1BQU07QUFBQSxRQUNOLEtBQUs7QUFBQSxNQUNQLENBQUM7QUFDRDtBQUFBLElBQ0Y7QUFFQSxVQUFNLFlBQVksS0FBSyxjQUFjLE9BQU87QUFDNUMsVUFBTSxhQUFhLEtBQUssVUFBZ0MsV0FBSyxTQUFTLFNBQVMsbUJBQW1CLENBQUM7QUFDbkcsVUFBTSxlQUFlLEtBQUssVUFBMkIsV0FBSyxTQUFTLFNBQVMscUJBQXFCLENBQUM7QUFDbEcsVUFBTSxZQUFZLEtBQUssV0FBZ0IsV0FBSyxTQUFTLFlBQVksR0FBRyxLQUFLO0FBQ3pFLFVBQU0sZUFBZSxLQUFLLGtCQUFrQixPQUFPO0FBQ25ELFVBQU0sV0FBVyxLQUFLLFdBQWdCLFdBQUssU0FBUyxrQkFBa0IsR0FBRyxLQUFLO0FBRTlFLFNBQUssaUJBQWlCLFdBQVcsU0FBUztBQUMxQyxTQUFLLG1CQUFtQixXQUFXLFdBQVcsY0FBYyxVQUFVLFlBQVksWUFBWTtBQUM5RixTQUFLLHFCQUFxQixXQUFXLFVBQVU7QUFDL0MsU0FBSyxpQkFBaUIsV0FBVyxZQUFZO0FBQzdDLFNBQUsscUJBQXFCLFdBQVcsVUFBVTtBQUFBLEVBQ2pEO0FBQUEsRUFFUSxpQkFBaUIsV0FBd0IsV0FBdUM7QUFDdEYsVUFBTSxPQUFPLFVBQVUsVUFBVSxFQUFFLEtBQUssaUJBQWlCLENBQUM7QUFDMUQsU0FBSyxTQUFTLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTdDLFFBQUksQ0FBQyxXQUFXO0FBQ2QsV0FBSyxTQUFTLEtBQUssRUFBRSxNQUFNLHFCQUFxQixLQUFLLGtCQUFrQixDQUFDO0FBQ3hFO0FBQUEsSUFDRjtBQUVBLFVBQU0sV0FBVyxLQUFLLFVBQVUsRUFBRSxLQUFLLHVCQUF1QixDQUFDO0FBQy9ELFVBQU0sWUFBWSxTQUFTLFNBQVMsUUFBUTtBQUFBLE1BQzFDLEtBQUssK0JBQStCLFVBQVUsV0FBVyxpQkFBaUIsVUFBVSxXQUFXLFlBQVksVUFBVSxLQUFLO0FBQUEsSUFDNUgsQ0FBQztBQUNELGNBQVUsY0FBYztBQUN4QixhQUFTLFNBQVMsUUFBUSxFQUFFLE1BQU0sWUFBWSxVQUFVLE1BQU0sR0FBRyxDQUFDO0FBRWxFLFNBQUssU0FBUyxLQUFLO0FBQUEsTUFDakIsTUFBTSxlQUFlLElBQUksS0FBSyxVQUFVLFVBQVUsRUFBRSxlQUFlLENBQUM7QUFBQSxNQUNwRSxLQUFLO0FBQUEsSUFDUCxDQUFDO0FBRUQsUUFBSSxVQUFVLE9BQU8sU0FBUyxHQUFHO0FBQy9CLFlBQU0sVUFBVSxLQUFLLFNBQVMsTUFBTSxFQUFFLEtBQUssdUJBQXVCLENBQUM7QUFDbkUsaUJBQVcsT0FBTyxVQUFVLFFBQVE7QUFDbEMsZ0JBQVEsU0FBUyxNQUFNLEVBQUUsTUFBTSxLQUFLLEtBQUssWUFBWSxDQUFDO0FBQUEsTUFDeEQ7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBRVEsbUJBQ04sV0FDQSxXQUNBLGNBQ0EsVUFDQSxZQUNBLGNBQ007QUFDTixVQUFNLE9BQU8sVUFBVSxVQUFVLEVBQUUsS0FBSyxpQkFBaUIsQ0FBQztBQUUxRCxTQUFLLGlCQUFpQixNQUFNLGNBQWMsT0FBTyxTQUFTLEdBQUcsV0FBVztBQUN4RSxTQUFLLGlCQUFpQixNQUFNLGlCQUFpQixPQUFPLFlBQVksR0FBRyxXQUFXO0FBQzlFLFNBQUssaUJBQWlCLE1BQU0sa0JBQWtCLE9BQU8sUUFBUSxHQUFHLGdCQUFnQjtBQUVoRixVQUFNLGVBQWUsV0FBVyxPQUFPLENBQUMsTUFBTSxFQUFFLFlBQVksSUFBSSxFQUFFO0FBQ2xFLFVBQU0sa0JBQWtCLFdBQVcsT0FBTyxDQUFDLE1BQU0sRUFBRSxZQUFZLE1BQVMsRUFBRTtBQUMxRSxVQUFNLE9BQU8sa0JBQWtCLElBQUksS0FBSyxNQUFPLGVBQWUsa0JBQW1CLEdBQUcsSUFBSTtBQUN4RixTQUFLLGlCQUFpQixNQUFNLGdCQUFnQixHQUFHLElBQUksS0FBSyxjQUFjO0FBRXRFLFVBQU0sV0FBVyxhQUFhLFNBQVMsS0FDbEMsYUFBYSxPQUFPLENBQUMsS0FBSyxNQUFNLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxhQUFhLFFBQVEsUUFBUSxDQUFDLElBQ25GO0FBQ0osU0FBSyxpQkFBaUIsTUFBTSxhQUFhLFVBQVUsTUFBTTtBQUN6RCxTQUFLLGlCQUFpQixNQUFNLFlBQVksT0FBTyxhQUFhLE1BQU0sR0FBRyxVQUFVO0FBQUEsRUFDakY7QUFBQSxFQUVRLGlCQUFpQixRQUFxQixPQUFlLE9BQWUsTUFBb0I7QUFDOUYsVUFBTSxPQUFPLE9BQU8sVUFBVSxFQUFFLEtBQUssbUJBQW1CLENBQUM7QUFDekQsVUFBTSxTQUFTLEtBQUssVUFBVSxFQUFFLEtBQUssd0JBQXdCLENBQUM7QUFDOUQsa0NBQVEsUUFBUSxJQUFJO0FBQ3BCLFNBQUssU0FBUyxPQUFPLEVBQUUsTUFBTSxPQUFPLEtBQUsseUJBQXlCLENBQUM7QUFDbkUsU0FBSyxTQUFTLE9BQU8sRUFBRSxNQUFNLE9BQU8sS0FBSyx5QkFBeUIsQ0FBQztBQUFBLEVBQ3JFO0FBQUEsRUFFUSxxQkFBcUIsV0FBd0IsWUFBcUM7QUFDeEYsVUFBTSxPQUFPLFVBQVUsVUFBVSxFQUFFLEtBQUssaUJBQWlCLENBQUM7QUFDMUQsU0FBSyxTQUFTLE1BQU0sRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUUxQyxRQUFJLFdBQVcsV0FBVyxHQUFHO0FBQzNCLFdBQUssU0FBUyxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsS0FBSyxrQkFBa0IsQ0FBQztBQUN0RTtBQUFBLElBQ0Y7QUFFQSxVQUFNLGFBQXFDLENBQUM7QUFDNUMsZUFBVyxTQUFTLFlBQVk7QUFDOUIsVUFBSSxNQUFNLE1BQU07QUFDZCxtQkFBVyxNQUFNLElBQUksS0FBSyxXQUFXLE1BQU0sSUFBSSxLQUFLLEtBQUs7QUFBQSxNQUMzRDtBQUFBLElBQ0Y7QUFFQSxVQUFNLFNBQVMsT0FBTyxRQUFRLFVBQVUsRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUU7QUFDakYsUUFBSSxPQUFPLFdBQVcsR0FBRztBQUN2QixXQUFLLFNBQVMsS0FBSyxFQUFFLE1BQU0sc0JBQXNCLEtBQUssa0JBQWtCLENBQUM7QUFDekU7QUFBQSxJQUNGO0FBRUEsVUFBTSxXQUFXLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFDNUIsVUFBTSxVQUFVLEtBQUssVUFBVSxFQUFFLEtBQUssc0JBQXNCLENBQUM7QUFFN0QsZUFBVyxDQUFDLE1BQU0sS0FBSyxLQUFLLFFBQVE7QUFDbEMsWUFBTSxNQUFNLFFBQVEsVUFBVSxFQUFFLEtBQUssb0JBQW9CLENBQUM7QUFDMUQsVUFBSSxVQUFVLEVBQUUsS0FBSyx1QkFBdUIsTUFBTSxLQUFLLENBQUM7QUFFeEQsWUFBTSxlQUFlLElBQUksVUFBVSxFQUFFLEtBQUssMEJBQTBCLENBQUM7QUFDckUsWUFBTSxNQUFNLGFBQWEsVUFBVSxFQUFFLEtBQUssZ0JBQWdCLENBQUM7QUFDM0QsWUFBTSxNQUFNLFdBQVcsSUFBSyxRQUFRLFdBQVksTUFBTTtBQUN0RCxVQUFJLE1BQU0sUUFBUSxHQUFHLEdBQUc7QUFFeEIsVUFBSSxVQUFVLEVBQUUsS0FBSyx1QkFBdUIsTUFBTSxPQUFPLEtBQUssRUFBRSxDQUFDO0FBQUEsSUFDbkU7QUFBQSxFQUNGO0FBQUEsRUFFUSxpQkFBaUIsV0FBd0IsY0FBa0M7QUFDakYsVUFBTSxPQUFPLFVBQVUsVUFBVSxFQUFFLEtBQUssaUJBQWlCLENBQUM7QUFDMUQsU0FBSyxTQUFTLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUUzQyxRQUFJLGFBQWEsU0FBUyxHQUFHO0FBQzNCLFdBQUssU0FBUyxLQUFLLEVBQUUsTUFBTSxzQ0FBc0MsS0FBSyxrQkFBa0IsQ0FBQztBQUN6RjtBQUFBLElBQ0Y7QUFFQSxVQUFNLFNBQVMsYUFBYSxNQUFNLEdBQUc7QUFDckMsVUFBTSxTQUFTLEtBQUssU0FBUyxVQUFVO0FBQUEsTUFDckMsS0FBSztBQUFBLE1BQ0wsTUFBTSxFQUFFLE9BQU8sT0FBTyxRQUFRLE1BQU07QUFBQSxJQUN0QyxDQUFDO0FBRUQsVUFBTSxNQUFNLE9BQU8sV0FBVyxJQUFJO0FBQ2xDLFFBQUksQ0FBQztBQUFLO0FBRVYsVUFBTSxTQUFTLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLO0FBQ3hDLFVBQU0sV0FBVyxLQUFLLElBQUksR0FBRyxNQUFNO0FBQ25DLFVBQU0sV0FBVyxLQUFLLElBQUksR0FBRyxNQUFNO0FBQ25DLFVBQU0sUUFBUSxXQUFXLFlBQVk7QUFFckMsVUFBTSxJQUFJLE9BQU87QUFDakIsVUFBTSxJQUFJLE9BQU87QUFDakIsVUFBTSxVQUFVO0FBQ2hCLFVBQU0sUUFBUSxJQUFJLFVBQVU7QUFDNUIsVUFBTSxRQUFRLElBQUksVUFBVTtBQUU1QixRQUFJLGNBQWM7QUFDbEIsUUFBSSxZQUFZO0FBQ2hCLFFBQUksVUFBVTtBQUNkLFFBQUksT0FBTyxTQUFTLE9BQU87QUFDM0IsUUFBSSxPQUFPLFNBQVMsSUFBSSxPQUFPO0FBQy9CLFFBQUksT0FBTyxJQUFJLFNBQVMsSUFBSSxPQUFPO0FBQ25DLFFBQUksT0FBTztBQUVYLFFBQUksY0FBYztBQUNsQixRQUFJLFlBQVk7QUFDaEIsUUFBSSxVQUFVO0FBRWQsYUFBUyxJQUFJLEdBQUcsSUFBSSxPQUFPLFFBQVEsS0FBSztBQUN0QyxZQUFNLElBQUksVUFBVyxLQUFLLE9BQU8sU0FBUyxLQUFNO0FBQ2hELFlBQU0sSUFBSSxJQUFJLFdBQVksT0FBTyxDQUFDLElBQUksWUFBWSxRQUFTO0FBQzNELFVBQUksTUFBTTtBQUFHLFlBQUksT0FBTyxHQUFHLENBQUM7QUFBQTtBQUN2QixZQUFJLE9BQU8sR0FBRyxDQUFDO0FBQUEsSUFDdEI7QUFDQSxRQUFJLE9BQU87QUFFWCxhQUFTLElBQUksR0FBRyxJQUFJLE9BQU8sUUFBUSxLQUFLO0FBQ3RDLFlBQU0sSUFBSSxVQUFXLEtBQUssT0FBTyxTQUFTLEtBQU07QUFDaEQsWUFBTSxJQUFJLElBQUksV0FBWSxPQUFPLENBQUMsSUFBSSxZQUFZLFFBQVM7QUFDM0QsVUFBSSxZQUFZO0FBQ2hCLFVBQUksVUFBVTtBQUNkLFVBQUksSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssS0FBSyxDQUFDO0FBQy9CLFVBQUksS0FBSztBQUFBLElBQ1g7QUFFQSxRQUFJLFlBQVk7QUFDaEIsUUFBSSxPQUFPO0FBQ1gsUUFBSSxTQUFTLFNBQVMsUUFBUSxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUM7QUFDaEQsUUFBSSxTQUFTLFNBQVMsUUFBUSxDQUFDLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQztBQUFBLEVBQ3REO0FBQUEsRUFFUSxxQkFBcUIsV0FBd0IsWUFBcUM7QUFDeEYsVUFBTSxPQUFPLFVBQVUsVUFBVSxFQUFFLEtBQUssaUJBQWlCLENBQUM7QUFDMUQsU0FBSyxTQUFTLE1BQU0sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRS9DLFVBQU0sU0FBUyxXQUFXLE1BQU0sR0FBRyxFQUFFLFFBQVE7QUFDN0MsUUFBSSxPQUFPLFdBQVcsR0FBRztBQUN2QixXQUFLLFNBQVMsS0FBSyxFQUFFLE1BQU0sc0JBQXNCLEtBQUssa0JBQWtCLENBQUM7QUFDekU7QUFBQSxJQUNGO0FBRUEsVUFBTSxRQUFRLEtBQUssU0FBUyxTQUFTLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztBQUMvRCxVQUFNLFFBQVEsTUFBTSxTQUFTLE9BQU87QUFDcEMsVUFBTSxZQUFZLE1BQU0sU0FBUyxJQUFJO0FBQ3JDLGNBQVUsU0FBUyxNQUFNLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDekMsY0FBVSxTQUFTLE1BQU0sRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUN6QyxjQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQzdDLGNBQVUsU0FBUyxNQUFNLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFM0MsVUFBTSxRQUFRLE1BQU0sU0FBUyxPQUFPO0FBQ3BDLGVBQVcsU0FBUyxRQUFRO0FBQzFCLFlBQU0sTUFBTSxNQUFNLFNBQVMsSUFBSTtBQUMvQixVQUFJLFNBQVMsTUFBTSxFQUFFLE1BQU0sTUFBTSxRQUFRLFVBQVUsQ0FBQztBQUNwRCxVQUFJLFNBQVMsTUFBTTtBQUFBLFFBQ2pCLE1BQU0sTUFBTSxZQUFZLElBQUksS0FBSyxNQUFNLFNBQVMsRUFBRSxtQkFBbUIsSUFBSTtBQUFBLE1BQzNFLENBQUM7QUFDRCxVQUFJLFNBQVMsTUFBTTtBQUFBLFFBQ2pCLE1BQU0sTUFBTSxnQkFBZ0IsU0FBWSxHQUFHLE1BQU0sV0FBVyxPQUFPO0FBQUEsTUFDckUsQ0FBQztBQUNELFlBQU0sYUFBYSxJQUFJLFNBQVMsSUFBSTtBQUNwQyxVQUFJLE1BQU0sWUFBWSxNQUFNO0FBQzFCLG1CQUFXLFNBQVMsUUFBUSxFQUFFLE1BQU0sVUFBVSxLQUFLLG9CQUFvQixDQUFDO0FBQUEsTUFDMUUsV0FBVyxNQUFNLFlBQVksT0FBTztBQUNsQyxtQkFBVyxTQUFTLFFBQVEsRUFBRSxNQUFNLFVBQVUsS0FBSyxvQkFBb0IsQ0FBQztBQUFBLE1BQzFFLE9BQU87QUFDTCxtQkFBVyxTQUFTLFFBQVEsRUFBRSxNQUFNLElBQUksQ0FBQztBQUFBLE1BQzNDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUVRLGNBQWMsU0FBdUM7QUFDM0QsVUFBTSxXQUFnQixXQUFLLFNBQVMsU0FBUyxnQkFBZ0I7QUFDN0QsUUFBSTtBQUNGLFlBQU0sVUFBYSxpQkFBYSxVQUFVLE9BQU87QUFDakQsYUFBTyxLQUFLLE1BQU0sT0FBTztBQUFBLElBQzNCLFFBQVE7QUFDTixhQUFPO0FBQUEsSUFDVDtBQUFBLEVBQ0Y7QUFBQSxFQUVRLFVBQWEsVUFBdUI7QUFDMUMsUUFBSTtBQUNGLFlBQU0sVUFBYSxpQkFBYSxVQUFVLE9BQU87QUFDakQsYUFBTyxRQUNKLE1BQU0sSUFBSSxFQUNWLE9BQU8sQ0FBQyxTQUFTLEtBQUssS0FBSyxDQUFDLEVBQzVCLElBQUksQ0FBQyxTQUFTLEtBQUssTUFBTSxJQUFJLENBQU07QUFBQSxJQUN4QyxRQUFRO0FBQ04sYUFBTyxDQUFDO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFBQSxFQUVRLFdBQVcsU0FBaUIsV0FBMkI7QUFDN0QsUUFBSTtBQUNGLFVBQUksQ0FBSSxlQUFXLE9BQU87QUFBRyxlQUFPO0FBQ3BDLGFBQVUsZ0JBQVksT0FBTyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxTQUFTLENBQUMsRUFBRTtBQUFBLElBQ3RFLFFBQVE7QUFDTixhQUFPO0FBQUEsSUFDVDtBQUFBLEVBQ0Y7QUFBQSxFQUVRLGtCQUFrQixTQUF5QjtBQUNqRCxVQUFNLFVBQWUsV0FBSyxTQUFTLG9CQUFvQjtBQUN2RCxRQUFJO0FBQ0YsVUFBSSxDQUFJLGVBQVcsT0FBTztBQUFHLGVBQU87QUFDcEMsWUFBTSxRQUFXLGdCQUFZLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLFNBQVMsS0FBSyxDQUFDO0FBQ3JFLFVBQUksVUFBVTtBQUNkLGlCQUFXLFFBQVEsT0FBTztBQUN4QixZQUFJO0FBQ0YsZ0JBQU0sVUFBYSxpQkFBa0IsV0FBSyxTQUFTLElBQUksR0FBRyxPQUFPO0FBQ2pFLGNBQUksUUFBUSxTQUFTLGlCQUFpQixHQUFHO0FBQ3ZDO0FBQUEsVUFDRjtBQUFBLFFBQ0YsUUFBUTtBQUFBLFFBRVI7QUFBQSxNQUNGO0FBQ0EsYUFBTztBQUFBLElBQ1QsUUFBUTtBQUNOLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUNGOzs7QUwxVkEsU0FBUyxnQkFBZ0IsS0FBVSxPQUFlLFNBQXVCO0FBQ3ZFLFFBQU0sUUFBUSxJQUFJLFlBQVksS0FBSyxPQUFPLE9BQU87QUFDakQsUUFBTSxLQUFLO0FBQ2I7QUFFQSxJQUFNLGNBQU4sY0FBMEIsdUJBQU07QUFBQSxFQUk5QixZQUFZLEtBQVUsT0FBZSxTQUFpQjtBQUNwRCxVQUFNLEdBQUc7QUFDVCxTQUFLLFFBQVE7QUFDYixTQUFLLFVBQVU7QUFBQSxFQUNqQjtBQUFBLEVBRUEsU0FBZTtBQUNiLFVBQU0sRUFBRSxVQUFVLElBQUk7QUFDdEIsY0FBVSxTQUFTLE1BQU0sRUFBRSxNQUFNLEtBQUssTUFBTSxDQUFDO0FBQzdDLFVBQU0sTUFBTSxVQUFVLFNBQVMsT0FBTyxFQUFFLEtBQUssaUJBQWlCLENBQUM7QUFDL0QsUUFBSSxTQUFTLFFBQVEsRUFBRSxNQUFNLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDN0M7QUFBQSxFQUVBLFVBQWdCO0FBQ2QsU0FBSyxVQUFVLE1BQU07QUFBQSxFQUN2QjtBQUNGO0FBRUEsSUFBTSxjQUFOLGNBQTBCLHVCQUFNO0FBQUEsRUFJOUIsWUFBWSxLQUFVLFFBQW1CO0FBQ3ZDLFVBQU0sR0FBRztBQUhYLFNBQVEsUUFBZ0I7QUFJdEIsU0FBSyxTQUFTO0FBQUEsRUFDaEI7QUFBQSxFQUVBLFNBQWU7QUFDYixVQUFNLEVBQUUsVUFBVSxJQUFJO0FBQ3RCLGNBQVUsU0FBUyxNQUFNLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUVwRCxRQUFJLHlCQUFRLFNBQVMsRUFBRSxRQUFRLE9BQU8sRUFBRSxRQUFRLENBQUMsU0FBd0I7QUFDdkUsV0FBSyxlQUFlLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxVQUFVO0FBQzVELGFBQUssUUFBUTtBQUFBLE1BQ2YsQ0FBQztBQUNELFdBQUssUUFBUSxpQkFBaUIsV0FBVyxDQUFDLE1BQXFCO0FBQzdELFlBQUksRUFBRSxRQUFRLFNBQVM7QUFDckIsZUFBSyxTQUFTO0FBQUEsUUFDaEI7QUFBQSxNQUNGLENBQUM7QUFDRCxpQkFBVyxNQUFNLEtBQUssUUFBUSxNQUFNLEdBQUcsRUFBRTtBQUFBLElBQzNDLENBQUM7QUFFRCxRQUFJLHlCQUFRLFNBQVMsRUFBRTtBQUFBLE1BQVUsQ0FBQyxRQUNoQyxJQUNHLGNBQWMsUUFBUSxFQUN0QixPQUFPLEVBQ1AsUUFBUSxNQUFNLEtBQUssU0FBUyxDQUFDO0FBQUEsSUFDbEM7QUFFQSxjQUFVLFNBQVMsT0FBTyxFQUFFLEtBQUssc0JBQXNCLE1BQU0sRUFBRSxJQUFJLHFCQUFxQixFQUFFLENBQUM7QUFBQSxFQUM3RjtBQUFBLEVBRUEsTUFBYyxXQUEwQjtBQUN0QyxRQUFJLENBQUMsS0FBSyxNQUFNLEtBQUs7QUFBRztBQUV4QixVQUFNLFlBQVksS0FBSyxVQUFVLGNBQWMscUJBQXFCO0FBQ3BFLFFBQUksQ0FBQztBQUFXO0FBQ2hCLGNBQVUsTUFBTTtBQUNoQixjQUFVLFNBQVMsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWhELFFBQUk7QUFDRixZQUFNLFNBQVMsTUFBTSxLQUFLLE9BQU8sY0FBYyxDQUFDLFVBQVUsS0FBSyxLQUFLLENBQUM7QUFDckUsZ0JBQVUsTUFBTTtBQUNoQixZQUFNLE1BQU0sVUFBVSxTQUFTLE9BQU8sRUFBRSxLQUFLLGlCQUFpQixDQUFDO0FBQy9ELFVBQUksU0FBUyxRQUFRLEVBQUUsTUFBTSxVQUFVLG1CQUFtQixDQUFDO0FBQUEsSUFDN0QsU0FBUyxHQUFZO0FBQ25CLFlBQU0sTUFBTTtBQUNaLGdCQUFVLE1BQU07QUFDaEIsZ0JBQVUsU0FBUyxLQUFLLEVBQUUsTUFBTSxVQUFVLElBQUksT0FBTyxJQUFJLEtBQUssWUFBWSxDQUFDO0FBQUEsSUFDN0U7QUFBQSxFQUNGO0FBQUEsRUFFQSxVQUFnQjtBQUNkLFNBQUssVUFBVSxNQUFNO0FBQUEsRUFDdkI7QUFDRjtBQUVBLElBQU0sa0JBQU4sY0FBOEIsdUJBQU07QUFBQSxFQU1sQyxZQUFZLEtBQVUsUUFBbUI7QUFDdkMsVUFBTSxHQUFHO0FBTFgsU0FBUSxXQUFtQjtBQUMzQixTQUFRLGVBQXVCO0FBQy9CLFNBQVEsa0JBQTBCO0FBSWhDLFNBQUssU0FBUztBQUFBLEVBQ2hCO0FBQUEsRUFFQSxTQUFlO0FBQ2IsVUFBTSxFQUFFLFVBQVUsSUFBSTtBQUN0QixjQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFcEQsUUFBSSx5QkFBUSxTQUFTLEVBQ2xCLFFBQVEsTUFBTSxFQUNkO0FBQUEsTUFBWSxDQUFDLFNBQ1osS0FDRyxVQUFVLFVBQVUsUUFBUSxFQUM1QixVQUFVLFVBQVUsUUFBUSxFQUM1QixVQUFVLFFBQVEsTUFBTSxFQUN4QixVQUFVLFVBQVUsUUFBUSxFQUM1QixVQUFVLFVBQVUsUUFBUSxFQUM1QixVQUFVLFlBQVksVUFBVSxFQUNoQyxTQUFTLEtBQUssUUFBUSxFQUN0QixTQUFTLENBQUMsTUFBTTtBQUFFLGFBQUssV0FBVztBQUFBLE1BQUcsQ0FBQztBQUFBLElBQzNDO0FBRUYsUUFBSSx5QkFBUSxTQUFTLEVBQ2xCLFFBQVEsVUFBVSxFQUNsQixRQUFRLDJCQUEyQixFQUNuQztBQUFBLE1BQVksQ0FBQyxTQUNaLEtBQ0csVUFBVSxLQUFLLGNBQWMsRUFDN0IsVUFBVSxLQUFLLFVBQVUsRUFDekIsVUFBVSxLQUFLLFlBQVksRUFDM0IsVUFBVSxLQUFLLFNBQVMsRUFDeEIsVUFBVSxLQUFLLGdCQUFnQixFQUMvQixTQUFTLEtBQUssWUFBWSxFQUMxQixTQUFTLENBQUMsTUFBTTtBQUFFLGFBQUssZUFBZTtBQUFBLE1BQUcsQ0FBQztBQUFBLElBQy9DO0FBRUYsUUFBSSx5QkFBUSxTQUFTLEVBQ2xCLFFBQVEsYUFBYSxFQUNyQjtBQUFBLE1BQVksQ0FBQyxTQUNaLEtBQ0csZUFBZSxzQkFBc0IsRUFDckMsU0FBUyxDQUFDLE1BQU07QUFBRSxhQUFLLGtCQUFrQjtBQUFBLE1BQUcsQ0FBQztBQUFBLElBQ2xEO0FBRUYsUUFBSSx5QkFBUSxTQUFTLEVBQUU7QUFBQSxNQUFVLENBQUMsUUFDaEMsSUFDRyxjQUFjLFFBQVEsRUFDdEIsT0FBTyxFQUNQLFFBQVEsWUFBWTtBQUNuQixjQUFNLEtBQUssV0FBVztBQUFBLE1BQ3hCLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBYyxhQUE0QjtBQUN4QyxRQUFJLENBQUMsS0FBSyxnQkFBZ0IsS0FBSyxHQUFHO0FBQ2hDLFVBQUksd0JBQU8sMkJBQTJCO0FBQ3RDO0FBQUEsSUFDRjtBQUNBLFFBQUk7QUFDRixZQUFNLFNBQVMsTUFBTSxLQUFLLE9BQU8sY0FBYztBQUFBLFFBQzdDO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBLEtBQUs7QUFBQSxRQUNMO0FBQUEsUUFDQSxLQUFLO0FBQUEsUUFDTDtBQUFBLFFBQ0EsS0FBSztBQUFBLE1BQ1AsQ0FBQztBQUNELFVBQUksd0JBQU8sY0FBYztBQUN6QixzQkFBZ0IsS0FBSyxLQUFLLGdCQUFnQixNQUFNO0FBQ2hELFdBQUssTUFBTTtBQUFBLElBQ2IsU0FBUyxHQUFZO0FBQ25CLFlBQU0sTUFBTTtBQUNaLFVBQUksd0JBQU8sV0FBVyxJQUFJLE9BQU8sRUFBRTtBQUFBLElBQ3JDO0FBQUEsRUFDRjtBQUFBLEVBRUEsVUFBZ0I7QUFDZCxTQUFLLFVBQVUsTUFBTTtBQUFBLEVBQ3ZCO0FBQ0Y7QUFFTyxTQUFTLGlCQUFpQixRQUF5QjtBQUN4RCxTQUFPLFdBQVc7QUFBQSxJQUNoQixJQUFJO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixVQUFVLFlBQVk7QUFDcEIsVUFBSTtBQUNGLGNBQU0sU0FBUyxNQUFNLE9BQU8sY0FBYyxDQUFDLFFBQVEsQ0FBQztBQUNwRCx3QkFBZ0IsT0FBTyxLQUFLLGNBQWMsTUFBTTtBQUFBLE1BQ2xELFNBQVMsR0FBWTtBQUNuQixjQUFNLE1BQU07QUFDWixZQUFJLHdCQUFPLHNCQUFzQixJQUFJLE9BQU8sRUFBRTtBQUFBLE1BQ2hEO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUVELFNBQU8sV0FBVztBQUFBLElBQ2hCLElBQUk7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLFVBQVUsWUFBWTtBQUNwQixVQUFJLHdCQUFPLHVCQUF1QjtBQUNsQyxVQUFJO0FBQ0YsY0FBTSxTQUFTLE1BQU0sT0FBTyxjQUFjLENBQUMsTUFBTSxDQUFDO0FBQ2xELHdCQUFnQixPQUFPLEtBQUssc0JBQXNCLE1BQU07QUFBQSxNQUMxRCxTQUFTLEdBQVk7QUFDbkIsY0FBTSxNQUFNO0FBQ1osWUFBSSx3QkFBTyxzQkFBc0IsSUFBSSxPQUFPLEVBQUU7QUFBQSxNQUNoRDtBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFFRCxTQUFPLFdBQVc7QUFBQSxJQUNoQixJQUFJO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixVQUFVLFlBQVk7QUFDcEIsWUFBTSxhQUFhLE9BQU8sSUFBSSxVQUFVLGNBQWM7QUFDdEQsVUFBSSxDQUFDLFlBQVk7QUFDZixZQUFJLHdCQUFPLGdCQUFnQjtBQUMzQjtBQUFBLE1BQ0Y7QUFDQSxZQUFNLFdBQVcsV0FBVztBQUM1QixVQUFJLHdCQUFPLGFBQWEsUUFBUSxLQUFLO0FBQ3JDLFVBQUk7QUFDRixjQUFNLFlBQVksT0FBTyxTQUFTO0FBQ2xDLGNBQU0sV0FBVyxZQUFZLEdBQUcsU0FBUyxJQUFJLFFBQVEsS0FBSztBQUMxRCxjQUFNLFNBQVMsTUFBTSxPQUFPLGNBQWMsQ0FBQyxVQUFVLFFBQVEsQ0FBQztBQUM5RCxZQUFJLHdCQUFPLG9CQUFvQjtBQUMvQix3QkFBZ0IsT0FBTyxLQUFLLGlCQUFpQixNQUFNO0FBQUEsTUFDckQsU0FBUyxHQUFZO0FBQ25CLGNBQU0sTUFBTTtBQUNaLFlBQUksd0JBQU8sa0JBQWtCLElBQUksT0FBTyxFQUFFO0FBQUEsTUFDNUM7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBRUQsU0FBTyxXQUFXO0FBQUEsSUFDaEIsSUFBSTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sVUFBVSxNQUFNO0FBQ2QsVUFBSSxZQUFZLE9BQU8sS0FBSyxNQUFNLEVBQUUsS0FBSztBQUFBLElBQzNDO0FBQUEsRUFDRixDQUFDO0FBRUQsU0FBTyxXQUFXO0FBQUEsSUFDaEIsSUFBSTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sVUFBVSxZQUFZO0FBQ3BCLFVBQUk7QUFDRixjQUFNLFNBQVMsTUFBTSxPQUFPLGNBQWMsQ0FBQyxPQUFPLENBQUM7QUFDbkQsd0JBQWdCLE9BQU8sS0FBSyxhQUFhLE1BQU07QUFBQSxNQUNqRCxTQUFTLEdBQVk7QUFDbkIsY0FBTSxNQUFNO0FBQ1osWUFBSSx3QkFBTyxzQkFBc0IsSUFBSSxPQUFPLEVBQUU7QUFBQSxNQUNoRDtBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFFRCxTQUFPLFdBQVc7QUFBQSxJQUNoQixJQUFJO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixVQUFVLE1BQU07QUFDZCxVQUFJLGdCQUFnQixPQUFPLEtBQUssTUFBTSxFQUFFLEtBQUs7QUFBQSxJQUMvQztBQUFBLEVBQ0YsQ0FBQztBQUVELFNBQU8sV0FBVztBQUFBLElBQ2hCLElBQUk7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLFVBQVUsWUFBWTtBQUNwQixVQUFJO0FBQ0YsY0FBTSxTQUFTLE1BQU0sT0FBTyxjQUFjLENBQUMsV0FBVyxDQUFDO0FBQ3ZELFlBQUksd0JBQU8sZ0JBQWdCO0FBQzNCLHdCQUFnQixPQUFPLEtBQUssYUFBYSxNQUFNO0FBQUEsTUFDakQsU0FBUyxHQUFZO0FBQ25CLGNBQU0sTUFBTTtBQUNaLFlBQUksd0JBQU8scUJBQXFCLElBQUksT0FBTyxFQUFFO0FBQUEsTUFDL0M7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBRUQsU0FBTyxXQUFXO0FBQUEsSUFDaEIsSUFBSTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sVUFBVSxZQUFZO0FBQ3BCLFVBQUksd0JBQU8sZ0NBQWdDO0FBQzNDLFVBQUk7QUFDRixjQUFNLFNBQVMsTUFBTSxPQUFPLGNBQWMsQ0FBQyxTQUFTLFlBQVksV0FBVyxNQUFNLENBQUM7QUFDbEYsd0JBQWdCLE9BQU8sS0FBSyxtQkFBbUIsTUFBTTtBQUFBLE1BQ3ZELFNBQVMsR0FBWTtBQUNuQixjQUFNLE1BQU07QUFDWixZQUFJLHdCQUFPLHdCQUF3QixJQUFJLE9BQU8sRUFBRTtBQUFBLE1BQ2xEO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUVELFNBQU8sV0FBVztBQUFBLElBQ2hCLElBQUk7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLFVBQVUsWUFBWTtBQUNwQixVQUFJLHdCQUFPLHlCQUF5QjtBQUNwQyxVQUFJO0FBQ0YsY0FBTSxTQUFTLE1BQU0sT0FBTyxjQUFjLENBQUMsYUFBYSxDQUFDO0FBQ3pELFlBQUksd0JBQU8sbUJBQW1CO0FBQzlCLHdCQUFnQixPQUFPLEtBQUssZUFBZSxNQUFNO0FBQUEsTUFDbkQsU0FBUyxHQUFZO0FBQ25CLGNBQU0sTUFBTTtBQUNaLFlBQUksd0JBQU8sdUJBQXVCLElBQUksT0FBTyxFQUFFO0FBQUEsTUFDakQ7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBRUQsU0FBTyxXQUFXO0FBQUEsSUFDaEIsSUFBSTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sVUFBVSxZQUFZO0FBQ3BCLFVBQUksd0JBQU8sb0JBQW9CO0FBQy9CLFVBQUk7QUFDRixjQUFNLFNBQVMsTUFBTSxPQUFPLGNBQWMsQ0FBQyxTQUFTLFdBQVcsQ0FBQztBQUNoRSx3QkFBZ0IsT0FBTyxLQUFLLGlCQUFpQixNQUFNO0FBQUEsTUFDckQsU0FBUyxHQUFZO0FBQ25CLGNBQU0sTUFBTTtBQUNaLFlBQUksd0JBQU8sbUJBQW1CLElBQUksT0FBTyxFQUFFO0FBQUEsTUFDN0M7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBRUQsU0FBTyxXQUFXO0FBQUEsSUFDaEIsSUFBSTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sVUFBVSxNQUFNO0FBQ2QsVUFBSSxrQkFBa0IsT0FBTyxLQUFLLE1BQU0sRUFBRSxLQUFLO0FBQUEsSUFDakQ7QUFBQSxFQUNGLENBQUM7QUFFRCxTQUFPLFdBQVc7QUFBQSxJQUNoQixJQUFJO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixVQUFVLE1BQU07QUFDZCxVQUFJLGNBQWMsT0FBTyxLQUFLLE1BQU0sRUFBRSxLQUFLO0FBQUEsSUFDN0M7QUFBQSxFQUNGLENBQUM7QUFFRCxTQUFPLFdBQVc7QUFBQSxJQUNoQixJQUFJO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixVQUFVLE1BQU07QUFDZCxVQUFJLGVBQWUsT0FBTyxLQUFLLE1BQU0sRUFBRSxLQUFLO0FBQUEsSUFDOUM7QUFBQSxFQUNGLENBQUM7QUFFRCxTQUFPLFdBQVc7QUFBQSxJQUNoQixJQUFJO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixVQUFVLE1BQU07QUFDZCxhQUFPLGFBQWEsaUJBQWlCO0FBQUEsSUFDdkM7QUFBQSxFQUNGLENBQUM7QUFFRCxTQUFPLFdBQVc7QUFBQSxJQUNoQixJQUFJO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixVQUFVLE1BQU07QUFDZCxhQUFPLGFBQWEsZUFBZTtBQUFBLElBQ3JDO0FBQUEsRUFDRixDQUFDO0FBRUQsU0FBTyxXQUFXO0FBQUEsSUFDaEIsSUFBSTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sVUFBVSxZQUFZO0FBQ3BCLFVBQUksd0JBQU8saUNBQWlDO0FBQzVDLFVBQUk7QUFDRixjQUFNLFNBQVMsTUFBTSxPQUFPLGNBQWMsQ0FBQyxZQUFZLE9BQU8sQ0FBQztBQUMvRCx3QkFBZ0IsT0FBTyxLQUFLLGlCQUFpQixNQUFNO0FBQUEsTUFDckQsU0FBUyxHQUFZO0FBQ25CLGNBQU0sTUFBTTtBQUNaLFlBQUksd0JBQU8saUJBQWlCLElBQUksT0FBTyxFQUFFO0FBQUEsTUFDM0M7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBRUQsU0FBTyxXQUFXO0FBQUEsSUFDaEIsSUFBSTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sVUFBVSxZQUFZO0FBQ3BCLFVBQUksd0JBQU8sNkJBQTZCO0FBQ3hDLFVBQUk7QUFDRixjQUFNLFNBQVMsTUFBTSxPQUFPLGNBQWMsQ0FBQyxZQUFZLFFBQVEsVUFBVSxHQUFHLENBQUM7QUFDN0Usd0JBQWdCLE9BQU8sS0FBSyx3QkFBd0IsTUFBTTtBQUFBLE1BQzVELFNBQVMsR0FBWTtBQUNuQixjQUFNLE1BQU07QUFDWixZQUFJLHdCQUFPLGdCQUFnQixJQUFJLE9BQU8sRUFBRTtBQUFBLE1BQzFDO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUNIOzs7QUZ0WUEsSUFBQUMsd0JBQThDO0FBQzlDLElBQUFDLGVBQTBCO0FBQzFCLElBQUFDLFFBQXNCO0FBQ3RCLElBQUFDLE1BQW9CO0FBRXBCLElBQU1DLHFCQUFnQix3QkFBVSw4QkFBUTtBQUV4QyxJQUFNLGFBQWE7QUFFbkIsSUFBTSxhQUFhO0FBRW5CLElBQXFCLFlBQXJCLGNBQXVDLHdCQUFPO0FBQUEsRUFBOUM7QUFBQTtBQUNFLG9CQUF3QjtBQUN4QixTQUFRLGdCQUFxQztBQUFBO0FBQUEsRUFFN0MsTUFBTSxTQUF3QjtBQUM1QixVQUFNLEtBQUssYUFBYTtBQUV4QixrQ0FBUSxhQUFhLFVBQVU7QUFDL0Isa0NBQVEsYUFBYSxVQUFVO0FBRS9CLFNBQUssYUFBYSxtQkFBbUIsQ0FBQyxTQUFTLElBQUksWUFBWSxNQUFNLElBQUksQ0FBQztBQUMxRSxTQUFLLGFBQWEsaUJBQWlCLENBQUMsU0FBUyxJQUFJLFVBQVUsTUFBTSxJQUFJLENBQUM7QUFFdEUsU0FBSyxjQUFjLElBQUksY0FBYyxLQUFLLEtBQUssSUFBSSxDQUFDO0FBRXBELFNBQUssY0FBYyxhQUFhLHNCQUFzQixNQUFNO0FBQzFELFdBQUssYUFBYSxpQkFBaUI7QUFBQSxJQUNyQyxDQUFDO0FBRUQsU0FBSyxjQUFjLGFBQWEsb0JBQW9CLE1BQU07QUFDeEQsV0FBSyxhQUFhLGVBQWU7QUFBQSxJQUNuQyxDQUFDO0FBRUQscUJBQWlCLElBQUk7QUFFckIsVUFBTSxLQUFLLHVCQUF1QjtBQUNsQyxVQUFNLEtBQUssZUFBZTtBQUMxQixVQUFNLEtBQUssWUFBWTtBQUFBLEVBQ3pCO0FBQUEsRUFFQSxXQUFpQjtBQUNmLFNBQUssV0FBVztBQUNoQixTQUFLLElBQUksVUFBVSxtQkFBbUIsaUJBQWlCO0FBQ3ZELFNBQUssSUFBSSxVQUFVLG1CQUFtQixlQUFlO0FBQUEsRUFDdkQ7QUFBQSxFQUVBLE1BQWMseUJBQXdDO0FBQ3BELFVBQU0sUUFBUSxLQUFLLElBQUk7QUFDdkIsVUFBTSxPQUFPO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxNQUFhO0FBQUEsTUFBbUI7QUFBQSxNQUFvQjtBQUFBLE1BQ3BEO0FBQUEsTUFBeUI7QUFBQSxNQUFvQjtBQUFBLE1BQzdDO0FBQUEsTUFDQTtBQUFBLE1BQW9CO0FBQUEsTUFBNkI7QUFBQSxNQUNqRDtBQUFBLE1BQW9DO0FBQUEsTUFDcEM7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQW9CO0FBQUEsTUFBOEI7QUFBQSxNQUE2QjtBQUFBLE1BQy9FO0FBQUEsTUFBNEI7QUFBQSxNQUM1QjtBQUFBLE1BQTRDO0FBQUEsTUFDNUM7QUFBQSxNQUFxQztBQUFBLE1BQ3JDO0FBQUEsTUFDQTtBQUFBLE1BQWlDO0FBQUEsTUFDakM7QUFBQSxNQUE2QztBQUFBLE1BQzdDO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUFnQjtBQUFBLE1BQXlCO0FBQUEsTUFBNkI7QUFBQSxNQUN0RTtBQUFBLE1BQ0E7QUFBQSxNQUFVO0FBQUEsSUFDWjtBQUdBLFVBQU0sU0FBUyxNQUFNLHNCQUFzQixZQUFZO0FBQ3ZELFFBQUk7QUFBUTtBQUVaLGVBQVcsT0FBTyxNQUFNO0FBQ3RCLFVBQUk7QUFDRixjQUFNLE1BQU0sYUFBYSxHQUFHO0FBQUEsTUFDOUIsUUFBUTtBQUFBLE1BRVI7QUFBQSxJQUNGO0FBR0EsVUFBTSxRQUFrRDtBQUFBLE1BQ3REO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sU0FBUyw0Q0FBMkMsb0JBQUksS0FBSyxHQUFFLFlBQVksSUFBSTtBQUFBLE1BQ2pGO0FBQUEsSUFDRjtBQUVBLGVBQVcsUUFBUSxPQUFPO0FBQ3hCLFlBQU0sU0FBUyxNQUFNLHNCQUFzQixLQUFLLElBQUk7QUFDcEQsVUFBSSxDQUFDLFFBQVE7QUFDWCxZQUFJO0FBQ0YsZ0JBQU0sTUFBTSxPQUFPLEtBQUssTUFBTSxLQUFLLE9BQU87QUFBQSxRQUM1QyxRQUFRO0FBQUEsUUFFUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsUUFBSSx3QkFBTyxxRUFBcUU7QUFBQSxFQUNsRjtBQUFBLEVBRUEsTUFBYyxjQUE2QjtBQUN6QyxVQUFNLFVBQVUsS0FBSyxrQkFBa0I7QUFDdkMsVUFBTSxPQUFPLEtBQUssU0FBUyxpQkFBaUI7QUFFNUMsVUFBTSxNQUE4QixFQUFFLEdBQUcsUUFBUSxJQUE4QjtBQUMvRSxRQUFJLEtBQUssU0FBUyxTQUFTO0FBQ3pCLFVBQUksVUFBVSxJQUFJLEtBQUssU0FBUztBQUFBLElBQ2xDO0FBR0EsVUFBTSxjQUFjLEtBQUssU0FBUyxVQUN6QixXQUFLLEtBQUssU0FBUyxTQUFTLFdBQVcsTUFBTSxJQUNsRDtBQUNKLFFBQUksUUFBUTtBQUNaLFFBQUksZUFBa0IsZUFBVyxXQUFXLEdBQUc7QUFDN0MsWUFBTSxVQUFhLGlCQUFhLGFBQWEsT0FBTztBQUNwRCxZQUFNLFFBQVEsUUFBUSxNQUFNLG9CQUFvQjtBQUNoRCxVQUFJO0FBQU8sZ0JBQVEsTUFBTSxDQUFDLEVBQUUsS0FBSztBQUFBLElBQ25DO0FBRUEsVUFBTSxPQUFPLENBQUMsU0FBUyxVQUFVLE9BQU8sSUFBSSxDQUFDO0FBQzdDLFFBQUksT0FBTztBQUNULFdBQUssS0FBSyxXQUFXLEtBQUs7QUFBQSxJQUM1QixPQUFPO0FBQ0wsV0FBSyxLQUFLLFdBQVcsTUFBTTtBQUFBLElBQzdCO0FBRUEsUUFBSTtBQUNGLFdBQUssb0JBQWdCLDZCQUFNLFNBQVMsTUFBTTtBQUFBLFFBQ3hDO0FBQUEsUUFDQSxLQUFLLEtBQUssU0FBUyxXQUFXO0FBQUEsUUFDOUIsT0FBTyxDQUFDLFVBQVUsUUFBUSxNQUFNO0FBQUEsTUFDbEMsQ0FBQztBQUVELFdBQUssY0FBYyxHQUFHLFNBQVMsTUFBTTtBQUVuQyxhQUFLLGdCQUFnQjtBQUFBLE1BQ3ZCLENBQUM7QUFFRCxXQUFLLGNBQWMsR0FBRyxRQUFRLE1BQU07QUFDbEMsYUFBSyxnQkFBZ0I7QUFBQSxNQUN2QixDQUFDO0FBR0QsWUFBTSxJQUFJLFFBQVEsQ0FBQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDNUMsVUFBSSxLQUFLLGVBQWU7QUFDdEIsWUFBSTtBQUNGLGdCQUFNLE9BQU8sTUFBTSxNQUFNLG9CQUFvQixJQUFJLFNBQVM7QUFDMUQsY0FBSSxLQUFLLElBQUk7QUFDWCxnQkFBSSx3QkFBTyxxQ0FBcUMsSUFBSSxFQUFFO0FBQUEsVUFDeEQ7QUFBQSxRQUNGLFFBQVE7QUFBQSxRQUVSO0FBQUEsTUFDRjtBQUFBLElBQ0YsUUFBUTtBQUFBLElBRVI7QUFBQSxFQUNGO0FBQUEsRUFFUSxhQUFtQjtBQUN6QixRQUFJLEtBQUssZUFBZTtBQUN0QixXQUFLLGNBQWMsS0FBSztBQUN4QixXQUFLLGdCQUFnQjtBQUFBLElBQ3ZCO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBTSxlQUE4QjtBQUNsQyxVQUFNLE9BQU8sTUFBTSxLQUFLLFNBQVM7QUFDakMsU0FBSyxXQUFXLE9BQU8sT0FBTyxDQUFDLEdBQUcsa0JBQWtCLElBQUk7QUFDeEQsUUFBSSxDQUFDLEtBQUssU0FBUyxTQUFTO0FBQzFCLFdBQUssU0FBUyxVQUFVLEtBQUssY0FBYztBQUFBLElBQzdDO0FBQ0EsUUFBSSxDQUFDLEtBQUssU0FBUyxXQUFXO0FBQzVCLFdBQUssU0FBUyxZQUFZLEtBQUssZ0JBQWdCO0FBQUEsSUFDakQ7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNLGVBQThCO0FBQ2xDLFVBQU0sS0FBSyxTQUFTLEtBQUssUUFBUTtBQUFBLEVBQ25DO0FBQUEsRUFFQSxnQkFBd0I7QUFDdEIsVUFBTSxZQUFZLEtBQUssZ0JBQWdCO0FBQ3ZDLFFBQUksV0FBVztBQUNiLFlBQU0sWUFBaUIsY0FBUSxXQUFXLElBQUk7QUFDOUMsVUFBTyxlQUFnQixXQUFLLFdBQVcsVUFBVSxlQUFlLENBQUMsR0FBRztBQUNsRSxlQUFPO0FBQUEsTUFDVDtBQUNBLFVBQU8sZUFBZ0IsV0FBSyxXQUFXLFVBQVUsZUFBZSxDQUFDLEdBQUc7QUFDbEUsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQ0EsVUFBTSxPQUFPLFFBQVEsSUFBSSxRQUFRLFFBQVEsSUFBSSxlQUFlO0FBQzVELFVBQU0sY0FBbUIsV0FBSyxNQUFNLFdBQVcsa0JBQWtCLHNCQUFzQjtBQUN2RixRQUFPLGVBQVcsV0FBVyxHQUFHO0FBQzlCLGFBQU87QUFBQSxJQUNUO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUVBLGtCQUEwQjtBQUN4QixVQUFNLFVBQVUsS0FBSyxJQUFJLE1BQU07QUFDL0IsUUFBSSxpQkFBaUIsV0FBVyxPQUFPLFFBQVEsZ0JBQWdCLFlBQVk7QUFDekUsYUFBUSxRQUFzQyxZQUFZO0FBQUEsSUFDNUQ7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsb0JBQTRCO0FBRTFCLFVBQU0sYUFBYSxLQUFLLFNBQVM7QUFDakMsUUFBSSxjQUFjLGVBQWUsZ0JBQW1CLGVBQVcsVUFBVSxHQUFHO0FBQzFFLGFBQU87QUFBQSxJQUNUO0FBRUEsVUFBTSxhQUFhO0FBQUEsTUFDakI7QUFBQSxNQUNLLFdBQUssUUFBUSxJQUFJLFFBQVEsSUFBSSx1QkFBdUI7QUFBQSxNQUN6RCxLQUFLLFNBQVMsVUFBZSxXQUFLLEtBQUssU0FBUyxTQUFTLGtDQUFrQyxJQUFJO0FBQUEsTUFDL0Y7QUFBQSxJQUNGLEVBQUUsT0FBTyxPQUFPO0FBQ2hCLGVBQVcsS0FBSyxZQUFZO0FBQzFCLFVBQU8sZUFBVyxDQUFDO0FBQUcsZUFBTztBQUFBLElBQy9CO0FBQ0EsV0FBTyxjQUFjO0FBQUEsRUFDdkI7QUFBQSxFQUVBLE1BQU0saUJBQWdDO0FBQ3BDLFVBQU0sVUFBVSxLQUFLLGtCQUFrQjtBQUN2QyxRQUFJO0FBQ0YsWUFBTUEsZUFBYyxTQUFTLENBQUMsV0FBVyxDQUFDO0FBQUEsSUFDNUMsUUFBUTtBQUNOLFVBQUk7QUFBQSxRQUNGLGtDQUFrQyxPQUFPO0FBQUEsUUFDekM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQU0sY0FBYyxNQUFpQztBQUNuRCxVQUFNLFVBQVUsS0FBSyxrQkFBa0I7QUFDdkMsVUFBTSxNQUE4QixFQUFFLEdBQUcsUUFBUSxJQUE4QjtBQUMvRSxRQUFJLEtBQUssU0FBUyxTQUFTO0FBQ3pCLFVBQUksVUFBVSxJQUFJLEtBQUssU0FBUztBQUFBLElBQ2xDO0FBQ0EsUUFBSTtBQUNGLFlBQU0sRUFBRSxRQUFRLE9BQU8sSUFBSSxNQUFNQSxlQUFjLFNBQVMsTUFBTTtBQUFBLFFBQzVELEtBQUssS0FBSyxTQUFTLFdBQVc7QUFBQSxRQUM5QjtBQUFBLFFBQ0EsU0FBUztBQUFBLE1BQ1gsQ0FBQztBQUNELFVBQUksVUFBVSxDQUFDO0FBQVEsZUFBTztBQUM5QixhQUFPO0FBQUEsSUFDVCxTQUFTLEdBQVk7QUFDbkIsWUFBTSxNQUFNO0FBQ1osWUFBTSxJQUFJLE1BQU0sSUFBSSxVQUFVLElBQUksV0FBVyxlQUFlO0FBQUEsSUFDOUQ7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNLGFBQWEsVUFBaUM7QUFDbEQsVUFBTSxXQUFXLEtBQUssSUFBSSxVQUFVLGdCQUFnQixRQUFRO0FBQzVELFFBQUksU0FBUyxTQUFTLEdBQUc7QUFDdkIsV0FBSyxJQUFJLFVBQVUsV0FBVyxTQUFTLENBQUMsQ0FBQztBQUN6QztBQUFBLElBQ0Y7QUFDQSxVQUFNLE9BQXNCLEtBQUssSUFBSSxVQUFVLGFBQWEsS0FBSztBQUNqRSxVQUFNLEtBQUssYUFBYSxFQUFFLE1BQU0sVUFBVSxRQUFRLEtBQUssQ0FBQztBQUN4RCxTQUFLLElBQUksVUFBVSxXQUFXLElBQUk7QUFBQSxFQUNwQztBQUNGOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJmcyIsICJwYXRoIiwgImltcG9ydF9vYnNpZGlhbiIsICJmcyIsICJwYXRoIiwgImltcG9ydF9vYnNpZGlhbiIsICJmcyIsICJwYXRoIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiZnMiLCAicGF0aCIsICJpbXBvcnRfY2hpbGRfcHJvY2VzcyIsICJpbXBvcnRfdXRpbCIsICJwYXRoIiwgImZzIiwgImV4ZWNGaWxlQXN5bmMiXQp9Cg==
