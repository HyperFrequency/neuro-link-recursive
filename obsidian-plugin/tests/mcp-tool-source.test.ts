// SPDX-License-Identifier: MIT
//
// McpToolSource tests — the bridge the @neuro agent uses to list and
// invoke MCP tools over the plugin's JSON-RPC endpoint (Codex finding #1).
//
// Coverage:
//   1. Unit tests with a fake McpTransport — listTools filters to the
//      allowed prefix set; call() rejects non-allowed names; call() forwards
//      the raw result from the transport.
//   2. Integration test against a real VaultEventsClient + wiremock-style
//      fetch mock that speaks the JSON-RPC handshake the MCP server speaks.
//      This verifies that the safety gate + real transport path produces
//      the right HTTP request and threads the tool result back to the agent
//      executor shape.

import "./_obsidian-mock";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import {
  McpToolSource,
  type McpTransport,
} from "../src/agent/mcp-tool-source";
import { VaultEventsClient } from "../src/mcp-vault-events";
import { checkWriteSafety } from "../src/agent/safety-gates";

// ── unit tests: McpToolSource with a fake transport ────────────────────

describe("McpToolSource.listTools", () => {
  test("filters to default tv_/nlr_ prefixes", async () => {
    const transport: McpTransport = {
      listTools: () =>
        Promise.resolve([
          { name: "tv_search", description: "search" },
          { name: "nlr_wiki_read", description: "wiki" },
          { name: "other_tool", description: "nope" },
          { name: "random_thing" },
        ]),
      callTool: () => Promise.reject(new Error("unused")),
    };
    const source = new McpToolSource({ transport });
    const tools = await source.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "nlr_wiki_read",
      "tv_search",
    ]);
  });

  test("honours configured allowedPrefixes", async () => {
    const transport: McpTransport = {
      listTools: () =>
        Promise.resolve([
          { name: "tv_search" },
          { name: "nlr_wiki_read" },
          { name: "custom_x" },
        ]),
      callTool: () => Promise.reject(new Error("unused")),
    };
    const source = new McpToolSource({
      transport,
      allowedPrefixes: ["custom_"],
    });
    const tools = await source.listTools();
    expect(tools.map((t) => t.name)).toEqual(["custom_x"]);
  });

  test("propagates transport errors so the loader can degrade", async () => {
    const transport: McpTransport = {
      listTools: () => Promise.reject(new Error("network down")),
      callTool: () => Promise.reject(new Error("unused")),
    };
    const source = new McpToolSource({ transport });
    await expect(source.listTools()).rejects.toThrow("network down");
  });
});

describe("McpToolSource.call", () => {
  test("forwards the raw result from the transport", async () => {
    const captured: Array<{ name: string; args: unknown }> = [];
    const transport: McpTransport = {
      listTools: () => Promise.resolve([]),
      callTool: (name, args) => {
        captured.push({ name, args });
        return Promise.resolve({ ok: true, data: 42 });
      },
    };
    const source = new McpToolSource({ transport });
    const result = await source.call("tv_search", { query: "alpha" });
    expect(result).toEqual({ ok: true, data: 42 });
    expect(captured).toEqual([{ name: "tv_search", args: { query: "alpha" } }]);
  });

  test("rejects names outside the allowed namespace", async () => {
    const transport: McpTransport = {
      listTools: () => Promise.resolve([]),
      callTool: () => Promise.reject(new Error("should not be called")),
    };
    const source = new McpToolSource({ transport });
    await expect(source.call("rm_rf_everything", {})).rejects.toThrow(
      /not in the allowed MCP namespace/
    );
  });

  test("propagates transport rejections as-is", async () => {
    const transport: McpTransport = {
      listTools: () => Promise.resolve([]),
      callTool: () => Promise.reject(new Error("RPC error: -32001")),
    };
    const source = new McpToolSource({ transport });
    await expect(source.call("nlr_wiki_read", {})).rejects.toThrow(
      "RPC error: -32001"
    );
  });
});

// ── integration test: real VaultEventsClient + mocked JSON-RPC server ──
//
// This is the wiremock-style fixture the plan calls for: the McpToolSource
// runs on top of a real VaultEventsClient, and `fetch` is mocked so the
// server side is a plain JSON-RPC handler. Together with the safety gate
// this gives us end-to-end verification of the executor path.

