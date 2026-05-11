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

describe("marineService – gale warning", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects a gale warning and sets hasGaleWarning to true", async () => {
    mockFetch.mockResolvedValueOnce(
      makeNWSResponse([
        {
          event: "Gale Warning",
          severity: "Severe",
          headline: "Winds 34 to 47 kt expected.",
        },
      ])
    );

    const result = await getMarineData(34.01, -117.01);

    expect(result).not.toBeNull();
    expect(result!.hasGaleWarning).toBe(true);
    expect(result!.hasAdvisory).toBe(false);
    expect(result!.hasStormWarning).toBe(false);
    expect(result!.alerts).toHaveLength(1);
    expect(result!.alerts[0].event).toBe("Gale Warning");
  });

  it("does not count gale warning as a storm warning", async () => {
    mockFetch.mockResolvedValueOnce(
      makeNWSResponse([{ event: "Gale Warning", severity: "Severe" }])
    );

    const result = await getMarineData(34.02, -117.02);

    expect(result!.hasStormWarning).toBe(false);
  });

  it("captures the headline and severity from a gale warning", async () => {
    mockFetch.mockResolvedValueOnce(
      makeNWSResponse([
        {
          event: "Gale Warning",
          severity: "Severe",
          headline: "Gale Warning in effect until 6 AM PST.",
        },
      ])
    );

    const result = await getMarineData(34.03, -117.03);

    expect(result!.alerts[0].severity).toBe("Severe");
    expect(result!.alerts[0].headline).toBe("Gale Warning in effect until 6 AM PST.");
  });
});

describe("marineService – storm warning", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects a storm warning and sets hasStormWarning to true", async () => {
    mockFetch.mockResolvedValueOnce(
      makeNWSResponse([
        {
          event: "Storm Warning",
          severity: "Extreme",
          headline: "Winds 48 kt or greater expected.",
        },
      ])
    );

    const result = await getMarineData(35.01, -117.01);

    expect(result).not.toBeNull();
    expect(result!.hasStormWarning).toBe(true);
    expect(result!.hasGaleWarning).toBe(false);
    expect(result!.hasAdvisory).toBe(false);
    expect(result!.alerts).toHaveLength(1);
    expect(result!.alerts[0].event).toBe("Storm Warning");
  });

  it("detects a hurricane warning as a storm warning", async () => {
    mockFetch.mockResolvedValueOnce(
      makeNWSResponse([
        {
          event: "Hurricane Warning",
          severity: "Extreme",
          headline: "Hurricane Warning in effect.",
        },
      ])
    );

    const result = await getMarineData(35.02, -117.02);

    expect(result!.hasStormWarning).toBe(true);
  });

  it("detects hazardous seas as a storm warning", async () => {
    mockFetch.mockResolvedValueOnce(
      makeNWSResponse([
        {
          event: "Hazardous Seas Warning",
          severity: "Severe",
          headline: "Seas 15 to 20 ft.",
        },
      ])
    );

    const result = await getMarineData(35.03, -117.03);

    expect(result!.hasStormWarning).toBe(true);
  });

  it("escalating alerts: storm + gale + small craft all active at once", async () => {
    mockFetch.mockResolvedValueOnce(
      makeNWSResponse([
        { event: "Storm Warning", severity: "Extreme" },
        { event: "Gale Warning", severity: "Severe" },
        { event: "Small Craft Advisory", severity: "Moderate" },
      ])
    );

    const result = await getMarineData(35.04, -117.04);

    expect(result!.hasStormWarning).toBe(true);
    expect(result!.hasGaleWarning).toBe(true);
    expect(result!.hasAdvisory).toBe(true);
    expect(result!.alerts).toHaveLength(3);
  });
});
