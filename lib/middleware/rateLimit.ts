// ─── In-Memory Sliding Window Rate Limiter ──────────────────
// Tracks request counts per key (IP, email, etc.) in memory.
// Suitable for single-server deployments. For multi-instance
// production, swap the Map for Redis/Upstash.

import { RateLimitError } from "@/lib/auth/types";

interface RateLimitEntry {
  count: number;
  resetAt: number; // epoch ms
}

const store = new Map<string, RateLimitEntry>();

// Evict expired entries every 60 seconds to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000).unref();

interface RateLimitOptions {
  /** Max requests allowed within the window */
  maxAttempts: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

/**
 * Check and consume a rate limit token for the given key.
 * Throws RateLimitError if the limit is exceeded.
 */
export function checkRateLimit(
  key: string,
  { maxAttempts, windowSeconds }: RateLimitOptions
): void {
  const now = Date.now();
  const entry = store.get(key);

  // Window expired or first request — start fresh
  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return;
  }

  // Within window — check limit
  if (entry.count >= maxAttempts) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    throw new RateLimitError(
      `Too many requests. Please try again in ${retryAfter} seconds.`
    );
  }

  entry.count++;
}

// ─── Pre-configured limiters for common auth actions ─────────

/** 5 login attempts per 60 seconds per key */
export function checkLoginLimit(key: string) {
  checkRateLimit(`login:${key}`, { maxAttempts: 5, windowSeconds: 60 });
}

/** 3 registration attempts per 60 seconds per key */
export function checkRegisterLimit(key: string) {
  checkRateLimit(`register:${key}`, { maxAttempts: 3, windowSeconds: 60 });
}

/** 3 password reset requests per 60 seconds per key */
export function checkPasswordResetLimit(key: string) {
  checkRateLimit(`password-reset:${key}`, {
    maxAttempts: 3,
    windowSeconds: 60,
  });
}

/** 5 two-factor verification attempts per 60 seconds per key */
export function checkTwoFactorLimit(key: string) {
  checkRateLimit(`2fa:${key}`, { maxAttempts: 5, windowSeconds: 60 });
}
