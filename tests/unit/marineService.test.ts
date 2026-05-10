import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/modules/forecast/lib/fetchWithRetry");

import { getMarineData } from "@/modules/forecast/services/marineService";
import { fetchWithRetry } from "@/modules/forecast/lib/fetchWithRetry";

const mockFetch = vi.mocked(fetchWithRetry);

// Build a fake NOAA alerts API response
function makeNWSResponse(
  events: { event: string; severity?: string; headline?: string }[]
) {
  return {
    ok: true,
    json: async () => ({
      features: events.map((e) => ({
        properties: {
          event: e.event,
          severity: e.severity ?? "Moderate",
          headline: e.headline ?? "",
          description: "",
          expires: null,
        },
      })),
    }),
  } as unknown as Response;
}

describe("marineService – small craft advisory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects a small craft advisory and sets hasAdvisory to true", async () => {
    mockFetch.mockResolvedValueOnce(
      makeNWSResponse([
        {
          event: "Small Craft Advisory",
          severity: "Moderate",
          headline: "Winds 15 to 20 kt with gusts up to 25 kt.",
        },
      ])
    );

    const result = await getMarineData(33.01, -117.01);

    expect(result).not.toBeNull();
    expect(result!.hasAdvisory).toBe(true);
    expect(result!.hasGaleWarning).toBe(false);
    expect(result!.hasStormWarning).toBe(false);
    expect(result!.alerts).toHaveLength(1);
    expect(result!.alerts[0].event).toBe("Small Craft Advisory");
  });

  it("does not count small craft advisory as a gale or storm warning", async () => {
    mockFetch.mockResolvedValueOnce(
      makeNWSResponse([{ event: "Small Craft Advisory" }])
    );

    const result = await getMarineData(33.02, -117.02);

    expect(result!.hasGaleWarning).toBe(false);
    expect(result!.hasStormWarning).toBe(false);
  });

  it("filters out non-marine alerts like tornado and flood warnings", async () => {
    mockFetch.mockResolvedValueOnce(
      makeNWSResponse([
        { event: "Tornado Warning" },
        { event: "Flood Watch" },
        { event: "Small Craft Advisory" },
      ])
    );

    const result = await getMarineData(33.03, -117.03);

    expect(result!.alerts).toHaveLength(1);
    expect(result!.alerts[0].event).toBe("Small Craft Advisory");
  });

  it("returns hasAdvisory false when no marine alerts are active", async () => {
    mockFetch.mockResolvedValueOnce(makeNWSResponse([]));

    const result = await getMarineData(33.04, -117.04);

    expect(result).not.toBeNull();
    expect(result!.hasAdvisory).toBe(false);
    expect(result!.alerts).toHaveLength(0);
  });

  it("correctly identifies gale warning alongside a small craft advisory", async () => {
    mockFetch.mockResolvedValueOnce(
      makeNWSResponse([
        { event: "Small Craft Advisory" },
        { event: "Gale Warning", severity: "Severe" },
      ])
    );

    const result = await getMarineData(33.05, -117.05);

    expect(result!.hasAdvisory).toBe(true);
    expect(result!.hasGaleWarning).toBe(true);
    expect(result!.hasStormWarning).toBe(false);
    expect(result!.alerts).toHaveLength(2);
  });

  it("returns null when the network request fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await getMarineData(33.06, -117.06);

    expect(result).toBeNull();
  });
});
