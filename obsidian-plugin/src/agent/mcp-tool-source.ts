// SPDX-License-Identifier: MIT
//
// Clean-room. Not adapted from obsidian-copilot.
//
// McpToolSource bridges the `@neuro` agent and the plugin's MCP JSON-RPC
// connection. It lists tools for the manifest loader and dispatches tool
// calls from the chat-view executor. The transport is abstracted so tests
// can substitute a fake without spinning up a real VaultEventsClient.

export type McpToolSpec = {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
};

export interface McpTransport {
  listTools(): Promise<McpToolSpec[]>;
  callTool(name: string, args: unknown): Promise<unknown>;
}

export interface McpToolSourceOptions {
  transport: McpTransport;
  /** Tool-name prefixes that pass the filter. Default: tv_ + nlr_. */
  allowedPrefixes?: readonly string[];
}

const DEFAULT_ALLOWED_PREFIXES = Object.freeze(["tv_", "nlr_"]);

export class McpToolSource {
  private transport: McpTransport;
  private allowedPrefixes: readonly string[];

  constructor(opts: McpToolSourceOptions) {
    this.transport = opts.transport;
    this.allowedPrefixes =
      opts.allowedPrefixes && opts.allowedPrefixes.length > 0
        ? opts.allowedPrefixes
        : DEFAULT_ALLOWED_PREFIXES;
  }

  async listTools(): Promise<McpToolSpec[]> {
    const raw = await this.transport.listTools();
    return raw.filter((t) => this.isAllowed(t.name));
  }

  /**
   * Throws if `name` is outside the allowed namespace — prevents the model
   * from tricking the executor into invoking an arbitrary JSON-RPC method
   * via a hallucinated tool name.
   */
  async call(name: string, args: unknown): Promise<unknown> {
    if (!this.isAllowed(name)) {
      throw new Error(
        `Tool '${name}' is not in the allowed MCP namespace ` +
          `(prefixes: ${this.allowedPrefixes.join(", ")}).`
      );
    }
    return this.transport.callTool(name, args);
  }

  private isAllowed(name: string): boolean {
    return this.allowedPrefixes.some((p) => name.startsWith(p));
  }
}
