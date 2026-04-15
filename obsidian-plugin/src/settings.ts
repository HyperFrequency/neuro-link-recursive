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

const API_KEY_DEFS: Array<{ key: string; label: string; desc: string }> = [
  { key: "INFRANODUS_API_KEY", label: "InfraNodus API Key", desc: "Knowledge graph & gap analysis via mcporter" },
  { key: "FIRECRAWL_API_KEY", label: "Firecrawl API Key", desc: "Web scraping for crawl-ingest pipeline" },
  { key: "CONTEXT7_API_KEY", label: "Context7 API Key", desc: "Upstream code docs and API signatures" },
  { key: "OPENROUTER_API_KEY", label: "OpenRouter API Key", desc: "LLM routing for BYOK chatbot and harnesses" },
  { key: "QDRANT_URL", label: "Qdrant URL", desc: "Vector database endpoint (default: http://localhost:6333)" },
  { key: "NEO4J_URI", label: "Neo4j URI", desc: "Graph database (default: bolt://localhost:7687)" },
  { key: "NGROK_AUTH_TOKEN", label: "Ngrok Auth Token", desc: "Tunnel for remote harness access" },
  { key: "KDENSE_API_KEY", label: "K-Dense API Key", desc: "K-Dense BYOK research harness" },
  { key: "MODAL_TOKEN_ID", label: "Modal Token ID", desc: "Modal cloud dispatch token" },
];

export const DEFAULT_SETTINGS: NLRSettings = {
  nlrRoot: "",
  nlrBinaryPath: "nlr",
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
      .setName("NLR Binary Path")
      .setDesc("Path to the nlr CLI binary")
      .addText((text) =>
        text
          .setPlaceholder("nlr")
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

  private renderApiKeysSection(containerEl: HTMLElement): void {
    containerEl.createEl("h2", { text: "API Keys" });

    const keyInputs: Record<string, TextComponent> = {};

    for (const def of API_KEY_DEFS) {
      const setting = new Setting(containerEl)
        .setName(def.label)
        .setDesc(def.desc);

      setting.addText((text) => {
        keyInputs[def.key] = text;
        text
          .setPlaceholder(def.key)
          .setValue(this.plugin.settings.apiKeys[def.key] || "")
          .inputEl.type = "password";
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
      .setDesc("Path to mcp2cli-rs profile JSON")
      .addText((text) =>
        text
          .setPlaceholder("mcp2cli-profile.json")
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
      .setDesc("Custom Ngrok domain for remote access")
      .addText((text) =>
        text
          .setPlaceholder("your-domain.ngrok-free.app")
          .setValue(this.plugin.settings.ngrokDomain)
          .onChange(async (value) => {
            this.plugin.settings.ngrokDomain = value;
            await this.plugin.saveSettings();
          })
      );
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
    if (!value) {
      new Notice(`${keyName} is not set`);
      return;
    }

    try {
      switch (keyName) {
        case "QDRANT_URL":
          await this.testHttpEndpoint(value, "Qdrant");
          break;
        case "NEO4J_URI":
          new Notice(`Neo4j URI set: ${value.replace(/\/\/.*@/, "//***@")}`);
          break;
        case "OPENROUTER_API_KEY":
          await this.testOpenRouter(value);
          break;
        case "INFRANODUS_API_KEY":
          await this.testInfraNodus(value);
          break;
        default:
          new Notice(`${keyName} saved (no live test available)`);
      }
    } catch (e: unknown) {
      const err = e as Error;
      new Notice(`${keyName} test failed: ${err.message}`);
    }
  }

  private async testHttpEndpoint(url: string, name: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (response.ok) {
        new Notice(`${name} connection OK (${response.status})`);
      } else {
        new Notice(`${name} responded with ${response.status}`);
      }
    } catch (e: unknown) {
      const err = e as Error;
      new Notice(`${name} unreachable: ${err.message}`);
    }
  }

  private async testOpenRouter(key: string): Promise<void> {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (response.ok) {
      new Notice("OpenRouter connection OK");
    } else {
      new Notice(`OpenRouter responded with ${response.status}`);
    }
  }

  private async testInfraNodus(key: string): Promise<void> {
    const response = await fetch("https://infranodus.com/api/v1/status", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (response.ok) {
      new Notice("InfraNodus connection OK");
    } else {
      new Notice(`InfraNodus responded with ${response.status}`);
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
