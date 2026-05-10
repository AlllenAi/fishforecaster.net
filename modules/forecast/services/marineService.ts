// ─── NOAA Marine Forecast Service ───────────────────────────
//
// Fetches official marine weather data from NOAA's National Weather Service API.
// This is completely free — no API key required.
//
// We retrieve two things for each saltwater zone:
//   1. Active marine alerts (Small Craft Advisory, Gale Warning, Storm Warning, etc.)
//   2. NWS forecast text ("Northwest winds 15 to 20 knots. Seas 5 to 7 feet.")
//
// The alerts endpoint works for any US coordinate.
// The forecast text endpoint may return a 404 for far-offshore locations — that's
// expected and handled gracefully.
//
// Docs: https://www.weather.gov/documentation/services-web-api

import type { MarineData, MarineAlert } from "../types/weather.types";
import { fetchWithRetry } from "../lib/fetchWithRetry";

const NWS_BASE = "https://api.weather.gov";
const NWS_HEADERS = {
  "User-Agent": "TheFishForecaster/1.0 (valleyonline63@gmail.com)",
  Accept: "application/geo+json",
};

const marineCache = new Map<string, { data: MarineData; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// Marine-relevant alert event types from NWS
const MARINE_ALERT_EVENTS = [
  "small craft advisory",
  "gale warning",
  "storm warning",
  "hurricane warning",
  "hurricane watch",
  "tropical storm warning",
  "tropical storm watch",
  "dense fog advisory",
  "high surf advisory",
  "beach hazards statement",
  "marine weather statement",
  "hazardous seas warning",
  "special marine warning",
];

// ─── Main Function ──────────────────────────────────────────

export async function getMarineData(lat: number, lon: number): Promise<MarineData | null> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = marineCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const [alertsResult, forecastResult] = await Promise.allSettled([
      fetchMarineAlerts(lat, lon),
      fetchNWSForecastText(lat, lon),
    ]);

    const alerts = alertsResult.status === "fulfilled" ? alertsResult.value : [];
    const forecastText = forecastResult.status === "fulfilled" ? forecastResult.value : null;

    const data: MarineData = {
      alerts,
      forecastText,
      hasAdvisory: alerts.some(
        (a) =>
          a.event.toLowerCase().includes("advisory") ||
          a.event.toLowerCase().includes("statement")
      ),
      hasGaleWarning: alerts.some((a) => a.event.toLowerCase().includes("gale")),
      hasStormWarning: alerts.some(
        (a) =>
          a.event.toLowerCase().includes("storm warning") ||
          a.event.toLowerCase().includes("hurricane warning") ||
          a.event.toLowerCase().includes("tropical storm warning") ||
          a.event.toLowerCase().includes("hazardous seas")
      ),
    };

    marineCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error("Failed to fetch NOAA marine data:", error);
    return null;
  }
}

// ─── Active Marine Alerts ────────────────────────────────────
//
// Fetches any active watches/warnings/advisories for the given coordinate.
// Filters to only marine-relevant events.

async function fetchMarineAlerts(lat: number, lon: number): Promise<MarineAlert[]> {
  const url = `${NWS_BASE}/alerts/active?point=${lat},${lon}`;
  const response = await fetchWithRetry(url, {
    label: "NOAA Marine Alerts",
    timeoutMs: 8_000,
    retries: 1,
    headers: NWS_HEADERS,
  });

  if (!response.ok) return [];

  const json = await response.json();
  const features: any[] = json.features ?? [];

  return features
    .filter((f) => {
      const event: string = (f.properties?.event ?? "").toLowerCase();
      return MARINE_ALERT_EVENTS.some((keyword) => event.includes(keyword));
    })
    .map((f) => ({
      event: f.properties.event ?? "Unknown Alert",
      severity: f.properties.severity ?? "Unknown",
      headline: f.properties.headline ?? "",
      description: (f.properties.description ?? "").slice(0, 500),
      expires: f.properties.expires ?? null,
    }));
}

// ─── NWS Forecast Text ───────────────────────────────────────
//
// Tries to get the NWS text forecast for this location.
// Step 1: Hit /points/{lat},{lon} to discover the NWS grid for this location.
// Step 2: Fetch the gridpoint forecast text.
//
// For far-offshore zones this will fail with a 404 — that's normal and handled.

async function fetchNWSForecastText(lat: number, lon: number): Promise<string | null> {
  // Step 1: Discover the NWS grid
  let pointsResponse: Response;
  try {
    pointsResponse = await fetchWithRetry(`${NWS_BASE}/points/${lat},${lon}`, {
      label: "NOAA NWS Points",
      timeoutMs: 8_000,
      retries: 1,
      headers: NWS_HEADERS,
    });
  } catch {
    return null;
  }

  if (!pointsResponse.ok) return null;

  let pointsJson: any;
  try {
    pointsJson = await pointsResponse.json();
  } catch {
    return null;
  }

  const forecastUrl: string | undefined = pointsJson.properties?.forecast;
  if (!forecastUrl) return null;

  // Step 2: Fetch the forecast
  let forecastResponse: Response;
  try {
    forecastResponse = await fetchWithRetry(forecastUrl, {
      label: "NOAA NWS Forecast",
      timeoutMs: 8_000,
      retries: 1,
      headers: NWS_HEADERS,
    });
  } catch {
    return null;
  }

  if (!forecastResponse.ok) return null;

  let forecastJson: any;
  try {
    forecastJson = await forecastResponse.json();
  } catch {
    return null;
  }

  const periods: any[] = forecastJson.properties?.periods ?? [];
  if (periods.length === 0) return null;

  return periods[0].detailedForecast ?? null;
}
