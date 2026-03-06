// ─── Bite Score Engine V1 ───────────────────────────────────
//
// This is the heart of The Fish Forecaster. It takes all the data from
// our services (tides, buoy, weather, moon) and produces:
//   1. An overall "bite score" from 0-100
//   2. Per-species scores (some fish prefer different conditions)
//   3. A label (POOR / FAIR / GOOD / EXCELLENT)
//   4. A confidence level based on how much data we actually have
//
// The scoring uses a weighted average — each factor gets a score from 0-100,
// then we multiply by its weight (importance) and add them all up.

import type { TideData, BuoyData, WeatherData, MoonPhaseData } from "../types/weather.types";
import type { ScoreLabelType, ConfidenceType, FactorScore, SpeciesScore } from "../types/scoring.types";
import {
  SALTWATER_WEIGHTS,
  FRESHWATER_WEIGHTS,
  SPECIES_TEMP_RANGES,
  WIND_THRESHOLDS,
  SWELL_SCORING,
  scoreToLabel,
} from "../lib/constants";
import { clamp, mapRange, parseTimeString } from "../lib/utils";

// Input: all the data we've collected (some may be null if unavailable)
export type ScoreInput = {
  waterType: "SALT" | "FRESH";
  tideData: TideData | null;
  buoyData: BuoyData | null;
  weatherData: WeatherData | null;
  moonData: MoonPhaseData;
  species: string[];
  date: Date;
};

// Output: the calculated scores
export type ScoreOutput = {
  overallScore: number;
  label: ScoreLabelType;
  confidence: ConfidenceType;
  factorScores: FactorScore[];
  speciesScores: SpeciesScore[];
};

// ─── Main Scoring Function ──────────────────────────────────

export function calculateBiteScore(input: ScoreInput): ScoreOutput {
  const { waterType } = input;

  // Calculate individual factor scores
  const factorScores =
    waterType === "SALT"
      ? calculateSaltwaterFactors(input)
      : calculateFreshwaterFactors(input);

  // Weighted average: multiply each factor's score by its weight, sum them up
  const overallScore = Math.round(
    factorScores.reduce((total, f) => total + f.score * f.weight, 0)
  );

  const label = scoreToLabel(clamp(overallScore, 0, 100));
  const confidence = calculateConfidence(input);

  // Calculate per-species scores
  const speciesScores = calculateSpeciesScores(input);

  return {
    overallScore: clamp(overallScore, 0, 100),
    label,
    confidence,
    factorScores,
    speciesScores,
  };
}

// ─── Saltwater Factor Scoring ───────────────────────────────

function calculateSaltwaterFactors(input: ScoreInput): FactorScore[] {
  const w = SALTWATER_WEIGHTS;

  return [
    {
      factor: "Tide Movement",
      score: scoreTideMovement(input.tideData),
      weight: w.tideMovement,
      details: getTideDetails(input.tideData),
    },
    {
      factor: "Swell",
      score: scoreSwell(input.buoyData),
      weight: w.swell,
      details: getSwellDetails(input.buoyData),
    },
    {
      factor: "Water Temperature",
      score: scoreWaterTemp(input.buoyData, input.species),
      weight: w.waterTemp,
      details: getWaterTempDetails(input.buoyData),
    },
    {
      factor: "Wind",
      score: scoreWind(input.buoyData, input.weatherData),
      weight: w.wind,
      details: getWindDetails(input.buoyData, input.weatherData),
    },
    {
      factor: "Barometric Pressure",
      score: scorePressure(input.buoyData, input.weatherData),
      weight: w.pressure,
      details: getPressureDetails(input.buoyData),
    },
    {
      factor: "Moon Phase",
      score: scoreMoonPhase(input.moonData),
      weight: w.moonPhase,
      details: `${input.moonData.phase.replace(/_/g, " ")} (${input.moonData.illumination}% illuminated)`,
    },
    {
      factor: "Cloud Cover",
      score: scoreCloudCover(input.weatherData, input.date),
      weight: w.cloudCover,
      details: getCloudDetails(input.weatherData),
    },
    {
      factor: "Light Conditions",
      score: scoreLightConditions(input.weatherData, input.date),
      weight: w.lightConditions,
      details: getLightDetails(input.weatherData, input.date),
    },
  ];
}

// ─── Freshwater Factor Scoring ──────────────────────────────

