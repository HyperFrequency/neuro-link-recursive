/**
 * TurboVault MCP subscription client.
 *
 * Connects to TurboVault over WebSocket, calls `tv_subscribe_vault_events`
 * with a glob filter at plugin load, and dispatches the resulting
 * `notifications/vault/event` stream to a handler the plugin provides.
 *
 * Reconnection: exponential backoff capped at 30s. Aborted cleanly via the
 * plugin's lifetime AbortController (see main.ts).
 *
 * Note: the upstream tool (`tv_subscribe_vault_events`) is being added in a
 * parallel Rust-side agent (Phase 4A of the plan). If the server doesn't
 * yet advertise the tool, we log a warning, enter a dormant state, and
 * retry on reconnect — rather than bringing down plugin load.
 */

import { Notice } from "obsidian";
import type NLRPlugin from "./main";
import * as fs from "fs";
import * as path from "path";

export type VaultEventKind =
  | "FileCreated"
  | "FileModified"
  | "FileDeleted"
  | "FileRenamed";

export interface VaultEvent {
  kind: VaultEventKind;
  path: string;
  /** Present on FileRenamed. */
  oldPath?: string;
  /** Optional epoch ms from the server. */
  timestamp?: number;
}

type EventHandler = (event: VaultEvent) => void | Promise<void>;

interface JSONRPCMessage {
  jsonrpc: "2.0";
  id?: number | string;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

export class VaultSubscriptionClient {
  private plugin: NLRPlugin;
  private handler: EventHandler;
  private ws: WebSocket | null = null;
  private backoffMs = INITIAL_BACKOFF_MS;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingRequests = new Map<
    number,
    { resolve: (v: unknown) => void; reject: (e: Error) => void }
  >();
  private nextRequestId = 1;
  /** Subscription handle returned by the server (used for unsubscribe). */
  private subscriptionHandle: string | null = null;
  private stopped = false;

  constructor(plugin: NLRPlugin, handler: EventHandler) {
    this.plugin = plugin;
    this.handler = handler;
    // Tie into plugin lifetime so unload stops reconnect attempts.
    plugin.lifetimeSignal.addEventListener("abort", () => this.disconnect(), { once: true });
  }

  async connect(): Promise<void> {
    if (this.stopped) return;
    const url = this.resolveWsUrl();
    const token = this.readBearerToken();

    // Browsers don't support per-connection headers on WebSocket; we have
    // to smuggle the token via subprotocol (Caddy forwards it) or query
    // param. TurboVault accepts `?token=<t>` per the existing /mcp HTTP
    // bearer pattern. We use both — Caddy validates the header-like
    // subprotocol when configured, and the query string is the fallback.
    const withToken = token ? `${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}` : url;
    const protocols = token ? [`bearer.${token}`] : undefined;

    try {
      this.ws = new WebSocket(withToken, protocols);
    } catch (e) {
      const err = e as Error;
      console.warn(`NLR subscription: WebSocket construction failed: ${err.message}`);
      this.scheduleReconnect();
      return;
    }

    this.ws.addEventListener("open", () => this.onOpen());
    this.ws.addEventListener("message", (ev) => this.onMessage(ev));
    this.ws.addEventListener("close", (ev) => this.onClose(ev));
    this.ws.addEventListener("error", () => {
      // Close event fires right after — we handle the reconnect there.
    });
  }

