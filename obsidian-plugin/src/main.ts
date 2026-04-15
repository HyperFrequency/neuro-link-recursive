import {
  Plugin,
  Notice,
  WorkspaceLeaf,
  addIcon,
} from "obsidian";
import { NLRSettingTab, NLRSettings, DEFAULT_SETTINGS } from "./settings";
import { registerCommands } from "./commands";
import { ChatbotView, VIEW_TYPE_CHATBOT } from "./chatbot";
import { StatsView, VIEW_TYPE_STATS } from "./stats";
import { execFile } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";

const execFileAsync = promisify(execFile);

const BRAIN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/><path d="M9 21h6"/><path d="M10 17v4"/><path d="M14 17v4"/><path d="M8 14c-1.5-1-2.5-2.7-2.5-5"/><path d="M16 14c1.5-1 2.5-2.7 2.5-5"/></svg>`;

const CHART_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/><line x1="3" y1="21" x2="21" y2="21"/></svg>`;

export default class NLRPlugin extends Plugin {
  settings: NLRSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    addIcon("nlr-brain", BRAIN_ICON);
    addIcon("nlr-chart", CHART_ICON);

    this.registerView(VIEW_TYPE_CHATBOT, (leaf) => new ChatbotView(leaf, this));
    this.registerView(VIEW_TYPE_STATS, (leaf) => new StatsView(leaf, this));

    this.addSettingTab(new NLRSettingTab(this.app, this));

    this.addRibbonIcon("nlr-brain", "NLR Chatbot", () => {
      this.activateView(VIEW_TYPE_CHATBOT);
    });

    this.addRibbonIcon("nlr-chart", "NLR Stats", () => {
      this.activateView(VIEW_TYPE_STATS);
    });

    registerCommands(this);

    await this.checkNlrBinary();
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_CHATBOT);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_STATS);
  }

  async loadSettings(): Promise<void> {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    if (!this.settings.nlrRoot) {
      this.settings.nlrRoot = this.detectNlrRoot();
    }
    if (!this.settings.vaultPath) {
      this.settings.vaultPath = this.detectVaultPath();
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  detectNlrRoot(): string {
    const vaultPath = this.detectVaultPath();
    if (vaultPath) {
      const candidate = path.resolve(vaultPath, "..");
      if (fs.existsSync(path.join(candidate, "config", "neuro-link.md"))) {
        return candidate;
      }
      if (fs.existsSync(path.join(vaultPath, "config", "neuro-link.md"))) {
        return vaultPath;
      }
    }
    const home = process.env.HOME || process.env.USERPROFILE || "";
    const defaultPath = path.join(home, "Desktop", "HyperFrequency", "neuro-link-recursive");
    if (fs.existsSync(defaultPath)) {
      return defaultPath;
    }
    return "";
  }

  detectVaultPath(): string {
    const adapter = this.app.vault.adapter;
    if ("getBasePath" in adapter && typeof adapter.getBasePath === "function") {
      return (adapter as { getBasePath(): string }).getBasePath();
    }
    return "";
  }

  async checkNlrBinary(): Promise<void> {
    const binPath = this.settings.nlrBinaryPath || "nlr";
    try {
      await execFileAsync(binPath, ["--version"]);
    } catch {
      new Notice(
        "NLR binary not found. Configure the path in Settings > Neuro-Link Recursive, or install via: cargo install neuro-link-mcp",
        10000
      );
    }
  }

  async runNlrCommand(args: string[]): Promise<string> {
    const binPath = this.settings.nlrBinaryPath || "nlr";
    const env: Record<string, string> = { ...process.env as Record<string, string> };
    if (this.settings.nlrRoot) {
      env["NLR_ROOT"] = this.settings.nlrRoot;
    }
    try {
      const { stdout, stderr } = await execFileAsync(binPath, args, {
        cwd: this.settings.nlrRoot || undefined,
        env,
        timeout: 30000,
      });
      if (stderr && !stdout) return stderr;
      return stdout;
    } catch (e: unknown) {
      const err = e as { stderr?: string; message?: string };
      throw new Error(err.stderr || err.message || "Unknown error");
    }
  }

  async activateView(viewType: string): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(viewType);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf: WorkspaceLeaf = this.app.workspace.getRightLeaf(false)!;
    await leaf.setViewState({ type: viewType, active: true });
    this.app.workspace.revealLeaf(leaf);
  }
}