function calculateFreshwaterFactors(input: ScoreInput): FactorScore[] {
  const w = FRESHWATER_WEIGHTS;

  return [
    {
      factor: "Water Temperature",
      score: scoreWaterTemp(input.buoyData, input.species),
      weight: w.waterTemp,
      details: getWaterTempDetails(input.buoyData),
    },
    {
      factor: "Barometric Pressure",
      score: scorePressure(input.buoyData, input.weatherData),
      weight: w.pressure,
      details: getPressureDetails(input.buoyData),
    },
    {
      factor: "Wind",
      score: scoreFreshwaterWind(input.weatherData),
      weight: w.wind,
      details: getWindDetails(null, input.weatherData),
    },
    {
      factor: "Moon Phase",
      score: scoreMoonPhase(input.moonData),
      weight: w.moonPhase,
      details: `${input.moonData.phase.replace(/_/g, " ")} (${input.moonData.illumination}% illuminated)`,
    },
    {
      factor: "Cloud Cover",
      score: scoreCloudCover(input.weatherData, input.date),
      weight: w.cloudCover,
      details: getCloudDetails(input.weatherData),
    },
    {
      factor: "Light Conditions",
      score: scoreLightConditions(input.weatherData, input.date),
      weight: w.lightConditions,
      details: getLightDetails(input.weatherData, input.date),
    },
    {
      factor: "Air Temperature",
      score: scoreAirTemp(input.weatherData),
      weight: w.airTemp,
      details: input.weatherData ? `${input.weatherData.current.tempF}°F` : "No data",
    },
    {
      factor: "Season",
      score: scoreSeason(input.date),
      weight: w.season,
      details: getSeasonDetails(input.date),
    },
  ];
}

// ─── Individual Factor Scoring Functions ────────────────────

// TIDE MOVEMENT: Strong tidal movement = better fishing
function scoreTideMovement(tide: TideData | null): number {
  if (!tide) return 50; // no data, assume average

  // Peak movement is 2 hours before/after a tide change
  if (tide.nextChange) {
    const minutesUntil = tide.nextChange.minutesUntil;
    // 30-180 minutes before change = peak fishing (score 80-100)
    if (minutesUntil >= 30 && minutesUntil <= 180) {
      return Math.round(mapRange(minutesUntil, 30, 180, 100, 80));
    }
    // Slack tide (within 30 min of change) = poor (score 20)
    if (minutesUntil < 30) return 20;
    // Far from tide change = moderate
    return Math.round(mapRange(minutesUntil, 180, 360, 80, 50));
  }

  // Use movement rate as fallback
  // Good movement: > 0.5 ft/hr
  return Math.round(mapRange(tide.movementRate, 0, 1, 30, 100));
}

// SWELL: 2-5ft at 10+ second period = ideal
function scoreSwell(buoy: BuoyData | null): number {
  if (!buoy) return 50;

  const height = buoy.latest.waveHeight;
  const period = buoy.latest.dominantWavePeriod;

  // Flat water
  if (height < 1) return 40;
  // Dangerous/unfishable
  if (height > SWELL_SCORING.maxHeight) return 20;
  // Ideal conditions
  if (
    height >= SWELL_SCORING.idealHeightMin &&
    height <= SWELL_SCORING.idealHeightMax &&
    period >= SWELL_SCORING.idealPeriodMin
  ) {
    return 100;
  }
  // Good but not perfect
  if (height >= SWELL_SCORING.idealHeightMin && height <= SWELL_SCORING.idealHeightMax) {
    return period >= 7 ? 80 : 60;
  }
  // Too big but manageable
  if (height > SWELL_SCORING.idealHeightMax) {
    return Math.round(mapRange(height, 5, 8, 60, 20));
  }
  // Small but fishable
  return Math.round(mapRange(height, 0, 2, 40, 70));
}

// WATER TEMPERATURE: Score based on average optimal range for the zone's species
function scoreWaterTemp(buoy: BuoyData | null, species: string[]): number {
  if (!buoy || buoy.latest.waterTemp === 0) return 50;

  const waterTemp = buoy.latest.waterTemp;

  // Average the optimal ranges for all species in this zone
  const ranges = species
    .map((s) => SPECIES_TEMP_RANGES[s])
    .filter(Boolean);

  if (ranges.length === 0) return 50;

  const avgMin = ranges.reduce((sum, r) => sum + r.min, 0) / ranges.length;
  const avgMax = ranges.reduce((sum, r) => sum + r.max, 0) / ranges.length;

  // Within optimal range = 100
  if (waterTemp >= avgMin && waterTemp <= avgMax) return 100;
  // Within 5°F = 60
  if (waterTemp >= avgMin - 5 && waterTemp <= avgMax + 5) return 60;
  // Within 10°F = 30
  if (waterTemp >= avgMin - 10 && waterTemp <= avgMax + 10) return 30;
  // Way outside = 10
  return 10;
}

