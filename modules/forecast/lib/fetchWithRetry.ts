// ─── Resilient Fetch with Retry & Timeout ────────────────────
//
// Wraps the standard fetch() with:
//   1. A timeout (default 10s) so we don't hang forever if an API is slow
//   2. Automatic retries (default 2) with exponential backoff
//   3. Structured logging so we can see what's happening
//
// Used by tideService, buoyService, and weatherService.

interface FetchWithRetryOptions {
  /** Max time to wait for a response in ms (default: 10000) */
  timeoutMs?: number;
  /** Number of retries after the first failure (default: 2) */
  retries?: number;
  /** Label for log messages (e.g. "NOAA Tides") */
  label?: string;
}

export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const { timeoutMs = 10_000, retries = 2, label = "API" } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      // Don't retry on 4xx (client errors) — only on 5xx (server errors)
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // Server error — will retry
      lastError = new Error(`${label} returned ${response.status}`);
      console.warn(
        `[${label}] Attempt ${attempt + 1}/${retries + 1} failed: HTTP ${response.status}`
      );
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (lastError.name === "AbortError") {
        console.warn(
          `[${label}] Attempt ${attempt + 1}/${retries + 1} timed out after ${timeoutMs}ms`
        );
      } else {
        console.warn(
          `[${label}] Attempt ${attempt + 1}/${retries + 1} failed: ${lastError.message}`
        );
      }
    }

    // Exponential backoff: 500ms, 1000ms, 2000ms...
    if (attempt < retries) {
      const delay = 500 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError ?? new Error(`${label} request failed after ${retries + 1} attempts`);
}
