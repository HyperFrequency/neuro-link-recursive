// SPDX-License-Identifier: MIT
import { describe, expect, test } from "bun:test";
import { extractSubscriptionId, normaliseVaultEvent } from "../src/mcp-subscription";

describe("extractSubscriptionId", () => {
  test("reads direct subscription_id", () => {
    expect(extractSubscriptionId({ subscription_id: "sub-123" })).toBe("sub-123");
  });

  test("unwraps MCP content envelope", () => {
    const raw = {
      content: [{ type: "text", text: JSON.stringify({ subscription_id: "abc" }) }],
    };
    expect(extractSubscriptionId(raw)).toBe("abc");
  });

  test("skips non-JSON text blocks", () => {
    const raw = {
      content: [
        { type: "text", text: "hello world" },
        { type: "text", text: JSON.stringify({ subscription_id: "xyz" }) },
      ],
    };
    expect(extractSubscriptionId(raw)).toBe("xyz");
  });

  test("returns null when no id found", () => {
    expect(extractSubscriptionId({})).toBeNull();
    expect(extractSubscriptionId(null)).toBeNull();
    expect(extractSubscriptionId({ content: [{ text: "nope" }] })).toBeNull();
  });
});

describe("normaliseVaultEvent", () => {
  test("accepts kind + path", () => {
    expect(normaliseVaultEvent({ kind: "FileCreated", path: "foo.md" })).toEqual({
      kind: "FileCreated",
      path: "foo.md",
    });
  });

  test("accepts event_kind + file_path aliases", () => {
    expect(normaliseVaultEvent({ event_kind: "FileModified", file_path: "bar.md" })).toEqual({
      kind: "FileModified",
      path: "bar.md",
    });
  });

  test("preserves oldPath on rename", () => {
    expect(
      normaliseVaultEvent({
        kind: "FileRenamed",
        path: "new.md",
        old_path: "old.md",
      })
    ).toEqual({ kind: "FileRenamed", path: "new.md", oldPath: "old.md" });
  });

  test("rejects unknown kinds", () => {
    expect(normaliseVaultEvent({ kind: "FileExploded", path: "boom.md" })).toBeNull();
  });

  test("rejects missing fields", () => {
    expect(normaliseVaultEvent({ kind: "FileCreated" })).toBeNull();
    expect(normaliseVaultEvent({ path: "foo.md" })).toBeNull();
    expect(normaliseVaultEvent(null)).toBeNull();
  });
});
