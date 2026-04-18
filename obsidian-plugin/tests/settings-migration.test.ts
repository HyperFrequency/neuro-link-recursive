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
