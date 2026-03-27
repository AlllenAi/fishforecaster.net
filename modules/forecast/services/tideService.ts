// ─── NOAA CO-OPS Tide Service ────────────────────────────────
//
// This service fetches tide predictions from NOAA (National Oceanic and
// Atmospheric Administration). Tides are one of the most important factors
// for saltwater fishing — fish feed most actively when water is moving
// (incoming or outgoing tide), not during slack tide (when the water is still).
//
// The API is free and requires no API key.
// Docs: https://api.tidesandcurrents.noaa.gov/api/prod/

import type { TideData, TidePrediction } from "../types/weather.types";
import { formatDateForNOAA } from "../lib/utils";
import { fetchWithRetry } from "../lib/fetchWithRetry";

const NOAA_BASE_URL =
  "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";

// Simple in-memory cache to avoid hitting NOAA repeatedly for the same data.
// The key is "stationId-date" and the value is the parsed tide data.
const tideCache = new Map<string, { data: TideData; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// ─── Main Function ──────────────────────────────────────────

export async function getTideData(
  stationId: string,
  date: Date
): Promise<TideData | null> {
  const cacheKey = `${stationId}-${formatDateForNOAA(date)}`;

  // Check cache first
  const cached = tideCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // We fetch 2 days of data so we can calculate tide direction
    // at the end of day 1 (we need to know what comes next)
    const beginDate = formatDateForNOAA(date);
    const endDate = formatDateForNOAA(
      new Date(date.getTime() + 24 * 60 * 60 * 1000)
    );

    const url = new URL(NOAA_BASE_URL);
    url.searchParams.set("station", stationId);
    url.searchParams.set("begin_date", beginDate);
    url.searchParams.set("end_date", endDate);
    url.searchParams.set("product", "predictions");
    url.searchParams.set("datum", "MLLW"); // Mean Lower Low Water (reference point)
    url.searchParams.set("units", "english"); // feet, not meters
    url.searchParams.set("time_zone", "lst_ldt"); // local time with daylight saving
    url.searchParams.set("format", "json");
    url.searchParams.set("interval", "hilo"); // only high/low points, not every 6 min

    const response = await fetchWithRetry(url.toString(), {
      label: "NOAA Tides",
      timeoutMs: 10_000,
      retries: 2,
    });

    if (!response.ok) {
      console.error(
        `NOAA API error for station ${stationId}: ${response.status}`
      );
      return null;
    }

    const json = await response.json();

    // NOAA returns { predictions: [...] } on success
    // or { error: { message: "..." } } on failure
    if (json.error) {
      console.error(`NOAA API error: ${json.error.message}`);
      return null;
    }

    if (!json.predictions || json.predictions.length === 0) {
      console.error(`No tide predictions for station ${stationId}`);
      return null;
    }

    // Parse the raw NOAA response into our typed structure
    const predictions: TidePrediction[] = json.predictions.map(
      (p: { t: string; v: string; type: string }) => ({
        time: new Date(p.t),
        height: parseFloat(p.v),
        type: p.type === "H" ? "H" : "L",
      })
    );

    // Calculate derived values
    const now = new Date();
    const tideData = calculateTideDerivedValues(stationId, predictions, now);

    // Cache the result
    tideCache.set(cacheKey, { data: tideData, timestamp: Date.now() });

    return tideData;
  } catch (error) {
    console.error(`Failed to fetch tide data for station ${stationId}:`, error);
    return null;
  }
}

// ─── Calculate Derived Values ───────────────────────────────
//
// From the raw high/low predictions, we figure out:
// - Which direction the tide is going right now (incoming/outgoing)
// - How fast the water is moving (feet per hour)
// - When the next tide change happens

function calculateTideDerivedValues(
  stationId: string,
  predictions: TidePrediction[],
  now: Date
): TideData {
  // Find the two predictions that bracket "now"
  // (the one before now and the one after now)
  let prevTide: TidePrediction | null = null;
  let nextTide: TidePrediction | null = null;

  for (let i = 0; i < predictions.length; i++) {
    if (predictions[i].time > now) {
      nextTide = predictions[i];
      prevTide = i > 0 ? predictions[i - 1] : null;
      break;
    }
  }

  // Tide direction: if next tide is High, water is rising (INCOMING)
  // If next tide is Low, water is falling (OUTGOING)
  let currentDirection: TideData["currentDirection"] = "SLACK";
  if (nextTide) {
    currentDirection = nextTide.type === "H" ? "INCOMING" : "OUTGOING";
  }

  // Minutes until next tide change
  let nextChange: TideData["nextChange"] = null;
  if (nextTide) {
    const minutesUntil = Math.round(
      (nextTide.time.getTime() - now.getTime()) / (1000 * 60)
    );
    // If we're within 30 minutes of a tide change, it's basically slack
    if (minutesUntil <= 30) {
      currentDirection = "SLACK";
    }
    nextChange = {
      type: nextTide.type,
      time: nextTide.time,
      minutesUntil,
    };
  }

  // Tide swing: difference between the previous high and low
  let tideSwing = 0;
  if (prevTide && nextTide) {
    tideSwing = Math.abs(nextTide.height - prevTide.height);
  }

  // Movement rate: how many feet per hour the tide is changing
  let movementRate = 0;
  if (prevTide && nextTide) {
    const hoursBetween =
      (nextTide.time.getTime() - prevTide.time.getTime()) / (1000 * 60 * 60);
    if (hoursBetween > 0) {
      movementRate = Math.abs(nextTide.height - prevTide.height) / hoursBetween;
    }
  }

  // Estimate current height using linear interpolation
  let currentHeight = 0;
  if (prevTide && nextTide) {
    const totalTime = nextTide.time.getTime() - prevTide.time.getTime();
    const elapsed = now.getTime() - prevTide.time.getTime();
    const progress = totalTime > 0 ? elapsed / totalTime : 0;
    currentHeight =
      prevTide.height + (nextTide.height - prevTide.height) * progress;
  }

  return {
    stationId,
    predictions,
    currentDirection,
    currentHeight,
    nextChange,
    movementRate,
    tideSwing,
  };
}
