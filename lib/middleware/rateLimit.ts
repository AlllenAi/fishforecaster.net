// ─── Rate Limiter (Upstash Redis with in-memory fallback) ────
// Uses Upstash Redis in production for distributed rate limiting
// across serverless functions. Falls back to in-memory for local dev.

import { RateLimitError } from "@/lib/auth/types";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── Upstash Redis client (if configured) ─────────────────

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function createLimiter(maxAttempts: number, windowSeconds: number) {
  if (redis) {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxAttempts, `${windowSeconds} s`),
      analytics: true,
    });
  }
  return null;
}

// ─── In-memory fallback for local dev ─────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) store.delete(key);
    }
  }, 60_000).unref();
}

function checkRateLimitLocal(
  key: string,
  maxAttempts: number,
  windowSeconds: number
): void {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return;
  }

  if (entry.count >= maxAttempts) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    throw new RateLimitError(
      `Too many requests. Please try again in ${retryAfter} seconds.`
    );
  }

  entry.count++;
}

// ─── Core check function ──────────────────────────────────

async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<void> {
  if (!redis) {
    checkRateLimitLocal(key, maxAttempts, windowSeconds);
    return;
  }

  const limiter = createLimiter(maxAttempts, windowSeconds);
  const { success, reset } = await limiter!.limit(key);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    throw new RateLimitError(
      `Too many requests. Please try again in ${retryAfter} seconds.`
    );
  }
}

// ─── Pre-configured limiters for common auth actions ──────

/** 5 login attempts per 60 seconds per key */
export async function checkLoginLimit(key: string) {
  await checkRateLimit(`login:${key}`, 5, 60);
}

/** 3 registration attempts per 60 seconds per key */
export async function checkRegisterLimit(key: string) {
  await checkRateLimit(`register:${key}`, 3, 60);
}

/** 3 password reset requests per 60 seconds per key */
export async function checkPasswordResetLimit(key: string) {
  await checkRateLimit(`password-reset:${key}`, 3, 60);
}

/** 5 two-factor verification attempts per 60 seconds per key */
export async function checkTwoFactorLimit(key: string) {
  await checkRateLimit(`2fa:${key}`, 5, 60);
}
