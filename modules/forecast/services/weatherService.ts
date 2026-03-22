// ─── WeatherAPI.com Service ─────────────────────────────────
//
// This service fetches weather forecasts, current conditions, and astronomy
// data (sunrise, sunset, moon phase) from WeatherAPI.com.
//
// Unlike NOAA and NDBC, this API requires an API key (stored in .env).
// The free tier gives 1,000,000 calls/month which is plenty.
// Docs: https://www.weatherapi.com/docs/

import type { WeatherData, WeatherHourly } from "../types/weather.types";

const WEATHER_API_BASE = "https://api.weatherapi.com/v1";

// Cache weather data for 30 minutes
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// ─── Main Function ──────────────────────────────────────────

export async function getWeatherData(
  lat: number,
  lon: number,
  days: number = 3
): Promise<WeatherData | null> {
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey || apiKey === "your-weatherapi-key") {
    console.error("WeatherAPI key not configured. Set WEATHER_API_KEY in .env");
    return null;
  }

  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}-${days}`;

  // Check cache first
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const url = new URL(`${WEATHER_API_BASE}/forecast.json`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", `${lat},${lon}`);
    url.searchParams.set("days", String(days));
    url.searchParams.set("aqi", "no"); // skip air quality (not needed)
    url.searchParams.set("alerts", "no"); // skip weather alerts

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`WeatherAPI error (${response.status}): ${errorBody}`);
      return null;
    }

    const json = await response.json();

    // Transform the API response into our clean typed structure
    const weatherData = parseWeatherResponse(json);

    // Cache the result
    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });

    return weatherData;
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
}

// ─── Parse WeatherAPI Response ──────────────────────────────
//
// The raw API response is deeply nested. We pull out just what we need
// and flatten it into a clean structure.

function parseWeatherResponse(json: any): WeatherData {
  const current = json.current;
  const forecast = json.forecast?.forecastday?.[0];
  const astro = forecast?.astro;

  // Parse hourly forecast for the first day
  const hourlyForecast: WeatherHourly[] = (
    forecast?.hour || []
  ).map((h: any) => ({
    time: new Date(h.time),
    tempF: h.temp_f,
    windMph: h.wind_mph,
    windDir: h.wind_dir,
    pressureMb: h.pressure_mb,
    cloudCover: h.cloud,
    chanceOfRain: h.chance_of_rain,
  }));

  return {
    current: {
      tempF: current?.temp_f ?? 0,
      windMph: current?.wind_mph ?? 0,
      windDir: current?.wind_dir ?? "N",
      pressureMb: current?.pressure_mb ?? 0,
      humidity: current?.humidity ?? 0,
      cloudCover: current?.cloud ?? 0,
      feelsLikeF: current?.feelslike_f ?? 0,
      uvIndex: current?.uv ?? 0,
    },
    hourlyForecast,
    astronomy: {
      sunrise: astro?.sunrise ?? "06:00 AM",
      sunset: astro?.sunset ?? "06:00 PM",
      moonPhase: astro?.moon_phase ?? "Unknown",
      moonIllumination: parseInt(astro?.moon_illumination ?? "0", 10),
    },
  };
}
