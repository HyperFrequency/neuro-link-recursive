// SPDX-License-Identifier: MIT
//
// Settings-migration unit tests. Covers:
//   - syncLegacyApiKeys: propagates apiKeys[<ENV>] onto llm.providers.*.apiKey
//     (PR #26 adversarial review, blocker #4)
//   - migrateSettings: the four scenarios called out in should-fix #8
//     (fresh install, v1 upgrade, idempotent v2, corrupted input)
//
// `settings.ts` imports obsidian at module scope; we use the shared
// test/_obsidian-mock.ts shim so the obsidian package resolves to a set
// of stubs sufficient for all plugin source files.

import "./_obsidian-mock";
import { describe, expect, test } from "bun:test";

describe("syncLegacyApiKeys", () => {
  test("copies OPENROUTER_API_KEY onto llm.providers.openrouter.apiKey", async () => {
    const { syncLegacyApiKeys, migrateSettings } = await import("../src/settings");
    const s = migrateSettings({
      apiKeys: { OPENROUTER_API_KEY: "sk-or-v1-abc" },
    });
    // Pretend a later .env rotation updated apiKeys but the UI hasn't caught up.
    s.llm.providers.openrouter.apiKey = "";
    s.apiKeys.OPENROUTER_API_KEY = "sk-or-v1-rotated";

    const overrides = syncLegacyApiKeys(s);
    expect(s.llm.providers.openrouter.apiKey).toBe("sk-or-v1-rotated");
    expect(overrides).toHaveLength(0);
  });

  test("copies ANTHROPIC_API_KEY onto llm.providers.anthropic.apiKey", async () => {
    const { syncLegacyApiKeys, migrateSettings } = await import("../src/settings");
    const s = migrateSettings({});
    s.apiKeys.ANTHROPIC_API_KEY = "sk-ant-xyz";
    const overrides = syncLegacyApiKeys(s);
    expect(s.llm.providers.anthropic.apiKey).toBe("sk-ant-xyz");
    expect(overrides).toHaveLength(0);
  });

  test("also covers OPENAI_API_KEY (future-proof)", async () => {
    const { syncLegacyApiKeys, migrateSettings } = await import("../src/settings");
    const s = migrateSettings({});
    s.apiKeys.OPENAI_API_KEY = "sk-openai";
    const overrides = syncLegacyApiKeys(s);
    expect(s.llm.providers.openai.apiKey).toBe("sk-openai");
    expect(overrides).toHaveLength(0);
  });

  test("reports override when UI-set key diverges from env value", async () => {
    const { syncLegacyApiKeys, migrateSettings } = await import("../src/settings");
    const s = migrateSettings({});
    // Simulate user pasting one key into the UI, env holding a different one.
    s.llm.providers.openrouter.apiKey = "ui-key";
    s.apiKeys.OPENROUTER_API_KEY = "env-key";

    const overrides = syncLegacyApiKeys(s);
    expect(overrides).toHaveLength(1);
    expect(overrides[0].provider).toBe("openrouter");
    expect(overrides[0].envKey).toBe("OPENROUTER_API_KEY");
    // Env value wins (deployment source of truth).
    expect(s.llm.providers.openrouter.apiKey).toBe("env-key");
  });

  test("skips providers whose env value is empty", async () => {
    const { syncLegacyApiKeys, migrateSettings } = await import("../src/settings");
    const s = migrateSettings({});
    s.llm.providers.anthropic.apiKey = "keep-me";
    // No ANTHROPIC_API_KEY set in apiKeys.

    const overrides = syncLegacyApiKeys(s);
    expect(s.llm.providers.anthropic.apiKey).toBe("keep-me");
    expect(overrides).toHaveLength(0);
  });

  test("no-op when UI value matches env value", async () => {
    const { syncLegacyApiKeys, migrateSettings } = await import("../src/settings");
    const s = migrateSettings({});
    s.llm.providers.anthropic.apiKey = "same-key";
    s.apiKeys.ANTHROPIC_API_KEY = "same-key";

    const overrides = syncLegacyApiKeys(s);
    expect(overrides).toHaveLength(0);
    expect(s.llm.providers.anthropic.apiKey).toBe("same-key");
  });
});

