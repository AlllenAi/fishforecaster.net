// ─── Moon Phase Fallback Service ────────────────────────────
//
// This calculates the moon phase using pure math — no API needed!
// We use this as a fallback if WeatherAPI doesn't return moon data,
// and also to double-check the WeatherAPI moon info.
//
// The algorithm is based on the synodic month (29.53 days between
// new moons). By counting days since a known new moon, we can
// figure out the current phase.
//
// Why does moon phase matter for fishing?
// - New Moon: darkest nights, fish feed more aggressively = BEST
// - Full Moon: strong tidal pull, fish are active = GOOD
// - Quarter Moons: moderate effect
// - In between: minimal effect

import type { MoonPhase } from "../types/scoring.types";
import type { MoonPhaseData } from "../types/weather.types";
import { MOON_SCORE_BOOSTS } from "../lib/constants";

// The synodic month: average time between two new moons
const SYNODIC_MONTH = 29.53058867;

// A known new moon date to use as our reference point.
// January 6, 2000 at 18:14 UTC was a new moon.
const KNOWN_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));

// ─── Main Function ──────────────────────────────────────────

export function getMoonPhaseData(date: Date): MoonPhaseData {
  const daysSinceNewMoon = calculateDaysSinceNewMoon(date);
  const phase = daysSinceNewMoonToPhase(daysSinceNewMoon);
  const illumination = calculateIllumination(daysSinceNewMoon);

  return {
    phase,
    illumination,
    daysSinceNewMoon,
    fishingScoreBoost: MOON_SCORE_BOOSTS[phase] ?? 0,
  };
}

// ─── Calculate Days Since New Moon ──────────────────────────
//
// We take the difference between our date and the known new moon,
// then use modulo (%) to find where we are in the current cycle.
// Think of it like a clock — if the cycle is 29.53 days, and we're
// 15 days in, we're roughly at the full moon (halfway through).

function calculateDaysSinceNewMoon(date: Date): number {
  const diffMs = date.getTime() - KNOWN_NEW_MOON.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // Modulo gives us the position within the current cycle (0 to 29.53)
  let daysSince = diffDays % SYNODIC_MONTH;
  if (daysSince < 0) daysSince += SYNODIC_MONTH;

  return Math.round(daysSince * 100) / 100; // Round to 2 decimals
}

// ─── Map Days to Phase Name ─────────────────────────────────
//
// The 29.53-day cycle is divided into 8 phases:
// Day  0-1.8:  New Moon
// Day  1.8-7.4:  Waxing Crescent (growing sliver)
// Day  7.4-9.2:  First Quarter (half moon)
// Day  9.2-14.8: Waxing Gibbous (almost full)
// Day  14.8-16.6: Full Moon
// Day  16.6-22.1: Waning Gibbous (shrinking from full)
// Day  22.1-23.9: Last Quarter (half moon, other side)
// Day  23.9-29.5: Waning Crescent (thin sliver before new)

function daysSinceNewMoonToPhase(days: number): MoonPhase {
  if (days < 1.85) return "NEW";
  if (days < 7.38) return "WAXING_CRESCENT";
  if (days < 9.23) return "FIRST_QUARTER";
  if (days < 14.77) return "WAXING_GIBBOUS";
  if (days < 16.61) return "FULL";
  if (days < 22.15) return "WANING_GIBBOUS";
  if (days < 23.99) return "LAST_QUARTER";
  if (days < 29.53) return "WANING_CRESCENT";
  return "NEW";
}

// ─── Calculate Illumination Percentage ──────────────────────
//
// Uses a cosine curve to approximate the illumination.
// At new moon (day 0): 0% illuminated
// At full moon (day ~14.76): 100% illuminated
// The cosine function naturally creates this smooth curve.

function calculateIllumination(daysSinceNew: number): number {
  // Convert days to radians (one full cycle = 2π)
  const phaseAngle = (daysSinceNew / SYNODIC_MONTH) * 2 * Math.PI;

  // Cosine gives us -1 at new moon and +1 at full moon, so we flip and scale
  const illumination = ((1 - Math.cos(phaseAngle)) / 2) * 100;

  return Math.round(illumination);
}

// ─── Helper: Convert WeatherAPI Moon Phase String ───────────
//
// WeatherAPI returns phase names like "Waxing Crescent" as a string.
// This converts those to our enum format.

export function weatherApiMoonPhaseToEnum(phase: string): MoonPhase {
  const mapping: Record<string, MoonPhase> = {
    "New Moon": "NEW",
    "Waxing Crescent": "WAXING_CRESCENT",
    "First Quarter": "FIRST_QUARTER",
    "Waxing Gibbous": "WAXING_GIBBOUS",
    "Full Moon": "FULL",
    "Waning Gibbous": "WANING_GIBBOUS",
    "Last Quarter": "LAST_QUARTER",
    "Third Quarter": "LAST_QUARTER",
    "Waning Crescent": "WANING_CRESCENT",
  };

  return mapping[phase] ?? "NEW";
}