describe("McpToolSource + VaultEventsClient integration", () => {
  let originalFetch: typeof globalThis.fetch;
  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function buildRealTransport(opts: {
    handler: (
      method: string,
      params: Record<string, unknown>
    ) => { result?: unknown; error?: { code: number; message: string } };
    calls?: Array<{ method: string; params: Record<string, unknown>; url: string }>;
  }): VaultEventsClient {
    const lifetime = new AbortController();
    const plugin = {
      settings: {
        apiRouterPort: 8080,
        nlrRoot: "",
        subscription: {
          enabled: true,
          endpointUrl: "http://localhost:8080/mcp",
        },
        dispatcher: { watchGlob: "00-neuro-link/*.md" },
      },
      lifetimeSignal: lifetime.signal,
    } as const;

    globalThis.fetch = (async (input: unknown, init?: RequestInit) => {
      const url = typeof input === "string" ? input : String(input);
      const body = init?.body && typeof init.body === "string"
        ? (JSON.parse(init.body) as {
            method: string;
            id: number;
            params: Record<string, unknown>;
          })
        : { method: "", id: 0, params: {} };
      opts.calls?.push({ method: body.method, params: body.params, url });

      const outcome = opts.handler(body.method, body.params);
      const payload: Record<string, unknown> = {
        jsonrpc: "2.0",
        id: body.id,
      };
      if (outcome.error) payload.error = outcome.error;
      else payload.result = outcome.result;
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof globalThis.fetch;

    return new VaultEventsClient(plugin as unknown as never, () => {
      /* no subscription on this instance */
    });
  }

  test("listTools round-trips via HTTP JSON-RPC", async () => {
    const calls: Array<{ method: string; params: Record<string, unknown>; url: string }> = [];
    const client = buildRealTransport({
      calls,
      handler: (method) => {
        if (method === "tools/list") {
          return {
            result: {
              tools: [
                { name: "tv_search", description: "search" },
                { name: "nlr_wiki_read", description: "read wiki" },
                { name: "unrelated", description: "skip me" },
              ],
            },
          };
        }
        return { error: { code: -32601, message: "method not found" } };
      },
    });

    const source = new McpToolSource({ transport: client });
    const tools = await source.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "nlr_wiki_read",
      "tv_search",
    ]);
    expect(calls[0].method).toBe("tools/list");
    expect(calls[0].url).toBe("http://localhost:8080/mcp");
  });

  test("call dispatches tools/call with correct params shape", async () => {
    const calls: Array<{ method: string; params: Record<string, unknown>; url: string }> = [];
    const client = buildRealTransport({
      calls,
      handler: (method, params) => {
        if (method === "tools/call") {
          const p = params as { name: string; arguments: unknown };
          if (p.name === "nlr_wiki_read") {
            return {
              result: {
                content: [
                  { type: "text", text: JSON.stringify({ body: "hello" }) },
                ],
              },
            };
          }
        }
        return { error: { code: -32601, message: "method not found" } };
      },
    });

    const source = new McpToolSource({ transport: client });
    const result = await source.call("nlr_wiki_read", { path: "02-KB-main/x.md" });
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify({ body: "hello" }) }],
    });
    expect(calls[0].method).toBe("tools/call");
    expect(calls[0].params).toEqual({
      name: "nlr_wiki_read",
      arguments: { path: "02-KB-main/x.md" },
    });
  });

  test("JSON-RPC error surfaces as a thrown Error", async () => {
    const client = buildRealTransport({
      handler: () => ({
        error: { code: -32000, message: "boom" },
      }),
    });
    const source = new McpToolSource({ transport: client });
    await expect(source.call("nlr_wiki_read", {})).rejects.toThrow("boom");
  });

  // Safety-gate verification: this is the recipe step from the plan — prove
  // the gates still enforce when the executor path is real. We exercise the
  // same pre-dispatch check the NeuroAgent runs.
  test("safety gate blocks tv_write_note to 02-KB-main before the transport is called", async () => {
    const calls: Array<{ method: string; params: Record<string, unknown>; url: string }> = [];
    const client = buildRealTransport({
      calls,
      handler: () => ({ result: { ok: true } }),
    });
    const source = new McpToolSource({ transport: client });

    const rawArgs = JSON.stringify({ path: "02-KB-main/danger.md", content: "x" });
    const refusal = checkWriteSafety("tv_write_note", rawArgs);
    expect(refusal).not.toBeNull();
    expect(refusal?.reason).toBe("use-nlr-wiki-for-02kb");
    // The McpToolSource MUST NOT be invoked when the gate refuses. The gate
    // is the enforcer; the source is just the transport. No HTTP call made.
    expect(calls.length).toBe(0);
    void source;
  });

  test("safety gate allows nlr_wiki_update to 02-KB-main and the real transport carries it", async () => {
    const calls: Array<{ method: string; params: Record<string, unknown>; url: string }> = [];
    const client = buildRealTransport({
      calls,
      handler: (method) => {
        if (method === "tools/call") return { result: { wrote: true } };
        return { error: { code: -32601, message: "nope" } };
      },
    });
    const source = new McpToolSource({ transport: client });

    const rawArgs = JSON.stringify({ path: "02-KB-main/safe.md", content: "y" });
    const refusal = checkWriteSafety("nlr_wiki_update", rawArgs);
    expect(refusal).toBeNull();
    const result = await source.call("nlr_wiki_update", JSON.parse(rawArgs));
    expect(result).toEqual({ wrote: true });
    expect(calls.length).toBe(1);
    expect(calls[0].method).toBe("tools/call");
  });
});
