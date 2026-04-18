// SPDX-License-Identifier: MIT
//
// Dispatcher unit tests — focused on the pure helpers that don't need
// Obsidian's runtime. Full e2e integration (plugin + vault + TurboVault)
// lands in Phase 9; see the plan doc.

import { describe, expect, test } from "bun:test";
import {
  sanitiseSlug,
  FALLBACK_PROMPT,
  renderTaskMarkdown,
  validateSpec,
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
