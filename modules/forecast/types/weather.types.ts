// These types describe the data we get back from external APIs.
// Each API returns data in a different format, so we "normalize" it
// into a consistent shape our app can use.

// ─── NOAA Tide Data ─────────────────────────────────────────

export type TidePrediction = {
  time: Date;
  height: number; // feet above MLLW (Mean Lower Low Water)
  type: "H" | "L"; // High or Low tide
};

export type TideData = {
  stationId: string;
  predictions: TidePrediction[];
  // Derived values (calculated from the raw predictions)
  currentDirection: "INCOMING" | "OUTGOING" | "SLACK";
  currentHeight: number;
  nextChange: {
    type: "H" | "L";
    time: Date;
    minutesUntil: number;
  } | null;
  movementRate: number; // feet per hour (higher = better fishing)
  tideSwing: number; // difference between last high and low
};

// ─── NDBC Buoy Data ─────────────────────────────────────────

export type BuoyObservation = {
  timestamp: Date;
  windSpeed: number; // knots
  windDirection: number; // degrees (0-360)
  gustSpeed: number; // knots
  waveHeight: number; // feet
  dominantWavePeriod: number; // seconds
  averageWavePeriod: number; // seconds
  waterTemp: number; // Fahrenheit
  airTemp: number; // Fahrenheit
  pressure: number; // hPa (hectopascals)
  pressureTrend: number; // hPa change over last 3 hours
};

export type BuoyData = {
  buoyId: string;
  latest: BuoyObservation;
  // Derived values
  pressureTrendLabel: "RISING" | "FALLING" | "STABLE";
  swellQuality: "CLEAN" | "MODERATE" | "CHOPPY";
  windTrend: "INCREASING" | "DECREASING" | "STABLE";
};

// ─── WeatherAPI.com Data ────────────────────────────────────

export type WeatherCurrent = {
  tempF: number;
  windMph: number;
  windDir: string; // e.g. "NW", "SSE"
  pressureMb: number;
  humidity: number;
  cloudCover: number; // percentage 0-100
  feelsLikeF: number;
  uvIndex: number;
};

export type WeatherHourly = {
  time: Date;
  tempF: number;
  windMph: number;
  windDir: string;
  pressureMb: number;
  cloudCover: number;
  chanceOfRain: number;
};

export type WeatherAstronomy = {
  sunrise: string; // e.g. "06:23 AM"
  sunset: string; // e.g. "07:45 PM"
  moonPhase: string; // e.g. "Waxing Crescent"
  moonIllumination: number; // percentage 0-100
};

export type WeatherData = {
  current: WeatherCurrent;
  hourlyForecast: WeatherHourly[];
  astronomy: WeatherAstronomy;
};

// ─── NOAA Marine Forecast Data ──────────────────────────────

export type MarineAlert = {
  event: string;       // e.g. "Small Craft Advisory", "Gale Warning"
  severity: string;    // e.g. "Moderate", "Severe"
  headline: string;    // Short one-line summary
  description: string; // Full text (truncated to 500 chars)
  expires: string | null;
};

export type MarineData = {
  alerts: MarineAlert[];
  forecastText: string | null; // Plain-English NWS forecast, e.g. "NW winds 15-20 kt. Seas 5-7 ft."
  // Derived convenience flags
  hasAdvisory: boolean;     // Small Craft Advisory or similar
  hasGaleWarning: boolean;  // Gale Warning (34-47 kt winds)
  hasStormWarning: boolean; // Storm Warning, Hurricane Warning, etc.
};

// ─── Moon Phase (Algorithmic Fallback) ──────────────────────

export type MoonPhaseData = {
  phase: import("./scoring.types").MoonPhase;
  illumination: number; // 0-100
  daysSinceNewMoon: number; // 0-29.5
  fishingScoreBoost: number; // Points to add to moon factor
};
