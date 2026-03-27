import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit } from "@/lib/middleware/rateLimit";
import { RateLimitError } from "@/lib/auth/types";

// Reset the internal store between tests by using unique keys

describe("checkRateLimit", () => {
  it("allows requests within the limit", () => {
    const key = `test-allow-${Date.now()}`;
    expect(() =>
      checkRateLimit(key, { maxAttempts: 3, windowSeconds: 60 })
    ).not.toThrow();
    expect(() =>
      checkRateLimit(key, { maxAttempts: 3, windowSeconds: 60 })
    ).not.toThrow();
    expect(() =>
      checkRateLimit(key, { maxAttempts: 3, windowSeconds: 60 })
    ).not.toThrow();
  });

  it("blocks requests over the limit", () => {
    const key = `test-block-${Date.now()}`;
    const opts = { maxAttempts: 2, windowSeconds: 60 };

    checkRateLimit(key, opts); // 1
    checkRateLimit(key, opts); // 2

    expect(() => checkRateLimit(key, opts)).toThrow(RateLimitError);
  });

  it("includes retry-after in the error message", () => {
    const key = `test-retry-${Date.now()}`;
    const opts = { maxAttempts: 1, windowSeconds: 30 };

    checkRateLimit(key, opts); // 1 (consumes the only attempt)

    try {
      checkRateLimit(key, opts);
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).message).toMatch(
        /try again in \d+ seconds/
      );
    }
  });

  it("uses separate windows for different keys", () => {
    const keyA = `test-sep-a-${Date.now()}`;
    const keyB = `test-sep-b-${Date.now()}`;
    const opts = { maxAttempts: 1, windowSeconds: 60 };

    checkRateLimit(keyA, opts);
    // keyA is now exhausted, but keyB should still work
    expect(() => checkRateLimit(keyB, opts)).not.toThrow();
  });

  it("resets after the window expires", async () => {
    const key = `test-expire-${Date.now()}`;
    const opts = { maxAttempts: 1, windowSeconds: 1 }; // 1-second window

    checkRateLimit(key, opts);
    expect(() => checkRateLimit(key, opts)).toThrow(RateLimitError);

    // Wait for the window to expire
    await new Promise((r) => setTimeout(r, 1100));

    // Should work again
    expect(() => checkRateLimit(key, opts)).not.toThrow();
  });
});
