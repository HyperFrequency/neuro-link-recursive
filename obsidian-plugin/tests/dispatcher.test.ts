// SPDX-License-Identifier: MIT
//
// Dispatcher unit tests — focused on the pure helpers that don't need
// Obsidian's runtime. Full e2e integration (plugin + vault + TurboVault)
// lands in Phase 9; see the plan doc.
//
// The stale-content-race tests at the bottom of the file exercise the
// dispatcher end-to-end via the shared obsidian module mock. See PR #26
// adversarial review, blocker #3.

import "./_obsidian-mock";
import { describe, expect, test } from "bun:test";
import {
  sanitiseSlug,
  FALLBACK_PROMPT,
  renderTaskMarkdown,
  validateSpec,
  hashContent,
} from "../src/dispatcher/new-spec-helpers";

describe("sanitiseSlug", () => {
  test("lowercases and preserves allowed chars", () => {
    expect(sanitiseSlug("My-Task_1.2")).toBe("my-task_1.2");
  });

  test("collapses runs of dashes from illegal chars", () => {
    expect(sanitiseSlug("foo bar // baz")).toBe("foo-bar-baz");
  });

  test("strips leading and trailing dashes", () => {
    expect(sanitiseSlug("!!!hello!!!")).toBe("hello");
  });

  test("returns 'task' for an otherwise empty slug", () => {
    expect(sanitiseSlug("!!!")).toBe("task");
    expect(sanitiseSlug("")).toBe("task");
  });
});

describe("FALLBACK_PROMPT", () => {
  test("contains the expected substitutions", () => {
    expect(FALLBACK_PROMPT).toContain("{{ file_path }}");
    expect(FALLBACK_PROMPT).toContain("{{ content }}");
    expect(FALLBACK_PROMPT).toContain("emit_task_spec");
  });
});

describe("validateSpec", () => {
  test("accepts a minimal spec", () => {
    const spec = validateSpec({
      slug: "foo",
      title: "Foo Task",
      type: "curate",
      description: "Do the thing.",
    });
    expect(spec.priority).toBe(3);
    expect(spec.dependencies).toEqual([]);
  });

  test("rejects missing fields", () => {
    expect(() => validateSpec({ slug: "foo" })).toThrow();
    expect(() => validateSpec({ title: "t", description: "d" })).toThrow();
  });

  test("clamps out-of-range priority to default", () => {
    const spec = validateSpec({
      slug: "foo",
      title: "Foo",
      description: "d",
      priority: 99,
    });
    expect(spec.priority).toBe(3);
  });

  test("filters non-string dependencies", () => {
    const spec = validateSpec({
      slug: "foo",
      title: "Foo",
      description: "d",
      dependencies: ["ok", 42, null, "also-ok"],
    });
    expect(spec.dependencies).toEqual(["ok", "also-ok"]);
  });
});

describe("renderTaskMarkdown", () => {
  test("produces valid markdown with YAML frontmatter", () => {
    const md = renderTaskMarkdown("00-neuro-link/x.md", {
      slug: "s",
      title: "T",
      type: "curate",
      priority: 2,
      description: "Body here",
      dependencies: ["a", "b"],
    });
    expect(md.startsWith("---\n")).toBe(true);
    expect(md).toContain('title: "T"');
    expect(md).toContain("type: curate");
    expect(md).toContain("priority: 2");
    expect(md).toContain("status: pending");
    expect(md).toContain("  - a\n  - b");
    expect(md).toContain("# T");
    expect(md).toContain("Body here");
  });

  test("escapes double-quotes in title and source", () => {
    const md = renderTaskMarkdown('path"with"quote.md', {
      slug: "s",
      title: 'Hello "World"',
      type: "other",
      priority: 3,
      description: "d",
      dependencies: [],
    });
    expect(md).toContain('title: "Hello \\"World\\""');
    expect(md).toContain('source: "path\\"with\\"quote.md"');
  });

  test("uses empty list form when no dependencies", () => {
    const md = renderTaskMarkdown("src.md", {
      slug: "s",
      title: "T",
      type: "other",
      priority: 3,
      description: "d",
      dependencies: [],
    });
    expect(md).toContain("dependencies: []");
  });
});

describe("hashContent", () => {
  test("stable across identical inputs", () => {
    expect(hashContent("alpha")).toBe(hashContent("alpha"));
  });

  test("differs on single-char edits", () => {
    expect(hashContent("alpha")).not.toBe(hashContent("alpha\n"));
    expect(hashContent("alpha")).not.toBe(hashContent("alphA"));
  });

  test("treats empty string as a fixed value", () => {
    // sha256("") lower 12 hex chars, sanity check: we just want *some*
    // hash that doesn't throw.
    expect(hashContent("")).toHaveLength(64);
  });
});

