// SPDX-License-Identifier: MIT
import { describe, expect, test } from "bun:test";
import { LLMProviderError } from "../src/providers/base";

describe("LLMProviderError", () => {
  test("sets retryable = true for rate_limit by default", () => {
    const e = new LLMProviderError("openrouter", "rate_limit", "too many reqs");
    expect(e.retryable).toBe(true);
    expect(e.provider).toBe("openrouter");
    expect(e.kind).toBe("rate_limit");
  });

  test("sets retryable = false for auth errors", () => {
    const e = new LLMProviderError("openai", "auth", "bad key");
    expect(e.retryable).toBe(false);
  });

  test("respects explicit retryable override", () => {
    const e = new LLMProviderError("anthropic", "bad_request", "msg", { retryable: true });
    expect(e.retryable).toBe(true);
  });

  test("carries status code when provided", () => {
    const e = new LLMProviderError("openrouter", "rate_limit", "429", { status: 429 });
    expect(e.status).toBe(429);
  });
});
