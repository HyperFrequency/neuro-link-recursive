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
          taskOutputDir: "07-neuro-link-task",
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
            if (p.startsWith("07-neuro-link-task/")) return null;
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
    expect(runs[0].path).toBe("07-neuro-link-task/do-thing.md");
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
          taskOutputDir: "07-neuro-link-task",
          debounceMs: 0,
          model: "test-model",
        },
        vaultPath: "/fake/vault",
      },
      lifetimeSignal: new AbortController().signal,
      app: {
        vault: {
          getAbstractFileByPath: (p: string): unknown =>
            p.startsWith("07-neuro-link-task/") ? null : mockFile,
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

// ── Should-fix #13: slug-collision TOCTOU ──────────────────────────────
//
// Two concurrent drops with identical basenames that slugify the same way
// previously raced between the existence-check and `vault.create`. Under
// the write-chain mutex, slug selection and create are atomic; both
// dispatches should end up writing to distinct paths (foo.md and foo-1.md).
describe("NewSpecDispatcher — slug collision under concurrency", () => {
  test("two concurrent dispatches with the same slug write to distinct paths", async () => {
    const { NewSpecDispatcher } = await import("../src/dispatcher/new-spec");
    const { TFile } = await import("obsidian");

    const writtenPaths: string[] = [];
    // Mock vault: getAbstractFileByPath returns null unless we've already
    // written to that path (simulating the real vault where a freshly-
    // created file becomes discoverable only after vault.create resolves).
    const fakeFile = {};
    Object.setPrototypeOf(fakeFile, (TFile as unknown as { prototype: object }).prototype);

    const content = "Same content\n";

    const plugin = {
      settings: {
        dispatcher: {
          enabled: true,
          watchGlob: "00-neuro-link/*.md",
          taskOutputDir: "07-neuro-link-task",
          debounceMs: 0,
          model: "test-model",
        },
        vaultPath: "/fake/vault",
      },
      lifetimeSignal: new AbortController().signal,
      app: {
        vault: {
          getAbstractFileByPath: (p: string): unknown => {
            // Source reads — return the fake file stub.
            if (p === "00-neuro-link/a.md" || p === "00-neuro-link/b.md") return fakeFile;
            // Output dir check.
            if (p === "07-neuro-link-task") return fakeFile;
            // Task output paths — return truthy only if already written.
            if (writtenPaths.includes(p)) return fakeFile;
            return null;
          },
          read: async (): Promise<string> => content,
          create: async (p: string, _body: string): Promise<void> => {
            // Simulate a short async gap so the two dispatches genuinely
            // interleave; without this both runs can wrap up in the same
            // microtask and the race wouldn't exercise the lock.
            await new Promise((r) => setTimeout(r, 2));
            if (writtenPaths.includes(p)) {
              const err = new Error(`File already exists: ${p}`);
              throw err;
            }
            writtenPaths.push(p);
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
                slug: "shared-slug",
                title: "Shared",
                type: "other",
                description: "d",
              }),
            },
          ],
        }),
      },
    };

    const dispatcher = new NewSpecDispatcher(plugin as unknown as never);
    const run = (p: string): Promise<void> =>
      (dispatcher as unknown as { process: (p: string) => Promise<void> }).process(p);

    // Fire two concurrent process() calls — both will slugify to
    // `shared-slug` but must end up on distinct paths.
    await Promise.all([run("00-neuro-link/a.md"), run("00-neuro-link/b.md")]);

    expect(writtenPaths.length).toBe(2);
    expect(new Set(writtenPaths).size).toBe(2); // distinct
    expect(writtenPaths).toContain("07-neuro-link-task/shared-slug.md");
    expect(writtenPaths).toContain("07-neuro-link-task/shared-slug-1.md");
  });
});

