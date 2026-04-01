// ─── Cache Utilities ────────────────────────────────────────
//
// Centralized cache helpers wrapping Next.js unstable_cache.
// This provides server-side caching with tag-based revalidation.

import { unstable_cache } from "next/cache";

// ─── TTL Constants (seconds) ───────────────────────────────

export const CACHE_TTL = {
  /** Zone list — rarely changes */
  ZONES: 60 * 60, // 1 hour
  /** Single zone lookup */
  ZONE: 60 * 60, // 1 hour
  /** Forecast data — changes once per day but can be refreshed */
  FORECASTS: 60 * 30, // 30 minutes
} as const;

// ─── Cache Tags ────────────────────────────────────────────

export const CACHE_TAGS = {
  ZONES: "zones",
  FORECASTS: "forecasts",
  forecast: (zoneId: string, date: string) => `forecast-${zoneId}-${date}`,
} as const;

// ─── Cached Wrappers ──────────────────────────────────────

/**
 * Wraps a function with Next.js unstable_cache for server-side caching.
 * Results are cached by the provided key and revalidated by tags.
 */
export function cached<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  options: { tags: string[]; revalidate: number }
): () => Promise<T> {
  return unstable_cache(fn, keyParts, {
    tags: options.tags,
    revalidate: options.revalidate,
  });
}