// WIND (Saltwater): 0-10kt ideal, degrades from there
function scoreWind(buoy: BuoyData | null, weather: WeatherData | null): number {
  const windSpeed = buoy?.latest.windSpeed ?? weather?.current.windMph ?? null;
  if (windSpeed === null) return 50;

  if (windSpeed <= WIND_THRESHOLDS.ideal) return 100;
  if (windSpeed <= WIND_THRESHOLDS.decent) return 70;
  if (windSpeed <= WIND_THRESHOLDS.poor) return 40;
  return 10; // 20+ knots
}

// WIND (Freshwater): Light wind that creates ripple is actually good
function scoreFreshwaterWind(weather: WeatherData | null): number {
  if (!weather) return 50;
  const wind = weather.current.windMph;

  // 3-8 mph = perfect ripple on the water (fish can't see you)
  if (wind >= 3 && wind <= 8) return 100;
  // 0-3 mph = too calm (fish are spooky)
  if (wind < 3) return 50;
  // 8-15 mph = acceptable
  if (wind <= 15) return 60;
  // 15+ = too much
  return Math.round(mapRange(wind, 15, 25, 40, 10));
}

// BAROMETRIC PRESSURE: Falling pressure = fish feed aggressively
function scorePressure(buoy: BuoyData | null, weather: WeatherData | null): number {
  const trend = buoy?.pressureTrendLabel;

  if (trend === "FALLING") return 100;
  if (trend === "STABLE") return 70;
  if (trend === "RISING") return 50;

  // If no buoy data, try to infer from weather pressure
  if (weather && weather.current.pressureMb > 0) {
    // Low pressure systems are generally better for fishing
    const pressure = weather.current.pressureMb;
    if (pressure < 1010) return 85; // Low pressure
    if (pressure < 1015) return 70; // Normal
    if (pressure < 1020) return 60; // Slightly high
    return 50; // High pressure
  }

  return 50; // no data
}

// MOON PHASE: New moon and full moon are best for fishing
function scoreMoonPhase(moon: MoonPhaseData): number {
  // Base score of 50, plus the phase boost (0-15 points), scaled to 0-100
  return clamp(50 + moon.fishingScoreBoost * 3.33, 0, 100);
}

// CLOUD COVER: Overcast is generally better for fishing
function scoreCloudCover(weather: WeatherData | null, date: Date): number {
  if (!weather) return 50;

  const clouds = weather.current.cloudCover;
  const hour = date.getHours();

  // At dawn/dusk, cloud cover doesn't matter as much
  if (hour < 7 || hour > 18) return 70;

  // During midday, overcast is better (fish aren't spooked by shadows)
  if (clouds >= 70) return 90; // overcast = great
  if (clouds >= 40) return 70; // partly cloudy = good
  return 40; // clear midday = fish go deep
}

// LIGHT CONDITIONS: Low light (dawn/dusk) is prime time
function scoreLightConditions(weather: WeatherData | null, date: Date): number {
  const hour = date.getHours();

  // If we have sunrise/sunset data, use it
  if (weather?.astronomy) {
    const sunrise = parseTimeString(weather.astronomy.sunrise);
    const sunset = parseTimeString(weather.astronomy.sunset);

    // Dawn: sunrise ± 1 hour
    if (Math.abs(hour - sunrise.hours) <= 1) return 100;
    // Dusk: sunset ± 1 hour
    if (Math.abs(hour - sunset.hours) <= 1) return 100;
    // Golden hour (1-2 hours after sunrise or before sunset)
    if (hour >= sunrise.hours + 1 && hour <= sunrise.hours + 2) return 90;
    if (hour >= sunset.hours - 2 && hour <= sunset.hours - 1) return 90;
  }

  // Fallback: estimate by hour
  if (hour >= 5 && hour <= 7) return 100; // dawn
  if (hour >= 17 && hour <= 19) return 100; // dusk
  if (hour >= 7 && hour <= 9) return 90; // golden morning
  if (hour >= 15 && hour <= 17) return 90; // golden afternoon
  if (hour >= 20 || hour <= 4) return 60; // night
  return 40; // midday
}

// AIR TEMPERATURE (freshwater only): Comfort proxy
function scoreAirTemp(weather: WeatherData | null): number {
  if (!weather) return 50;
  const temp = weather.current.tempF;

  if (temp >= 60 && temp <= 80) return 100; // comfortable
  if (temp >= 50 && temp <= 90) return 70;
  if (temp >= 40 && temp <= 95) return 40;
  return 20; // extreme temps
}

// SEASON (freshwater only): Spring/Fall are peak fishing
function scoreSeason(date: Date): number {
  const month = date.getMonth(); // 0 = Jan, 11 = Dec

  // Spring (Mar-May) and Fall (Sep-Nov) = best
  if ([2, 3, 4, 8, 9, 10].includes(month)) return 90;
  // Summer (Jun-Aug) = early/late day good
  if ([5, 6, 7].includes(month)) return 70;
  // Winter (Dec-Feb) = slow
  return 40;
}