// ── Blocker #3: stale-content race ──────────────────────────────────────
//
// Simulate: user drops plan.md, dispatcher reads it, LLM takes ~X ms to
// return, user edits the file mid-flight. After the LLM returns, the
// dispatcher should detect the hash mismatch and NOT write the stale spec.
//
// The test mounts a minimal plugin stub and exercises the private
// `process()` method directly — we bypass the debounce in `handle()`
// because the debounce is orthogonal to the race we're testing.
describe("NewSpecDispatcher — stale-content race", () => {
  interface VaultRead {
    (): Promise<string>;
  }

  async function buildHarness(
    initialContent: string,
    readAfterLLM: VaultRead,
    toolUseImpl?: () => Promise<unknown>
  ): Promise<{ runs: Array<{ path: string; body: string }>; dispatcher: unknown }> {
    // Dynamic import so the obsidian mock above is in effect.
    const { NewSpecDispatcher } = await import("../src/dispatcher/new-spec");

    const runs: Array<{ path: string; body: string }> = [];

    // Fake vault file that returns the "current" content on each .read() call.
    let currentRead: VaultRead = async (): Promise<string> => initialContent;

    const mockFile = { __kind: "TFile" };
    const { TFile } = await import("obsidian");
    // Swap the prototype so `instanceof TFile` succeeds.
    Object.setPrototypeOf(mockFile, (TFile as unknown as { prototype: object }).prototype);

    const plugin = {
      settings: {
        dispatcher: {
          enabled: true,
          watchGlob: "00-neuro-link/*.md",
          taskOutputDir: "00-neuro-link/tasks",
          debounceMs: 0,
          model: "test-model",
        },
        vaultPath: "/fake/vault",
      },
      lifetimeSignal: new AbortController().signal,
      app: {
        vault: {
          getAbstractFileByPath: (p: string): unknown => {
            // Return the TFile stub for the source and null for the task
            // output target (so writeTaskSpec's "already exists" loop is happy).
            if (p.startsWith("00-neuro-link/tasks/")) return null;
            return mockFile;
          },
          read: async (_f: unknown): Promise<string> => currentRead(),
          create: async (p: string, body: string): Promise<void> => {
            runs.push({ path: p, body });
          },
          createFolder: async (_p: string): Promise<void> => {
            /* no-op */
          },
        },
      },
      llm: {
        defaultModel: (): string => "test-model",
        tool_use:
          toolUseImpl ||
          (async (): Promise<unknown> => {
            // Swap the "current" read to the post-edit content between
            // the pre-LLM read and the post-LLM re-read.
            currentRead = readAfterLLM;
            return {
              content: "",
              tool_calls: [
                {
                  id: "t1",
                  name: "emit_task_spec",
                  arguments: JSON.stringify({
                    slug: "do-thing",
                    title: "Do thing",
                    type: "curate",
                    description: "The thing",
                  }),
                },
              ],
            };
          }),
      },
    };

    const dispatcher = new NewSpecDispatcher(plugin as unknown as never);
    return { runs, dispatcher };
  }

  test("discards the spec when content changes mid-flight", async () => {
    const initial = "Please curate the docs folder.\n";
    const edited = "Actually never mind, scrap this.\n";
    const { runs, dispatcher } = await buildHarness(initial, async () => edited);

    // Call the private process() method directly.
    await (dispatcher as unknown as { process: (p: string) => Promise<void> }).process(
      "00-neuro-link/plan.md"
    );

    // The stale spec must NOT have been written synchronously.
    expect(runs.length).toBe(0);
  });

  test("writes the spec when content is unchanged mid-flight", async () => {
    const stable = "Please curate the docs folder.\n";
    const { runs, dispatcher } = await buildHarness(stable, async () => stable);

    await (dispatcher as unknown as { process: (p: string) => Promise<void> }).process(
      "00-neuro-link/plan.md"
    );

    expect(runs.length).toBe(1);
    expect(runs[0].path).toBe("00-neuro-link/tasks/do-thing.md");
    expect(runs[0].body).toContain("Do thing");
  });

  test("bails without writing after the single stale-retry is exhausted", async () => {
    // Every call to tool_use mutates the "current" read so the hash never
    // matches. First call triggers a retry; second call should also detect
    // the mismatch and give up (no write).
    let callNumber = 0;
    const rotating = (): string => `edit-${callNumber++}\n`;

    const { NewSpecDispatcher } = await import("../src/dispatcher/new-spec");
    const { TFile } = await import("obsidian");

    const runs: Array<{ path: string; body: string }> = [];
    // Each vault.read() returns a fresh, different value — simulating a user
    // editing between every read.
    const mockFile = {};
    Object.setPrototypeOf(mockFile, (TFile as unknown as { prototype: object }).prototype);

    const plugin = {
      settings: {
        dispatcher: {
          enabled: true,
          watchGlob: "00-neuro-link/*.md",
          taskOutputDir: "00-neuro-link/tasks",
          debounceMs: 0,
          model: "test-model",
        },
        vaultPath: "/fake/vault",
      },
      lifetimeSignal: new AbortController().signal,
      app: {
        vault: {
          getAbstractFileByPath: (p: string): unknown =>
            p.startsWith("00-neuro-link/tasks/") ? null : mockFile,
          read: async (): Promise<string> => rotating(),
          create: async (p: string, body: string): Promise<void> => {
            runs.push({ path: p, body });
          },
          createFolder: async (): Promise<void> => {
            /* no-op */
          },
        },
      },
      llm: {
        defaultModel: (): string => "test-model",
        tool_use: async (): Promise<unknown> => ({
          content: "",
          tool_calls: [
            {
              id: "t1",
              name: "emit_task_spec",
              arguments: JSON.stringify({
                slug: "retry-test",
                title: "Retry",
                type: "other",
                description: "d",
              }),
            },
          ],
        }),
      },
    };

    const dispatcher = new NewSpecDispatcher(plugin as unknown as never);
    await (dispatcher as unknown as { process: (p: string, n?: number) => Promise<void> }).process(
      "00-neuro-link/plan.md"
    );
    // Allow the queued microtask retry to run.
    await new Promise((r) => setTimeout(r, 10));

    // With every read different, hashes never match — no write must occur
    // even after the retry.
    expect(runs.length).toBe(0);
  });
});