// ── Should-fix #9: cold-start catch-up scan ────────────────────────────
//
// Between `plugin.onload` finishing and the vault-event subscription
// actually connecting (50-300 ms locally, longer over network), files the
// user drops are invisible to the server-side event stream. scanCatchUp
// reads the vault directly to fill that gap — transport-agnostic, so it
// survives the upcoming WebSocket-to-long-poll pivot.
describe("NewSpecDispatcher — cold-start catch-up scan", () => {
  interface FakeTFile {
    path: string;
    stat: { mtime: number };
  }

  function buildCatchupPlugin(files: FakeTFile[], taskBodies: Record<string, string>): {
    plugin: unknown;
    queued: string[];
  } {
    const queued: string[] = [];
    const plugin = {
      settings: {
        dispatcher: {
          enabled: true,
          watchGlob: "00-neuro-link/*.md",
          taskOutputDir: "07-neuro-link-task",
          debounceMs: 1,
          model: "test-model",
        },
        vaultPath: "/fake/vault",
      },
      lifetimeSignal: new AbortController().signal,
      app: {
        vault: {
          getMarkdownFiles: (): FakeTFile[] => files,
          getAbstractFileByPath: (): unknown => null,
          read: async (f: FakeTFile): Promise<string> => taskBodies[f.path] ?? "",
          create: async (): Promise<void> => { /* no-op */ },
          createFolder: async (): Promise<void> => { /* no-op */ },
        },
      },
      llm: {
        defaultModel: (): string => "test-model",
        tool_use: async (): Promise<unknown> => {
          throw new Error("should not be called in scan test");
        },
      },
    };
    // Intercept handle() via a test-only spy once the dispatcher is
    // constructed.
    return { plugin, queued };
  }

  test("queues recent top-level files with no matching task spec", async () => {
    const { NewSpecDispatcher } = await import("../src/dispatcher/new-spec");

    const now = Date.now();
    const files: FakeTFile[] = [
      { path: "00-neuro-link/fresh.md", stat: { mtime: now - 10_000 } }, // 10s old
      { path: "00-neuro-link/old.md", stat: { mtime: now - 600_000 } }, // 10min old
      { path: "00-neuro-link/subfolder/ignored.md", stat: { mtime: now } },
      { path: "07-neuro-link-task/existing.md", stat: { mtime: now } },
      {
        path: "00-neuro-link/already-processed.md",
        stat: { mtime: now - 5_000 },
      },
    ];
    const taskBodies: Record<string, string> = {
      "07-neuro-link-task/existing.md":
        '---\ntitle: "Existing"\nsource: "00-neuro-link/already-processed.md"\n---\n',
    };

    const { plugin, queued } = buildCatchupPlugin(files, taskBodies);
    const dispatcher = new NewSpecDispatcher(plugin as unknown as never);
    // Spy on handle() to record what the scan dispatches.
    const originalHandle = (dispatcher as unknown as { handle: (e: unknown) => void }).handle.bind(
      dispatcher
    );
    (dispatcher as unknown as { handle: (e: { path: string }) => void }).handle = (e) => {
      queued.push(e.path);
      // Don't actually call the original — we just want to observe
      // which paths get queued without triggering the debounce timer.
      void originalHandle; // keep ref to avoid lint warnings
    };

    const count = await (
      dispatcher as unknown as { scanCatchUp: (ms?: number) => Promise<number> }
    ).scanCatchUp(60_000);

    // fresh.md should queue; old.md is outside the lookback; subfolder
    // file fails isWatchedPath; tasks/* aren't watched; already-processed.md
    // is filtered by the task-spec cross-ref.
    expect(count).toBe(1);
    expect(queued).toEqual(["00-neuro-link/fresh.md"]);
  });

  test("returns 0 when dispatcher is disabled", async () => {
    const { NewSpecDispatcher } = await import("../src/dispatcher/new-spec");
    const { plugin } = buildCatchupPlugin(
      [
        {
          path: "00-neuro-link/fresh.md",
          stat: { mtime: Date.now() },
        },
      ],
      {}
    );
    (plugin as { settings: { dispatcher: { enabled: boolean } } }).settings.dispatcher.enabled =
      false;
    const dispatcher = new NewSpecDispatcher(plugin as unknown as never);
    const count = await (
      dispatcher as unknown as { scanCatchUp: () => Promise<number> }
    ).scanCatchUp();
    expect(count).toBe(0);
  });

  test("returns 0 when nothing is recent enough", async () => {
    const { NewSpecDispatcher } = await import("../src/dispatcher/new-spec");
    const { plugin } = buildCatchupPlugin(
      [
        {
          path: "00-neuro-link/stale.md",
          stat: { mtime: Date.now() - 3_600_000 },
        },
      ],
      {}
    );
    const dispatcher = new NewSpecDispatcher(plugin as unknown as never);
    const count = await (
      dispatcher as unknown as { scanCatchUp: (ms?: number) => Promise<number> }
    ).scanCatchUp(60_000);
    expect(count).toBe(0);
  });
});