// ─── Confidence Calculation ─────────────────────────────────

function calculateConfidence(input: ScoreInput): ConfidenceType {
  let missingSources = 0;

  if (input.waterType === "SALT") {
    if (!input.tideData) missingSources++;
    if (!input.buoyData) missingSources++;
    if (!input.weatherData) missingSources++;
  } else {
    // Freshwater doesn't use tide or buoy
    if (!input.weatherData) missingSources++;
  }

  if (missingSources === 0) return "HIGH";
  if (missingSources === 1) return "MEDIUM";
  return "LOW";
}

// ─── Per-Species Scoring ────────────────────────────────────

function calculateSpeciesScores(input: ScoreInput): SpeciesScore[] {
  const waterTemp = input.buoyData?.latest.waterTemp ?? null;

  return input.species.map((species) => {
    const range = SPECIES_TEMP_RANGES[species];
    if (!range) {
      return {
        species,
        score: 50,
        label: "FAIR" as ScoreLabelType,
        optimalTempRange: [60, 75] as [number, number],
        currentWaterTemp: waterTemp,
      };
    }

    let tempScore = 50;
    if (waterTemp !== null && waterTemp > 0) {
      if (waterTemp >= range.min && waterTemp <= range.max) tempScore = 100;
      else if (waterTemp >= range.min - 5 && waterTemp <= range.max + 5) tempScore = 60;
      else if (waterTemp >= range.min - 10 && waterTemp <= range.max + 10) tempScore = 30;
      else tempScore = 10;
    }

    // Species score = blend of water temp (60%) and overall conditions (40%)
    const overallBase = input.weatherData ? scoreWind(input.buoyData, input.weatherData) : 50;
    const score = clamp(Math.round(tempScore * 0.6 + overallBase * 0.4), 0, 100);

    return {
      species,
      score,
      label: scoreToLabel(score),
      optimalTempRange: [range.min, range.max] as [number, number],
      currentWaterTemp: waterTemp,
    };
  });
}

// ─── Detail Text Helpers ────────────────────────────────────

function getTideDetails(tide: TideData | null): string {
  if (!tide) return "No tide data available";
  const dir = tide.currentDirection.toLowerCase();
  if (tide.nextChange) {
    return `${dir} tide, ${tide.nextChange.minutesUntil} min until ${tide.nextChange.type === "H" ? "high" : "low"} tide`;
  }
  return `${dir} tide`;
}

function getSwellDetails(buoy: BuoyData | null): string {
  if (!buoy) return "No buoy data available";
  return `${buoy.latest.waveHeight.toFixed(1)}ft @ ${buoy.latest.dominantWavePeriod}s (${buoy.swellQuality.toLowerCase()})`;
}

function getWaterTempDetails(buoy: BuoyData | null): string {
  if (!buoy || buoy.latest.waterTemp === 0) return "No water temp data";
  return `${buoy.latest.waterTemp.toFixed(1)}°F`;
}

function getWindDetails(buoy: BuoyData | null, weather: WeatherData | null): string {
  if (buoy) {
    return `${buoy.latest.windSpeed.toFixed(1)} kt from ${buoy.latest.windDirection}°`;
  }
  if (weather) {
    return `${weather.current.windMph} mph ${weather.current.windDir}`;
  }
  return "No wind data";
}

function getPressureDetails(buoy: BuoyData | null): string {
  if (!buoy) return "No pressure data";
  return `${buoy.latest.pressure} hPa (${buoy.pressureTrendLabel.toLowerCase()})`;
}

function getCloudDetails(weather: WeatherData | null): string {
  if (!weather) return "No cloud data";
  return `${weather.current.cloudCover}% cloud cover`;
}

function getLightDetails(weather: WeatherData | null, date: Date): string {
  const hour = date.getHours();
  if (weather?.astronomy) {
    return `Sunrise ${weather.astronomy.sunrise}, Sunset ${weather.astronomy.sunset}`;
  }
  if (hour >= 5 && hour <= 7) return "Dawn - prime time";
  if (hour >= 17 && hour <= 19) return "Dusk - prime time";
  if (hour >= 10 && hour <= 14) return "Midday - less ideal";
  return "Moderate light conditions";
}

function getSeasonDetails(date: Date): string {
  const month = date.getMonth();
  if ([2, 3, 4].includes(month)) return "Spring - peak season";
  if ([5, 6, 7].includes(month)) return "Summer - fish early/late";
  if ([8, 9, 10].includes(month)) return "Fall - peak season";
  return "Winter - slow season";
}
