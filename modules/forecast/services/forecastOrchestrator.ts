// ─── Forecast Orchestrator ──────────────────────────────────
//
// This is the "conductor" that coordinates all the services.
// When you ask "what's the fishing forecast for San Diego today?",
// this is what runs:
//
//   1. Look up the zone (San Diego → station 9410170, buoy 46232)
//   2. Fetch tide, buoy, and weather data IN PARALLEL (faster!)
//   3. Calculate moon phase
//   4. Run the scoring engine
//   5. Calculate bite windows
//   6. Generate a "captain's call" text summary
//   7. Return the complete forecast
//
// If any data source fails (e.g., a buoy is offline), we still
// produce a forecast — just with lower confidence.

import type { Zone } from "@prisma/client";
import type { ForecastResult, ForecastConditions } from "../types/scoring.types";
import type { TideData, BuoyData, WeatherData } from "../types/weather.types";
import { getTideData } from "./tideService";
import { getBuoyData } from "./buoyService";
import { getWeatherData } from "./weatherService";
import { getMoonPhaseData, weatherApiMoonPhaseToEnum } from "./moonService";
import { calculateBiteScore } from "./scoreEngine";
import { calculateBiteWindows } from "./windowEngine";
import { formatDateISO } from "../lib/utils";

// ─── Main Function ──────────────────────────────────────────

export async function generateForecast(
  zone: Zone,
  date: Date
): Promise<ForecastResult> {
  // Step 1: Fetch all data sources in parallel using Promise.allSettled
  // This means if one fails, the others still complete (unlike Promise.all
  // which would cancel everything if one fails).
  const [tideResult, buoyResult, weatherResult] = await Promise.allSettled([
    // Only fetch tide data for saltwater zones that have a tide station
    zone.tideStationId
      ? getTideData(zone.tideStationId, date)
      : Promise.resolve(null),
    // Only fetch buoy data for zones that have a buoy
    zone.ndbcBuoyId
      ? getBuoyData(zone.ndbcBuoyId)
      : Promise.resolve(null),
    // Weather is available for all zones
    getWeatherData(zone.lat, zone.lon),
  ]);

  // Extract data from settled promises (null if failed)
  const tideData: TideData | null =
    tideResult.status === "fulfilled" ? tideResult.value : null;
  const buoyData: BuoyData | null =
    buoyResult.status === "fulfilled" ? buoyResult.value : null;
  const weatherData: WeatherData | null =
    weatherResult.status === "fulfilled" ? weatherResult.value : null;

  // Step 2: Calculate moon phase (pure math, never fails)
  const moonData = getMoonPhaseData(date);

  // If weather has moon data, use that for the display phase name
  const moonPhase = weatherData?.astronomy.moonPhase
    ? weatherApiMoonPhaseToEnum(weatherData.astronomy.moonPhase)
    : moonData.phase;

  // Step 3: Run the scoring engine
  const scoreResult = calculateBiteScore({
    waterType: zone.waterType as "SALT" | "FRESH",
    tideData,
    buoyData,
    weatherData,
    moonData,
    species: zone.species,
    date,
  });

  // Step 4: Calculate bite windows
  const biteWindows = calculateBiteWindows(tideData, weatherData, moonData, date);

  // Step 5: Build the conditions summary
  const conditions: ForecastConditions = {
    waterTemp: buoyData?.latest.waterTemp ?? null,
    airTemp: weatherData?.current.tempF ?? buoyData?.latest.airTemp ?? null,
    windSpeed: buoyData?.latest.windSpeed ?? weatherData?.current.windMph ?? null,
    windDirection: weatherData?.current.windDir ?? null,
    waveHeight: buoyData?.latest.waveHeight ?? null,
    wavePeriod: buoyData?.latest.dominantWavePeriod ?? null,
    pressure: buoyData?.latest.pressure ?? weatherData?.current.pressureMb ?? null,
    pressureTrend: buoyData?.pressureTrendLabel ?? null,
    cloudCover: weatherData?.current.cloudCover ?? null,
    moonPhase,
    moonIllumination: weatherData?.astronomy.moonIllumination ?? moonData.illumination,
    sunrise: weatherData?.astronomy.sunrise ?? null,
    sunset: weatherData?.astronomy.sunset ?? null,
    tideDirection: tideData?.currentDirection ?? null,
  };

  // Step 6: Generate the captain's call
  const captainCall = generateCaptainCall(
    zone,
    scoreResult.overallScore,
    scoreResult.label,
    conditions,
    biteWindows
  );

  // Step 7: Return complete forecast
  return {
    zoneId: zone.id,
    zoneName: zone.name,
    date: formatDateISO(date),
    score: scoreResult.overallScore,
    label: scoreResult.label,
    confidence: scoreResult.confidence,
    biteWindows,
    conditions,
    captainCall,
    speciesScores: scoreResult.speciesScores,
  };
}

// ─── Captain's Call Generator (V1 — Template-Based) ─────────
//
// This generates a short, friendly text summary. In V2 this could
// use AI to generate more natural-sounding text, but for now we
// use simple templates.

function generateCaptainCall(
  zone: Zone,
  score: number,
  label: string,
  conditions: ForecastConditions,
  biteWindows: ForecastResult["biteWindows"]
): string {
  const parts: string[] = [];

  // Overall assessment
  if (score >= 80) {
    parts.push(`Outstanding conditions at ${zone.name} today!`);
  } else if (score >= 60) {
    parts.push(`Solid fishing day ahead at ${zone.name}.`);
  } else if (score >= 40) {
    parts.push(`Decent conditions at ${zone.name}, but not ideal.`);
  } else {
    parts.push(`Tough day at ${zone.name}. Consider waiting for better conditions.`);
  }

  // Wind info
  if (conditions.windSpeed !== null) {
    if (conditions.windSpeed <= 10) {
      parts.push("Light winds — great for drifting.");
    } else if (conditions.windSpeed <= 15) {
      parts.push("Moderate breeze — watch your drift.");
    } else {
      parts.push("Strong winds — consider sheltered spots.");
    }
  }

  // Water temp info for saltwater
  if (zone.waterType === "SALT" && conditions.waterTemp !== null) {
    parts.push(`Water temps at ${conditions.waterTemp.toFixed(0)}°F.`);
  }

  // Best window recommendation
  if (biteWindows.length > 0) {
    const best = biteWindows[0];
    parts.push(`Best bite window: ${best.start}-${best.end}.`);
  }

  // Tide info for saltwater
  if (conditions.tideDirection) {
    const dir = conditions.tideDirection.toLowerCase();
    parts.push(`Tide is currently ${dir}.`);
  }

  return parts.join(" ");
}
