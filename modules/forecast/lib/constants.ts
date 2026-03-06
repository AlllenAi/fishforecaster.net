// This file contains all the "magic numbers" for the scoring algorithm.
// By putting them here instead of scattered throughout the code, we can
// easily tweak them later to fine-tune the fishing predictions.

// ─── Saltwater Scoring Weights ──────────────────────────────
// These must add up to 1.0 (100%)
// Each weight controls how much that factor matters in the final score.

export const SALTWATER_WEIGHTS = {
  tideMovement: 0.2, // 20% — Strong tidal movement = better fishing
  swell: 0.15, // 15% — Wave conditions affect boat & fish behavior
  waterTemp: 0.15, // 15% — Fish are cold-blooded, temp matters a lot
  wind: 0.15, // 15% — High wind = rough conditions = bad fishing
  pressure: 0.1, // 10% — Barometric pressure affects fish feeding
  moonPhase: 0.1, // 10% — Moon affects tides and fish activity
  cloudCover: 0.05, // 5%  — Overcast is often better for fishing
  lightConditions: 0.1, // 10% — Dawn/dusk are prime fishing times
} as const;

// ─── Freshwater Scoring Weights ─────────────────────────────
// Freshwater fish are more sensitive to temperature and pressure,
// and there are no tides or ocean swell to worry about.

export const FRESHWATER_WEIGHTS = {
  waterTemp: 0.25, // 25% — Most critical factor for freshwater
  pressure: 0.2, // 20% — Freshwater fish are very pressure-sensitive
  wind: 0.15, // 15% — Light wind creates ripple (good)
  moonPhase: 0.1, // 10% — Affects feeding patterns
  cloudCover: 0.1, // 10% — Overcast = better for most species
  lightConditions: 0.1, // 10% — Dawn/dusk dominant
  airTemp: 0.05, // 5%  — Proxy for comfort + surface activity
  season: 0.05, // 5%  — Spring/Fall = peak, Winter = slow
} as const;

// ─── Species Optimal Water Temperatures (Fahrenheit) ────────
// Fish feed most actively when water is in their "comfort zone".
// Outside that range, they slow down or move to different depths.

export const SPECIES_TEMP_RANGES: Record<string, { min: number; max: number; type: "SALT" | "FRESH" }> = {
  // Saltwater species
  "Bluefin Tuna": { min: 60, max: 72, type: "SALT" },
  "Yellowfin Tuna": { min: 72, max: 82, type: "SALT" },
  Albacore: { min: 58, max: 66, type: "SALT" },
  Yellowtail: { min: 64, max: 74, type: "SALT" },
  "White Seabass": { min: 58, max: 68, type: "SALT" },
  Halibut: { min: 56, max: 68, type: "SALT" },
  "Calico Bass": { min: 60, max: 72, type: "SALT" },
  // Freshwater species
  "Largemouth Bass": { min: 65, max: 80, type: "FRESH" },
  Bass: { min: 65, max: 80, type: "FRESH" },
  Trout: { min: 50, max: 65, type: "FRESH" },
  Catfish: { min: 70, max: 85, type: "FRESH" },
  Crappie: { min: 60, max: 75, type: "FRESH" },
  Bluegill: { min: 65, max: 80, type: "FRESH" },
  Carp: { min: 65, max: 80, type: "FRESH" },
} as const;

// ─── Moon Phase Fishing Score Boosts ────────────────────────
// New moon = fish feed aggressively (low light).
// Full moon = strong tidal pull, also good.
// Quarter moons = moderate effect.

export const MOON_SCORE_BOOSTS: Record<string, number> = {
  NEW: 15,
  WAXING_CRESCENT: 0,
  FIRST_QUARTER: 5,
  WAXING_GIBBOUS: 0,
  FULL: 10,
  WANING_GIBBOUS: 0,
  LAST_QUARTER: 5,
  WANING_CRESCENT: 0,
};

// ─── Score Label Thresholds ─────────────────────────────────
// Maps the 0-100 score to a human-readable label.

export const SCORE_THRESHOLDS = {
  POOR: { min: 0, max: 39 },
  FAIR: { min: 40, max: 59 },
  GOOD: { min: 60, max: 79 },
  EXCELLENT: { min: 80, max: 100 },
} as const;

// Helper to convert a numeric score to a label
export function scoreToLabel(score: number): "POOR" | "FAIR" | "GOOD" | "EXCELLENT" {
  if (score >= 80) return "EXCELLENT";
  if (score >= 60) return "GOOD";
  if (score >= 40) return "FAIR";
  return "POOR";
}

// ─── Tide Station IDs ───────────────────────────────────────
// NOAA CO-OPS station IDs for Southern California

export const TIDE_STATIONS: Record<string, string> = {
  "San Diego": "9410170",
  "La Jolla": "9410230",
  "Newport Beach": "9410580",
  "Long Beach": "9410665",
  "Avalon (Catalina)": "9410079",
  "Santa Barbara": "9411340",
  "Port Hueneme": "9411399",
};

// ─── NDBC Buoy IDs ──────────────────────────────────────────
// National Data Buoy Center buoys off the SoCal coast

export const NDBC_BUOYS: Record<string, string> = {
  "Point Loma South": "46232",
  "Oceanside Offshore": "46224",
  "Dana Point": "46223",
  "San Clemente Basin": "46086",
  "Tanner Bank": "46047",
  "Santa Rosa Island": "46069",
  "East Santa Barbara": "46053",
  "West Santa Barbara": "46054",
};

// ─── Wind Scoring Thresholds (knots) ────────────────────────
export const WIND_THRESHOLDS = {
  ideal: 10, // 0-10 kt = ideal (score 100)
  decent: 15, // 10-15 kt = decent (score 70)
  poor: 20, // 15-20 kt = poor (score 40)
  bad: 20, // 20+ kt = bad (score 10)
} as const;

// ─── Swell Scoring ──────────────────────────────────────────
export const SWELL_SCORING = {
  idealHeightMin: 2, // feet
  idealHeightMax: 5, // feet
  idealPeriodMin: 10, // seconds (long period = clean swell)
  maxHeight: 8, // feet (above this = dangerous / unfishable)
} as const;
