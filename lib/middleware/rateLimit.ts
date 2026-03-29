// ─── Redis-backed Sliding Window Rate Limiter ───────────────
// Uses Upstash Redis for rate limiting that works across all
// Vercel serverless instances. Falls back to a simple in-memory
// Map when Redis env vars are not set (local development).

import { RateLimitError } from "@/lib/auth/types";

// ─── Types ──────────────────────────────────────────────────

interface RateLimitResult {
  success: boolean;
  reset: number; // epoch ms
}

interface Limiter {
  limit(key: string): Promise<RateLimitResult>;
}

// ─── In-Memory Fallback (local dev only) ────────────────────

function createMemoryLimiter(
  maxAttempts: number,
  windowMs: number
): Limiter {
  const store = new Map<string, { count: number; resetAt: number }>();

  return {
    async limit(key: string): Promise<RateLimitResult> {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now >= entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { success: true, reset: now + windowMs };
      }

      if (entry.count >= maxAttempts) {
        return { success: false, reset: entry.resetAt };
      }

      entry.count++;
      return { success: true, reset: entry.resetAt };
    },
  };
}

// ─── Redis Limiter (production) ─────────────────────────────

function createRedisLimiter(
  maxAttempts: number,
  windowSeconds: number
): Limiter {
  // Dynamic import avoids loading Upstash when not configured
  let limiterInstance: Limiter | null = null;

  return {
    async limit(key: string): Promise<RateLimitResult> {
      if (!limiterInstance) {
        const { Ratelimit } = await import("@upstash/ratelimit");
        const { Redis } = await import("@upstash/redis");

        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });

        const rl = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(maxAttempts, `${windowSeconds} s`),
          analytics: true,
          prefix: "ratelimit",
        });

        limiterInstance = {
          async limit(k: string) {
            const res = await rl.limit(k);
            return { success: res.success, reset: res.reset };
          },
        };
      }

      return limiterInstance.limit(key);
    },
  };
}

// ─── Limiter Factory ────────────────────────────────────────

const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

function createLimiter(maxAttempts: number, windowSeconds: number): Limiter {
  if (hasRedis) {
    return createRedisLimiter(maxAttempts, windowSeconds);
  }
  return createMemoryLimiter(maxAttempts, windowSeconds * 1000);
}

// ─── Pre-configured limiters ────────────────────────────────

const loginLimiter = createLimiter(5, 60);
const registerLimiter = createLimiter(3, 60);
const passwordResetLimiter = createLimiter(3, 60);
const twoFactorLimiter = createLimiter(5, 60);

// ─── Core check function ────────────────────────────────────

async function checkLimit(limiter: Limiter, key: string): Promise<void> {
  const { success, reset } = await limiter.limit(key);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    throw new RateLimitError(
      `Too many requests. Please try again in ${retryAfter} seconds.`
    );
  }
}

// ─── Exported limiters ──────────────────────────────────────

/** 5 login attempts per 60 seconds per key */
export async function checkLoginLimit(key: string) {
  await checkLimit(loginLimiter, `login:${key}`);
}

/** 3 registration attempts per 60 seconds per key */
export async function checkRegisterLimit(key: string) {
  await checkLimit(registerLimiter, `register:${key}`);
}

/** 3 password reset requests per 60 seconds per key */
export async function checkPasswordResetLimit(key: string) {
  await checkLimit(passwordResetLimiter, `password-reset:${key}`);
}

/** 5 two-factor verification attempts per 60 seconds per key */
export async function checkTwoFactorLimit(key: string) {
  await checkLimit(twoFactorLimiter, `2fa:${key}`);
}
