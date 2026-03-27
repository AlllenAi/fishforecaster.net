import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchWithRetry } from "@/modules/forecast/lib/fetchWithRetry";

// Mock the global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

function okResponse(body: string = "ok") {
  return new Response(body, { status: 200 });
}

function serverError() {
  return new Response("Internal Server Error", { status: 500 });
}

function clientError() {
  return new Response("Bad Request", { status: 400 });
}

describe("fetchWithRetry", () => {
  it("returns response on first successful attempt", async () => {
    mockFetch.mockResolvedValueOnce(okResponse());

    const res = await fetchWithRetry("https://example.com", {
      retries: 2,
      label: "Test",
    });

    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retries on server error and succeeds", async () => {
    mockFetch
      .mockResolvedValueOnce(serverError())
      .mockResolvedValueOnce(okResponse());

    const res = await fetchWithRetry("https://example.com", {
      retries: 2,
      label: "Test",
    });

    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry on 4xx client errors", async () => {
    mockFetch.mockResolvedValueOnce(clientError());

    const res = await fetchWithRetry("https://example.com", {
      retries: 2,
      label: "Test",
    });

    expect(res.status).toBe(400);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retries on network error and succeeds", async () => {
    mockFetch
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce(okResponse());

    const res = await fetchWithRetry("https://example.com", {
      retries: 2,
      label: "Test",
    });

    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting all retries", async () => {
    mockFetch
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockRejectedValueOnce(new Error("fail 3"));

    await expect(
      fetchWithRetry("https://example.com", {
        retries: 2,
        label: "Test",
      })
    ).rejects.toThrow("fail 3");

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("times out slow requests", async () => {
    // Simulate a slow fetch that respects AbortSignal
    mockFetch.mockImplementation(
      (_url: string, init?: RequestInit) =>
        new Promise((resolve, reject) => {
          const timer = setTimeout(() => resolve(okResponse()), 5000);
          init?.signal?.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        })
    );

    await expect(
      fetchWithRetry("https://example.com", {
        timeoutMs: 100,
        retries: 0,
        label: "Test",
      })
    ).rejects.toThrow();
  });

  it("respects retries: 0 (no retries)", async () => {
    mockFetch.mockRejectedValueOnce(new Error("fail"));

    await expect(
      fetchWithRetry("https://example.com", {
        retries: 0,
        label: "Test",
      })
    ).rejects.toThrow("fail");

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
