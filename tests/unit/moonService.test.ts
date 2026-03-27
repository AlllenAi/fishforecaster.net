import { describe, it, expect } from "vitest";
import {
  getMoonPhaseData,
  weatherApiMoonPhaseToEnum,
} from "@/modules/forecast/services/moonService";

describe("getMoonPhaseData", () => {
  it("returns valid moon phase data for any date", () => {
    const data = getMoonPhaseData(new Date("2025-01-01"));

    expect(data.phase).toBeDefined();
    expect(data.illumination).toBeGreaterThanOrEqual(0);
    expect(data.illumination).toBeLessThanOrEqual(100);
    expect(data.daysSinceNewMoon).toBeGreaterThanOrEqual(0);
    expect(data.daysSinceNewMoon).toBeLessThan(30);
    expect(typeof data.fishingScoreBoost).toBe("number");
  });

  it("returns NEW phase near a known new moon date", () => {
    // Jan 29, 2025 was a new moon
    const data = getMoonPhaseData(new Date("2025-01-29T12:00:00Z"));
    expect(data.phase).toBe("NEW");
    expect(data.illumination).toBeLessThan(10);
  });

  it("returns FULL phase near a known full moon date", () => {
    // Jan 14, 2025 midday falls in the FULL moon window
    const data = getMoonPhaseData(new Date("2025-01-14T12:00:00Z"));
    expect(data.phase).toBe("FULL");
    expect(data.illumination).toBeGreaterThan(90);
  });

  it("gives highest fishing boost for NEW moon", () => {
    const newMoon = getMoonPhaseData(new Date("2025-01-29T12:00:00Z"));
    const quarter = getMoonPhaseData(new Date("2025-01-06T12:00:00Z"));

    expect(newMoon.fishingScoreBoost).toBeGreaterThan(
      quarter.fishingScoreBoost
    );
  });

  it("handles dates far in the past", () => {
    const data = getMoonPhaseData(new Date("1990-06-15"));
    expect(data.phase).toBeDefined();
    expect(data.daysSinceNewMoon).toBeGreaterThanOrEqual(0);
  });

  it("handles dates in the future", () => {
    const data = getMoonPhaseData(new Date("2030-12-25"));
    expect(data.phase).toBeDefined();
    expect(data.daysSinceNewMoon).toBeGreaterThanOrEqual(0);
  });
});

describe("weatherApiMoonPhaseToEnum", () => {
  it("maps standard phase names", () => {
    expect(weatherApiMoonPhaseToEnum("New Moon")).toBe("NEW");
    expect(weatherApiMoonPhaseToEnum("Full Moon")).toBe("FULL");
    expect(weatherApiMoonPhaseToEnum("Waxing Crescent")).toBe(
      "WAXING_CRESCENT"
    );
    expect(weatherApiMoonPhaseToEnum("First Quarter")).toBe("FIRST_QUARTER");
    expect(weatherApiMoonPhaseToEnum("Waxing Gibbous")).toBe("WAXING_GIBBOUS");
    expect(weatherApiMoonPhaseToEnum("Waning Gibbous")).toBe("WANING_GIBBOUS");
    expect(weatherApiMoonPhaseToEnum("Waning Crescent")).toBe(
      "WANING_CRESCENT"
    );
  });

  it("maps Third Quarter to LAST_QUARTER", () => {
    expect(weatherApiMoonPhaseToEnum("Third Quarter")).toBe("LAST_QUARTER");
    expect(weatherApiMoonPhaseToEnum("Last Quarter")).toBe("LAST_QUARTER");
  });

  it("defaults to NEW for unknown phase names", () => {
    expect(weatherApiMoonPhaseToEnum("Unknown Phase")).toBe("NEW");
    expect(weatherApiMoonPhaseToEnum("")).toBe("NEW");
  });
});