// ── Should-fix #8: migrateSettings coverage ─────────────────────────────
//
// Four scenarios from the review:
//   (a) fresh install (no schemaVersion): schemaVersion=2, empty llm.providers
//   (b) v1 upgrade with apiKeys.OPENROUTER_API_KEY: lifted into
//       llm.providers.openrouter.apiKey, legacy key preserved
//   (c) v2 untouched: migration is idempotent
//   (d) corrupted llm (non-object): recovers to defaults without throwing
describe("migrateSettings", () => {
  test("(a) fresh install initialises schemaVersion=2 with empty llm keys", async () => {
    const { migrateSettings, SETTINGS_SCHEMA_VERSION } = await import("../src/settings");
    const s = migrateSettings({});
    expect(s.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
    expect(s.schemaVersion).toBe(2);
    // Each provider gets its default block with an empty apiKey.
    expect(s.llm.providers.openrouter.apiKey).toBe("");
    expect(s.llm.providers.anthropic.apiKey).toBe("");
    expect(s.llm.providers.openai.apiKey).toBe("");
    expect(s.llm.providers["local-llama"].apiKey).toBe("");
    expect(Array.isArray(s.llm.priority)).toBe(true);
    expect(s.llm.priority.length).toBeGreaterThan(0);
  });

  test("(b) v1 install lifts legacy apiKeys into llm.providers, preserving legacy shape", async () => {
    const { migrateSettings } = await import("../src/settings");
    const s = migrateSettings({
      apiKeys: {
        OPENROUTER_API_KEY: "sk-or-legacy",
        ANTHROPIC_API_KEY: "sk-ant-legacy",
      },
    });
    // Values propagated onto the new path.
    expect(s.llm.providers.openrouter.apiKey).toBe("sk-or-legacy");
    expect(s.llm.providers.anthropic.apiKey).toBe("sk-ant-legacy");
    // Legacy keys still present (back-compat for one release per settings.ts:131-133 note).
    expect(s.apiKeys.OPENROUTER_API_KEY).toBe("sk-or-legacy");
    expect(s.apiKeys.ANTHROPIC_API_KEY).toBe("sk-ant-legacy");
    expect(s.schemaVersion).toBe(2);
  });

  test("(c) v2 install round-trips unchanged (idempotent)", async () => {
    const { migrateSettings, SETTINGS_SCHEMA_VERSION } = await import("../src/settings");
    // First pass: produce a clean v2 settings blob.
    const first = migrateSettings({
      apiKeys: { OPENROUTER_API_KEY: "sk-or-legacy" },
    });
    // Second pass over the produced blob must match the first.
    const second = migrateSettings(first);
    expect(second.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION);
    expect(second.llm.providers.openrouter.apiKey).toBe(
      first.llm.providers.openrouter.apiKey
    );
    // Priority order and all provider blocks remain stable.
    expect(second.llm.priority).toEqual(first.llm.priority);
    expect(Object.keys(second.llm.providers).sort()).toEqual(
      Object.keys(first.llm.providers).sort()
    );
  });

  test("(d) corrupted llm (non-object) recovers to defaults without throwing", async () => {
    const { migrateSettings } = await import("../src/settings");
    // Simulate user hand-edited or file-corrupted settings blob where
    // `llm` is a string / array / null instead of the expected object.
    const variants: unknown[] = ["not-an-object", 42, ["wrong"], null];
    for (const bad of variants) {
      const s = migrateSettings({ llm: bad as never });
      // Falls back to DEFAULT_LLM_SETTINGS: providers populated with
      // empty apiKeys, priority sensibly defaulted.
      expect(s.llm).toBeTruthy();
      expect(s.llm.providers.openrouter.apiKey).toBe("");
      expect(Array.isArray(s.llm.priority)).toBe(true);
      expect(s.llm.priority.length).toBeGreaterThan(0);
    }
  });

  test("(d bonus) corrupted llm.providers (non-object) also recovers", async () => {
    const { migrateSettings } = await import("../src/settings");
    const s = migrateSettings({
      llm: { priority: ["openrouter"], providers: "not-an-object" as unknown as never },
    });
    expect(s.llm.providers.openrouter.apiKey).toBe("");
    expect(s.llm.providers.anthropic.apiKey).toBe("");
  });
});
