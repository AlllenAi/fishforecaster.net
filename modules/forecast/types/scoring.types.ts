// These are the TypeScript types for the scoring system.
// Think of types as "blueprints" — they describe what shape data should have,
// but they don't contain any actual data themselves.

export type ScoreLabelType = "POOR" | "FAIR" | "GOOD" | "EXCELLENT";

export type ConfidenceType = "LOW" | "MEDIUM" | "HIGH";

export type WindowStrength = "STRONG" | "MODERATE" | "WEAK";

export type WindowType =
  | "DAWN"
  | "MORNING"
  | "MIDDAY"
  | "AFTERNOON"
  | "EVENING";

export type MoonPhase =
  | "NEW"
  | "WAXING_CRESCENT"
  | "FIRST_QUARTER"
  | "WAXING_GIBBOUS"
  | "FULL"
  | "WANING_GIBBOUS"
  | "LAST_QUARTER"
  | "WANING_CRESCENT";

export type WaterTypeValue = "SALT" | "FRESH";

// The bite window tells users the best time to fish
export type BiteWindow = {
  start: string; // e.g. "05:40"
  end: string; // e.g. "08:10"
  strength: WindowStrength;
  windowType: WindowType;
  factors: string[]; // e.g. ["Low light", "Incoming tide", "Falling pressure"]
};

// Per-species score so users can see which fish are biting best
export type SpeciesScore = {
  species: string;
  score: number; // 0-100
  label: ScoreLabelType;
  optimalTempRange: [number, number]; // [min, max] in Fahrenheit
  currentWaterTemp: number | null;
};

// The complete forecast result for a zone on a given date
export type ForecastResult = {
  zoneId: string;
  zoneName: string;
  date: string; // ISO date string
  score: number; // 0-100 overall bite score
  label: ScoreLabelType;
  confidence: ConfidenceType;
  biteWindows: BiteWindow[];
  conditions: ForecastConditions;
  captainCall: string; // Short text summary like "Great day for yellowtail near the kelp"
  speciesScores: SpeciesScore[];
};

// All the raw conditions data we display alongside the score
export type ForecastConditions = {
  waterTemp: number | null;
  airTemp: number | null;
  windSpeed: number | null;
  windDirection: string | null;
  waveHeight: number | null;
  wavePeriod: number | null;
  pressure: number | null;
  pressureTrend: "RISING" | "FALLING" | "STABLE" | null;
  cloudCover: number | null;
  moonPhase: MoonPhase;
  moonIllumination: number;
  sunrise: string | null;
  sunset: string | null;
  tideDirection: "INCOMING" | "OUTGOING" | "SLACK" | null;
};

// Individual factor scores (used internally by the scoring engine)
export type FactorScore = {
  factor: string;
  score: number; // 0-100
  weight: number; // 0-1 (percentage as decimal)
  details: string; // Human-readable explanation
};
