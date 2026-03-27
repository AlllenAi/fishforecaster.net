import { describe, it, expect } from "vitest";
import { calculateBiteScore, type ScoreInput } from "@/modules/forecast/services/scoreEngine";
import type { TideData, BuoyData, WeatherData, MoonPhaseData } from "@/modules/forecast/types/weather.types";

// ─── Test Data Builders ──────────────────────────────────────

function makeMoonData(overrides?: Partial<MoonPhaseData>): MoonPhaseData {
  return {
    phase: "NEW",
    illumination: 0,
    daysSinceNewMoon: 0,
    fishingScoreBoost: 15,
    ...overrides,
  };
}

function makeBuoyData(overrides?: Partial<BuoyData>): BuoyData {
  return {
    buoyId: "46232",
    latest: {
      timestamp: new Date(),
      windSpeed: 5,
      windDirection: 180,
      gustSpeed: 8,
      waveHeight: 3,
      dominantWavePeriod: 12,
      averageWavePeriod: 8,
      waterTemp: 65,
      airTemp: 68,
      pressure: 1013,
      pressureTrend: -1.5,
    },
    pressureTrendLabel: "FALLING",
    swellQuality: "CLEAN",
    windTrend: "STABLE",
    ...overrides,
  };
}

function makeWeatherData(overrides?: Partial<WeatherData>): WeatherData {
  return {
    current: {
      tempF: 68,
      windMph: 8,
      windDir: "NW",
      pressureMb: 1012,
      humidity: 65,
      cloudCover: 60,
      feelsLikeF: 66,
      uvIndex: 5,
    },
    hourlyForecast: [],
    astronomy: {
      sunrise: "06:15 AM",
      sunset: "07:30 PM",
      moonPhase: "New Moon",
      moonIllumination: 0,
    },
    ...overrides,
  };
}