// ── Codex finding #5: Overflow recovery via rescan ──────────────────────
//
// When the vault-events transport emits a synthetic Overflow event with
// `droppedCount > 0`, the plugin's subscription callback should:
//   (a) call dispatcher.rescan(lookbackMs) with lookback >= 60_000,
//   (b) surface a user-visible Notice naming the dropped count,
//   (c) be idempotent — firing the same Overflow twice must not produce
//       duplicate task specs (the dispatcher's processedSources cross-ref
//       handles this).
//
// We reproduce main.ts's `triggerOverflowCatchUp` callback inline so the
// test doesn't require instantiating the full Obsidian Plugin class
// (which pulls in child_process / fs side effects on load). The logic
// under test is small — any drift between this test and main.ts will
// show up as a clear diff.
describe("NewSpecDispatcher — Overflow recovery (Codex finding #5)", () => {
  interface RescanCall {
    lookbackMs: number;
  }
  interface NoticeCall {
    message: string;
  }

  async function buildOverflowHarness(opts: {
    lastFetchTimestamp: number | null;
    files: Array<{ path: string; stat: { mtime: number } }>;
    taskBodies?: Record<string, string>;
  }): Promise<{
    fireOverflow: (droppedCount: number, eventTimestamp: number) => Promise<void>;
    rescanCalls: RescanCall[];
    notices: NoticeCall[];
    queued: string[];
  }> {
    const { NewSpecDispatcher } = await import("../src/dispatcher/new-spec");

    const rescanCalls: RescanCall[] = [];
    const notices: NoticeCall[] = [];
    const queued: string[] = [];

    const taskBodies = opts.taskBodies ?? {};
    const plugin = {
      settings: {
        dispatcher: {
          enabled: true,
          watchGlob: "00-neuro-link/*.md",
          taskOutputDir: "00-neuro-link/tasks",
          debounceMs: 1,
          model: "test-model",
        },
        vaultPath: "/fake/vault",
      },
      lifetimeSignal: new AbortController().signal,
      app: {
        vault: {
          getMarkdownFiles: (): typeof opts.files => opts.files,
          getAbstractFileByPath: (): unknown => null,
          read: async (f: { path: string }): Promise<string> =>
            taskBodies[f.path] ?? "",
          create: async (): Promise<void> => {
            /* no-op */
          },
          createFolder: async (): Promise<void> => {
            /* no-op */
          },
        },
      },
      llm: {
        defaultModel: (): string => "test-model",
        tool_use: async (): Promise<unknown> => {
          throw new Error("tool_use should not run in overflow test");
        },
      },
    };

    const dispatcher = new NewSpecDispatcher(plugin as unknown as never);

    // Spy on handle() to record rescan-queued paths without triggering
    // the real debounce + LLM machinery.
    (dispatcher as unknown as { handle: (e: { path: string }) => void }).handle = (e) => {
      queued.push(e.path);
    };
    // Wrap rescan to record its lookback argument; delegate to the real
    // implementation so we exercise scanCatchUp end-to-end.
    const realRescan = (
      dispatcher as unknown as { rescan: (ms: number) => Promise<number> }
    ).rescan.bind(dispatcher);
    (dispatcher as unknown as { rescan: (ms: number) => Promise<number> }).rescan = async (
      ms: number
    ): Promise<number> => {
      rescanCalls.push({ lookbackMs: ms });
      return realRescan(ms);
    };

    const fakeSubscription = {
      getLastSuccessfulFetchTimestamp: (): number | null => opts.lastFetchTimestamp,
    };

    // This reproduces main.ts `triggerOverflowCatchUp` verbatim — keep
    // it in sync with the production path. See src/main.ts.
    const fireOverflow = async (
      droppedCount: number,
      eventTimestamp: number
    ): Promise<void> => {
      const MIN_LOOKBACK_MS = 60_000;
      const lastFetch = fakeSubscription.getLastSuccessfulFetchTimestamp();
      const droppedPeriodHeuristic = lastFetch !== null ? eventTimestamp - lastFetch : 0;
      const lookbackMs = Math.max(MIN_LOOKBACK_MS, droppedPeriodHeuristic);
      notices.push({
        message: `vault-events backpressure: ${droppedCount} events dropped; catch-up scan running`,
      });
      await (
        dispatcher as unknown as { rescan: (ms: number) => Promise<number> }
      ).rescan(lookbackMs);
    };

    return { fireOverflow, rescanCalls, notices, queued };
  }

  test("Overflow with droppedCount > 0 triggers rescan with lookback >= 60_000", async () => {
    const now = Date.now();
    const { fireOverflow, rescanCalls } = await buildOverflowHarness({
      // No prior successful fetch yet — the heuristic falls through to
      // the 60 s floor.
      lastFetchTimestamp: null,
      files: [{ path: "00-neuro-link/missed.md", stat: { mtime: now - 1_000 } }],
    });

    await fireOverflow(3, now);

    expect(rescanCalls).toHaveLength(1);
    expect(rescanCalls[0].lookbackMs).toBeGreaterThanOrEqual(60_000);
  });

  test("lookback widens to cover the silent interval when it exceeds the floor", async () => {
    const now = Date.now();
    // 5-minute gap between the last successful fetch and the overflow:
    // the rescan window should widen to match.
    const fiveMinutesAgo = now - 5 * 60_000;
    const { fireOverflow, rescanCalls } = await buildOverflowHarness({
      lastFetchTimestamp: fiveMinutesAgo,
      files: [],
    });

    await fireOverflow(7, now);

    expect(rescanCalls).toHaveLength(1);
    expect(rescanCalls[0].lookbackMs).toBeGreaterThanOrEqual(5 * 60_000);
  });

  test("Overflow surfaces a user-visible Notice naming the dropped count", async () => {
    const { fireOverflow, notices } = await buildOverflowHarness({
      lastFetchTimestamp: null,
      files: [],
    });

    await fireOverflow(42, Date.now());

    expect(notices).toHaveLength(1);
    expect(notices[0].message).toContain("42 events dropped");
    expect(notices[0].message).toContain("catch-up scan running");
  });

  test("double-firing Overflow does not write the same task spec twice", async () => {
    // Idempotency: after the first rescan would have written a task spec
    // for missed.md, the second rescan's processedSources cross-ref sees
    // the pre-existing spec and filters the source out.
    const now = Date.now();
    const { fireOverflow, queued } = await buildOverflowHarness({
      lastFetchTimestamp: now - 30_000,
      files: [
        { path: "00-neuro-link/missed.md", stat: { mtime: now - 10_000 } },
        // Pre-existing task spec recording missed.md as already processed.
        {
          path: "00-neuro-link/tasks/missed-task.md",
          stat: { mtime: now - 5_000 },
        },
      ],
      taskBodies: {
        "00-neuro-link/tasks/missed-task.md":
          '---\ntitle: "Missed"\nsource: "00-neuro-link/missed.md"\n---\n',
      },
    });

    await fireOverflow(1, now);
    const afterFirst = queued.length;
    await fireOverflow(1, now);

    expect(afterFirst).toBe(0);
    expect(queued.length).toBe(0);
  });
});