  disconnect(): void {
    this.stopped = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    // Best-effort unsubscribe; swallow errors, we're tearing down.
    if (this.ws?.readyState === WebSocket.OPEN && this.subscriptionHandle) {
      try {
        this.send({
          jsonrpc: "2.0",
          id: this.nextRequestId++,
          method: "tools/call",
          params: {
            name: "tv_unsubscribe_vault_events",
            arguments: { subscription_id: this.subscriptionHandle },
          },
        });
      } catch {
        /* ignore */
      }
    }
    this.subscriptionHandle = null;
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        /* already closed */
      }
      this.ws = null;
    }
    // Reject any pending requests so callers don't hang.
    for (const { reject } of this.pendingRequests.values()) {
      reject(new Error("subscription client disconnecting"));
    }
    this.pendingRequests.clear();
  }

  private async onOpen(): Promise<void> {
    // Reset backoff on successful reconnection.
    this.backoffMs = INITIAL_BACKOFF_MS;

    try {
      // MCP handshake. The WebSocket transport TurboVault exposes is
      // JSON-RPC 2.0 — same shape as HTTP MCP. We do the minimal
      // initialize dance first.
      await this.rpc("initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "nlr-obsidian-plugin", version: "0.2.0" },
      });

      const result = (await this.rpc("tools/call", {
        name: "tv_subscribe_vault_events",
        arguments: {
          filter: {
            globs: [this.plugin.settings.dispatcher.watchGlob],
            kinds: ["FileCreated"],
          },
        },
      })) as { subscription_id?: string; content?: Array<{ text?: string }> };

      // Accept either a direct object or a `content: [{text: "..."}]`
      // envelope (MCP tools/call returns a text block by spec; TurboVault
      // may wrap JSON inside it).
      this.subscriptionHandle = extractSubscriptionId(result);
      if (!this.subscriptionHandle) {
        console.warn("NLR subscription: tv_subscribe_vault_events returned no subscription_id — running dormant");
      }
    } catch (e) {
      const err = e as { message?: string; code?: number };
      // Method-not-found (or tool-not-registered) means TurboVault MCP side
      // isn't ready yet. Keep the connection alive; reconnect won't help,
      // but a manual reload will once the server is updated.
      console.warn(`NLR subscription: subscribe failed — ${err.message ?? "unknown"}`);
      if (err.code !== -32601) {
        // Anything other than method-not-found warrants reconnect.
        this.scheduleReconnect();
      }
    }
  }

  private onMessage(ev: MessageEvent): void {
    let msg: JSONRPCMessage;
    try {
      const raw = typeof ev.data === "string" ? ev.data : new TextDecoder().decode(ev.data as ArrayBuffer);
      msg = JSON.parse(raw) as JSONRPCMessage;
    } catch (e) {
      console.warn("NLR subscription: malformed frame", e);
      return;
    }

    // Response to a pending request.
    if (typeof msg.id === "number" && (msg.result !== undefined || msg.error)) {
      const pending = this.pendingRequests.get(msg.id);
      if (!pending) return;
      this.pendingRequests.delete(msg.id);
      if (msg.error) {
        const err = new Error(msg.error.message) as Error & { code?: number };
        err.code = msg.error.code;
        pending.reject(err);
      } else {
        pending.resolve(msg.result);
      }
      return;
    }

    // Server notification. We care about notifications/vault/event only.
    if (msg.method === "notifications/vault/event" && msg.params) {
      const event = normaliseVaultEvent(msg.params);
      if (!event) return;
      Promise.resolve(this.handler(event)).catch((e: unknown) => {
        const err = e as Error;
        console.warn("NLR subscription: handler error", err.message);
      });
    }
  }

  private onClose(_ev: CloseEvent): void {
    this.ws = null;
    for (const { reject } of this.pendingRequests.values()) {
      reject(new Error("websocket closed"));
    }
    this.pendingRequests.clear();
    if (!this.stopped) this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.stopped) return;
    if (this.reconnectTimer) return;
    const delay = this.backoffMs;
    this.backoffMs = Math.min(MAX_BACKOFF_MS, this.backoffMs * 2);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(() => this.scheduleReconnect());
    }, delay);
  }

  private rpc(method: string, params: unknown): Promise<unknown> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error("websocket not open"));
    }
    const id = this.nextRequestId++;
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      try {
        this.send({ jsonrpc: "2.0", id, method, params });
      } catch (e) {
        this.pendingRequests.delete(id);
        reject(e as Error);
      }
    });
  }

  private send(msg: JSONRPCMessage): void {
    if (!this.ws) throw new Error("websocket not open");
    this.ws.send(JSON.stringify(msg));
  }

  private resolveWsUrl(): string {
    const configured = this.plugin.settings.subscription.wsUrl;
    if (configured) return configured;
    const port = this.plugin.settings.apiRouterPort || 8080;
    return `ws://localhost:${port}/mcp/ws`;
  }

  private readBearerToken(): string {
    // Reuse the existing bearer-token pattern from mcp-setup.ts:161-172.
    // Source of truth is secrets/.env — same unified NLR_API_TOKEN.
    const nlrRoot = this.plugin.settings.nlrRoot;
    if (!nlrRoot) return "";
    try {
      const envPath = path.join(nlrRoot, "secrets", ".env");
      if (!fs.existsSync(envPath)) return "";
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/NLR_API_TOKEN=(.+)/);
      return match ? match[1].trim() : "";
    } catch {
      return "";
    }
  }
}

// ── helpers (exported for tests) ──

export function extractSubscriptionId(result: unknown): string | null {
  if (!result || typeof result !== "object") return null;
  const direct = (result as { subscription_id?: unknown }).subscription_id;
  if (typeof direct === "string") return direct;

  // MCP envelope: { content: [{ type: "text", text: "<json>" }] }
  const content = (result as { content?: Array<{ text?: string }> }).content;
  if (Array.isArray(content)) {
    for (const block of content) {
      if (typeof block?.text === "string") {
        try {
          const parsed = JSON.parse(block.text) as { subscription_id?: unknown };
          if (typeof parsed.subscription_id === "string") return parsed.subscription_id;
        } catch {
          /* not JSON — try next block */
        }
      }
    }
  }
  return null;
}

export function normaliseVaultEvent(raw: unknown): VaultEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const kind = obj.kind ?? obj.event_kind ?? obj.type;
  const path = obj.path ?? obj.file_path;
  if (typeof kind !== "string" || typeof path !== "string") return null;
  if (kind !== "FileCreated" && kind !== "FileModified" && kind !== "FileDeleted" && kind !== "FileRenamed") {
    return null;
  }
  const evt: VaultEvent = { kind, path };
  const oldPath = obj.old_path ?? obj.oldPath;
  if (typeof oldPath === "string") evt.oldPath = oldPath;
  const ts = obj.timestamp;
  if (typeof ts === "number") evt.timestamp = ts;
  return evt;
}