function makeTideData(overrides?: Partial<TideData>): TideData {
  return {
    stationId: "9410170",
    predictions: [],
    currentDirection: "INCOMING",
    currentHeight: 3.5,
    nextChange: {
      type: "H",
      time: new Date(),
      minutesUntil: 90,
    },
    movementRate: 0.7,
    tideSwing: 4.2,
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────

describe("calculateBiteScore", () => {
  describe("output shape", () => {
    it("returns a valid score output for saltwater", () => {
      const input: ScoreInput = {
        waterType: "SALT",
        tideData: makeTideData(),
        buoyData: makeBuoyData(),
        weatherData: makeWeatherData(),
        moonData: makeMoonData(),
        species: ["Yellowtail", "Calico Bass"],
        date: new Date("2025-06-15T06:00:00"),
      };

      const result = calculateBiteScore(input);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(["POOR", "FAIR", "GOOD", "EXCELLENT"]).toContain(result.label);
      expect(["LOW", "MEDIUM", "HIGH"]).toContain(result.confidence);
      expect(result.factorScores.length).toBeGreaterThan(0);
      expect(result.speciesScores.length).toBe(2);
    });

    it("returns a valid score output for freshwater", () => {
      const input: ScoreInput = {
        waterType: "FRESH",
        tideData: null,
        buoyData: null,
        weatherData: makeWeatherData(),
        moonData: makeMoonData(),
        species: ["Largemouth Bass", "Trout"],
        date: new Date("2025-04-10T06:00:00"),
      };

      const result = calculateBiteScore(input);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.speciesScores.length).toBe(2);
    });
  });

  describe("confidence levels", () => {
    it("returns HIGH confidence when all data sources are available (saltwater)", () => {
      const input: ScoreInput = {
        waterType: "SALT",
        tideData: makeTideData(),
        buoyData: makeBuoyData(),
        weatherData: makeWeatherData(),
        moonData: makeMoonData(),
        species: ["Yellowtail"],
        date: new Date("2025-06-15T06:00:00"),
      };

      expect(calculateBiteScore(input).confidence).toBe("HIGH");
    });

    it("returns MEDIUM confidence when one data source is missing", () => {
      const input: ScoreInput = {
        waterType: "SALT",
        tideData: null,
        buoyData: makeBuoyData(),
        weatherData: makeWeatherData(),
        moonData: makeMoonData(),
        species: ["Yellowtail"],
        date: new Date("2025-06-15T06:00:00"),
      };

      expect(calculateBiteScore(input).confidence).toBe("MEDIUM");
    });

    it("returns LOW confidence when multiple data sources are missing", () => {
      const input: ScoreInput = {
        waterType: "SALT",
        tideData: null,
        buoyData: null,
        weatherData: makeWeatherData(),
        moonData: makeMoonData(),
        species: ["Yellowtail"],
        date: new Date("2025-06-15T06:00:00"),
      };

      expect(calculateBiteScore(input).confidence).toBe("LOW");
    });

    it("returns HIGH confidence for freshwater with just weather data", () => {
      const input: ScoreInput = {
        waterType: "FRESH",
        tideData: null,
        buoyData: null,
        weatherData: makeWeatherData(),
        moonData: makeMoonData(),
        species: ["Bass"],
        date: new Date("2025-06-15T06:00:00"),
      };

      expect(calculateBiteScore(input).confidence).toBe("HIGH");
    });
  });

  describe("scoring logic", () => {
    it("scores higher with ideal conditions than poor conditions", () => {
      const baseInput: Omit<ScoreInput, "buoyData" | "weatherData"> = {
        waterType: "SALT",
        tideData: makeTideData({ nextChange: { type: "H", time: new Date(), minutesUntil: 90 } }),
        moonData: makeMoonData({ phase: "NEW", fishingScoreBoost: 15 }),
        species: ["Yellowtail"],
        date: new Date("2025-06-15T06:00:00"), // dawn
      };

      const ideal = calculateBiteScore({
        ...baseInput,
        buoyData: makeBuoyData({
          latest: {
            timestamp: new Date(),
            windSpeed: 5,
            windDirection: 180,
            gustSpeed: 8,
            waveHeight: 3,
            dominantWavePeriod: 12,
            averageWavePeriod: 8,
            waterTemp: 68,
            airTemp: 68,
            pressure: 1013,
            pressureTrend: -2,
          },
          pressureTrendLabel: "FALLING",
          swellQuality: "CLEAN",
          windTrend: "STABLE",
        }),
        weatherData: makeWeatherData({
          current: {
            tempF: 68,
            windMph: 5,
            windDir: "NW",
            pressureMb: 1008,
            humidity: 65,
            cloudCover: 80,
            feelsLikeF: 66,
            uvIndex: 2,
          },
        }),
      });

      const poor = calculateBiteScore({
        ...baseInput,
        date: new Date("2025-06-15T12:00:00"), // midday
        buoyData: makeBuoyData({
          latest: {
            timestamp: new Date(),
            windSpeed: 25,
            windDirection: 180,
            gustSpeed: 35,
            waveHeight: 9,
            dominantWavePeriod: 5,
            averageWavePeriod: 4,
            waterTemp: 45,
            airTemp: 55,
            pressure: 1025,
            pressureTrend: 3,
          },
          pressureTrendLabel: "RISING",
          swellQuality: "CHOPPY",
          windTrend: "INCREASING",
        }),
        weatherData: makeWeatherData({
          current: {
            tempF: 55,
            windMph: 25,
            windDir: "SW",
            pressureMb: 1025,
            humidity: 30,
            cloudCover: 0,
            feelsLikeF: 50,
            uvIndex: 10,
          },
        }),
        moonData: makeMoonData({ phase: "WAXING_CRESCENT", fishingScoreBoost: 0 }),
      });

      expect(ideal.overallScore).toBeGreaterThan(poor.overallScore);
    });

    it("handles completely missing data gracefully", () => {
      const input: ScoreInput = {
        waterType: "SALT",
        tideData: null,
        buoyData: null,
        weatherData: null,
        moonData: makeMoonData(),
        species: [],
        date: new Date("2025-06-15T12:00:00"),
      };

      const result = calculateBiteScore(input);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.speciesScores).toHaveLength(0);
    });
  });

  describe("factor weights", () => {
    it("saltwater factors include tide and swell", () => {
      const input: ScoreInput = {
        waterType: "SALT",
        tideData: makeTideData(),
        buoyData: makeBuoyData(),
        weatherData: makeWeatherData(),
        moonData: makeMoonData(),
        species: ["Yellowtail"],
        date: new Date("2025-06-15T06:00:00"),
      };

      const result = calculateBiteScore(input);
      const factorNames = result.factorScores.map((f) => f.factor);

      expect(factorNames).toContain("Tide Movement");
      expect(factorNames).toContain("Swell");
    });

    it("freshwater factors include season and air temperature", () => {
      const input: ScoreInput = {
        waterType: "FRESH",
        tideData: null,
        buoyData: null,
        weatherData: makeWeatherData(),
        moonData: makeMoonData(),
        species: ["Bass"],
        date: new Date("2025-04-10T06:00:00"),
      };

      const result = calculateBiteScore(input);
      const factorNames = result.factorScores.map((f) => f.factor);

      expect(factorNames).toContain("Season");
      expect(factorNames).toContain("Air Temperature");
      expect(factorNames).not.toContain("Tide Movement");
      expect(factorNames).not.toContain("Swell");
    });

    it("factor weights sum to 1.0", () => {
      const input: ScoreInput = {
        waterType: "SALT",
        tideData: makeTideData(),
        buoyData: makeBuoyData(),
        weatherData: makeWeatherData(),
        moonData: makeMoonData(),
        species: ["Yellowtail"],
        date: new Date("2025-06-15T06:00:00"),
      };

      const result = calculateBiteScore(input);
      const totalWeight = result.factorScores.reduce(
        (sum, f) => sum + f.weight,
        0
      );

      expect(totalWeight).toBeCloseTo(1.0, 5);
    });
  });

  describe("species scoring", () => {
    it("scores species higher when water temp is in optimal range", () => {
      const input: ScoreInput = {
        waterType: "SALT",
        tideData: makeTideData(),
        buoyData: makeBuoyData({
          latest: {
            timestamp: new Date(),
            windSpeed: 5,
            windDirection: 180,
            gustSpeed: 8,
            waveHeight: 3,
            dominantWavePeriod: 12,
            averageWavePeriod: 8,
            waterTemp: 68, // ideal for Yellowtail (64-74)
            airTemp: 68,
            pressure: 1013,
            pressureTrend: -1,
          },
          pressureTrendLabel: "FALLING",
          swellQuality: "CLEAN",
          windTrend: "STABLE",
        }),
        weatherData: makeWeatherData(),
        moonData: makeMoonData(),
        species: ["Yellowtail"],
        date: new Date("2025-06-15T06:00:00"),
      };

      const result = calculateBiteScore(input);
      const yellowtail = result.speciesScores.find(
        (s) => s.species === "Yellowtail"
      );

      expect(yellowtail).toBeDefined();
      expect(yellowtail!.score).toBeGreaterThanOrEqual(60);
    });

    it("provides default scores for unknown species", () => {
      const input: ScoreInput = {
        waterType: "SALT",
        tideData: null,
        buoyData: null,
        weatherData: null,
        moonData: makeMoonData(),
        species: ["Unknown Space Fish"],
        date: new Date("2025-06-15T06:00:00"),
      };

      const result = calculateBiteScore(input);
      expect(result.speciesScores[0].species).toBe("Unknown Space Fish");
      expect(result.speciesScores[0].score).toBeGreaterThanOrEqual(0);
    });
  });

  describe("label mapping", () => {
    it("maps scores to correct labels", () => {
      // We can verify through the result since we can't import scoreToLabel directly here
      // but we can verify the relationship holds: high scores => EXCELLENT/GOOD
      const ideal: ScoreInput = {
        waterType: "FRESH",
        tideData: null,
        buoyData: makeBuoyData({
          latest: {
            timestamp: new Date(),
            windSpeed: 5,
            windDirection: 180,
            gustSpeed: 8,
            waveHeight: 3,
            dominantWavePeriod: 12,
            averageWavePeriod: 8,
            waterTemp: 72,
            airTemp: 70,
            pressure: 1008,
            pressureTrend: -2,
          },
          pressureTrendLabel: "FALLING",
          swellQuality: "CLEAN",
          windTrend: "STABLE",
        }),
        weatherData: makeWeatherData({
          current: {
            tempF: 70,
            windMph: 5,
            windDir: "NW",
            pressureMb: 1008,
            humidity: 65,
            cloudCover: 80,
            feelsLikeF: 68,
            uvIndex: 2,
          },
        }),
        moonData: makeMoonData({ phase: "NEW", fishingScoreBoost: 15 }),
        species: ["Largemouth Bass"],
        date: new Date("2025-04-15T06:00:00"), // spring dawn
      };

      const result = calculateBiteScore(ideal);

      // With all ideal conditions, should be GOOD or EXCELLENT
      expect(["GOOD", "EXCELLENT"]).toContain(result.label);
    });
  });
});
