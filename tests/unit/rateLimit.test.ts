import { describe, it, expect } from "vitest";
import {
  checkLoginLimit,
  checkRegisterLimit,
  checkPasswordResetLimit,
  checkTwoFactorLimit,
} from "@/lib/middleware/rateLimit";
import { RateLimitError } from "@/lib/auth/types";

// Each test uses a unique key via Date.now() to avoid cross-test interference.
// These tests run against the in-memory fallback limiter (no Redis env vars).

describe("checkLoginLimit", () => {
  it("allows requests within the limit (5 per 60s)", async () => {
    const key = `login-allow-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      await expect(checkLoginLimit(key)).resolves.toBeUndefined();
    }
  });

  it("blocks the 6th request", async () => {
    const key = `login-block-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      await checkLoginLimit(key);
    }
    await expect(checkLoginLimit(key)).rejects.toThrow(RateLimitError);
  });

  it("includes retry-after in the error message", async () => {
    const key = `login-retry-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      await checkLoginLimit(key);
    }
    try {
      await checkLoginLimit(key);
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).message).toMatch(
        /try again in \d+ seconds/
      );
    }
  });
});

describe("checkRegisterLimit", () => {
  it("allows 3 requests then blocks", async () => {
    const key = `register-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      await expect(checkRegisterLimit(key)).resolves.toBeUndefined();
    }
    await expect(checkRegisterLimit(key)).rejects.toThrow(RateLimitError);
  });
});

describe("checkPasswordResetLimit", () => {
  it("allows 3 requests then blocks", async () => {
    const key = `pw-reset-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      await expect(checkPasswordResetLimit(key)).resolves.toBeUndefined();
    }
    await expect(checkPasswordResetLimit(key)).rejects.toThrow(RateLimitError);
  });
});

describe("checkTwoFactorLimit", () => {
  it("allows 5 requests then blocks", async () => {
    const key = `2fa-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      await expect(checkTwoFactorLimit(key)).resolves.toBeUndefined();
    }
    await expect(checkTwoFactorLimit(key)).rejects.toThrow(RateLimitError);
  });
});

describe("separate keys are isolated", () => {
  it("exhausting one key does not affect another", async () => {
    const keyA = `iso-a-${Date.now()}`;
    const keyB = `iso-b-${Date.now()}`;

    // Exhaust keyA (login = 5 attempts)
    for (let i = 0; i < 5; i++) {
      await checkLoginLimit(keyA);
    }
    await expect(checkLoginLimit(keyA)).rejects.toThrow(RateLimitError);

    // keyB should still work
    await expect(checkLoginLimit(keyB)).resolves.toBeUndefined();
  });
});
