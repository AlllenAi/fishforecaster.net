// ─── NOAA Marine Alert Service ───────────────────────────────
//
// Fetches active marine weather alerts from NOAA's NWS API.
// This is completely free — no API key required.
//
// Note: the NWS gridpoints forecast endpoint does not support
// offshore marine areas (returns 404 with "MarineForecastNotSupported"),
// so we fetch only active alerts here.
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
    const alerts = await fetchMarineAlerts(lat, lon);

    const data: MarineData = {
      alerts,
      forecastText: null,
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
    console.error("Failed to fetch NOAA marine alerts:", error);
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
