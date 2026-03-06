// ─── NDBC Buoy Service ──────────────────────────────────────
//
// This service fetches real-time ocean conditions from NDBC (National Data
// Buoy Center) buoys. These are actual physical buoys floating in the ocean
// that measure waves, wind, water temperature, and barometric pressure.
//
// The data comes as a plain text file (not JSON), so we have to parse it
// line by line. Each row is a different time observation.
//
// The API is free and requires no API key.
// Data format docs: https://www.ndbc.noaa.gov/measdes.shtml

import type { BuoyData, BuoyObservation } from "../types/weather.types";
import { celsiusToFahrenheit, msToKnots } from "../lib/utils";

const NDBC_BASE_URL = "https://www.ndbc.noaa.gov/data/realtime2";

// Cache buoy data for 30 minutes (buoys update roughly every hour)
const buoyCache = new Map<string, { data: BuoyData; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// ─── Main Function ──────────────────────────────────────────

export async function getBuoyData(buoyId: string): Promise<BuoyData | null> {
  // Check cache first
  const cached = buoyCache.get(buoyId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // NDBC serves a plain text file for each buoy
    const url = `${NDBC_BASE_URL}/${buoyId}.txt`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`NDBC API error for buoy ${buoyId}: ${response.status}`);
      return null;
    }

    const text = await response.text();
    const observations = parseNDBCText(text);

    if (observations.length === 0) {
      console.error(`No valid observations for buoy ${buoyId}`);
      return null;
    }

    // Get the most recent valid observation
    const latest = observations[0];

    // Calculate trends by comparing recent observations
    const pressureTrendLabel = calculatePressureTrend(observations);
    const swellQuality = calculateSwellQuality(latest);
    const windTrend = calculateWindTrend(observations);

    const buoyData: BuoyData = {
      buoyId,
      latest,
      pressureTrendLabel,
      swellQuality,
      windTrend,
    };

    // Cache the result
    buoyCache.set(buoyId, { data: buoyData, timestamp: Date.now() });

    return buoyData;
  } catch (error) {
    console.error(`Failed to fetch buoy data for ${buoyId}:`, error);
    return null;
  }
}

// ─── Parse NDBC Text Format ─────────────────────────────────
//
// The NDBC text file looks like this:
// #YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP  VIS PTDY  TIDE
// #yr  mo dy hr mn degT m/s  m/s     m   sec   sec degT   hPa  degC  degC  degC  nmi  hPa    ft
// 2024 01 15 18 00 290  5.0  7.0   1.2  12.0   8.0 280 1015.0  15.0  16.5  10.0   MM  -1.2   MM
//
// "MM" means "missing data" — the sensor didn't report a value.

function parseNDBCText(text: string): BuoyObservation[] {
  const lines = text.split("\n");
  const observations: BuoyObservation[] = [];

  for (const line of lines) {
    // Skip header lines (start with #) and empty lines
    if (line.startsWith("#") || line.trim() === "") continue;

    const parts = line.trim().split(/\s+/);
    if (parts.length < 15) continue;

    // Check for missing essential data (MM = missing measurement)
    // We need at least wind or wave data to be useful
    const windSpeedRaw = parts[6];
    const waveHeightRaw = parts[8];

    // Skip rows where both wind and wave are missing
    if (
      (windSpeedRaw === "MM" || windSpeedRaw === "99.0") &&
      (waveHeightRaw === "MM" || waveHeightRaw === "99.0")
    ) {
      continue;
    }

    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
    const day = parseInt(parts[2]);
    const hour = parseInt(parts[3]);
    const minute = parseInt(parts[4]);

    const observation: BuoyObservation = {
      timestamp: new Date(Date.UTC(year, month, day, hour, minute)),
      windDirection: parseNDBCValue(parts[5], 0),
      windSpeed: msToKnots(parseNDBCValue(parts[6], 0)), // Convert m/s to knots
      gustSpeed: msToKnots(parseNDBCValue(parts[7], 0)),
      waveHeight: metersToFeetSafe(parseNDBCValue(parts[8], 0)),
      dominantWavePeriod: parseNDBCValue(parts[9], 0),
      averageWavePeriod: parseNDBCValue(parts[10], 0),
      pressure: parseNDBCValue(parts[12], 0),
      airTemp: celsiusToFahrenheit(parseNDBCValue(parts[13], 0)),
      waterTemp: celsiusToFahrenheit(parseNDBCValue(parts[14], 0)),
      pressureTrend: parseNDBCValue(parts[17], 0),
    };

    observations.push(observation);
  }

  return observations;
}

// Parse a single NDBC value, returning the default if it's "MM" or "99.0"
function parseNDBCValue(value: string, defaultValue: number): number {
  if (value === "MM" || value === "99.0" || value === "999.0" || value === "9999.0") {
    return defaultValue;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Convert meters to feet (local helper)
function metersToFeetSafe(meters: number): number {
  return meters * 3.28084;
}

// ─── Trend Calculations ─────────────────────────────────────

// Compare pressure over the last ~3 hours to determine trend
function calculatePressureTrend(
  observations: BuoyObservation[]
): BuoyData["pressureTrendLabel"] {
  if (observations.length < 2) return "STABLE";

  // Find an observation from roughly 3 hours ago
  const now = observations[0].timestamp.getTime();
  const threeHoursAgo = now - 3 * 60 * 60 * 1000;

  const older = observations.find(
    (o) => o.timestamp.getTime() <= threeHoursAgo && o.pressure > 0
  );

  if (!older || observations[0].pressure === 0) return "STABLE";

  const diff = observations[0].pressure - older.pressure;

  // More than 1 hPa change in 3 hours is significant
  if (diff > 1) return "RISING";
  if (diff < -1) return "FALLING";
  return "STABLE";
}

// Rate the swell quality based on wave height and period
function calculateSwellQuality(
  obs: BuoyObservation
): BuoyData["swellQuality"] {
  // Long period swells (10+ seconds) come from distant storms and are "clean"
  // Short period waves are local wind chop and are "choppy"
  if (obs.dominantWavePeriod >= 10 && obs.waveHeight >= 1 && obs.waveHeight <= 6) {
    return "CLEAN";
  }
  if (obs.dominantWavePeriod >= 7) {
    return "MODERATE";
  }
  return "CHOPPY";
}

// Compare wind speed over recent observations to get trend
function calculateWindTrend(
  observations: BuoyObservation[]
): BuoyData["windTrend"] {
  if (observations.length < 3) return "STABLE";

  // Average of last 3 observations vs 3 older ones
  const recent = observations.slice(0, 3);
  const older = observations.slice(3, 6);

  if (older.length === 0) return "STABLE";

  const recentAvg =
    recent.reduce((sum, o) => sum + o.windSpeed, 0) / recent.length;
  const olderAvg =
    older.reduce((sum, o) => sum + o.windSpeed, 0) / older.length;

  const diff = recentAvg - olderAvg;

  if (diff > 2) return "INCREASING";
  if (diff < -2) return "DECREASING";
  return "STABLE";
}
