// ─── Bite Window Calculator ─────────────────────────────────
//
// This figures out the BEST times to fish on a given day.
// It looks at multiple factors:
//   - Tide changes (2 hours before, 1 hour after each high/low)
//   - Dawn and dusk (sunrise/sunset ± 1 hour)
//   - Moon overhead/underfoot (solunar feeding periods)
//   - Falling barometric pressure
//
// When multiple factors overlap (e.g., dawn + incoming tide), that
// window gets a strength boost. We return the top 3 windows per day.

import type { TideData, WeatherData, MoonPhaseData } from "../types/weather.types";
import type { BiteWindow, WindowStrength, WindowType } from "../types/scoring.types";
import { parseTimeString, formatTime } from "../lib/utils";

type RawWindow = {
  start: Date;
  end: Date;
  factors: string[];
  score: number; // internal score for ranking
};

// ─── Main Function ──────────────────────────────────────────

export function calculateBiteWindows(
  tideData: TideData | null,
  weatherData: WeatherData | null,
  moonData: MoonPhaseData,
  date: Date
): BiteWindow[] {
  const rawWindows: RawWindow[] = [];

  // 1. Tide-based windows
  if (tideData) {
    rawWindows.push(...getTideWindows(tideData, date));
  }

  // 2. Dawn/dusk windows
  rawWindows.push(...getLightWindows(weatherData, date));

  // 3. Solunar windows (moon overhead/underfoot)
  rawWindows.push(...getSolunarWindows(moonData, date));

  // 4. Merge overlapping windows and boost their scores
  const merged = mergeWindows(rawWindows);

  // 5. Convert to output format and return top 3
  return merged
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((w) => ({
      start: formatTime(w.start),
      end: formatTime(w.end),
      strength: scoreToStrength(w.score),
      windowType: timeToWindowType(w.start),
      factors: w.factors,
    }));
}

// ─── Tide Windows ───────────────────────────────────────────
// Fish feed most actively during tidal movement. The best time is
// 2 hours before a tide change through 1 hour after.

function getTideWindows(tideData: TideData, date: Date): RawWindow[] {
  const windows: RawWindow[] = [];
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  for (const pred of tideData.predictions) {
    // Only include tide changes that happen on the requested date
    if (pred.time < dayStart || pred.time > dayEnd) continue;

    const tideTime = pred.time.getTime();
    // 2 hours before the tide change
    const start = new Date(tideTime - 2 * 60 * 60 * 1000);
    // 1 hour after
    const end = new Date(tideTime + 1 * 60 * 60 * 1000);

    const label = pred.type === "H" ? "High tide" : "Low tide";
    const direction = pred.type === "H" ? "Incoming tide" : "Outgoing tide";

    windows.push({
      start: clampToDay(start, dayStart, dayEnd),
      end: clampToDay(end, dayStart, dayEnd),
      factors: [direction, `${label} at ${formatTime(pred.time)}`],
      score: 70, // tide windows have high base score
    });
  }

  return windows;
}

// ─── Light Windows (Dawn/Dusk) ──────────────────────────────
// Low light = less visible line, fish are less cautious, baitfish active

function getLightWindows(weather: WeatherData | null, date: Date): RawWindow[] {
  const windows: RawWindow[] = [];

  let sunriseHour = 6;
  let sunriseMin = 0;
  let sunsetHour = 18;
  let sunsetMin = 0;

  if (weather?.astronomy) {
    const sr = parseTimeString(weather.astronomy.sunrise);
    const ss = parseTimeString(weather.astronomy.sunset);
    sunriseHour = sr.hours;
    sunriseMin = sr.minutes;
    sunsetHour = ss.hours;
    sunsetMin = ss.minutes;
  }

  // Dawn window: 1 hour before sunrise to 1 hour after
  const dawnCenter = new Date(date);
  dawnCenter.setHours(sunriseHour, sunriseMin, 0, 0);
  windows.push({
    start: new Date(dawnCenter.getTime() - 60 * 60 * 1000),
    end: new Date(dawnCenter.getTime() + 60 * 60 * 1000),
    factors: ["Low light", "Dawn feeding period"],
    score: 65,
  });

  // Dusk window: 1 hour before sunset to 1 hour after
  const duskCenter = new Date(date);
  duskCenter.setHours(sunsetHour, sunsetMin, 0, 0);
  windows.push({
    start: new Date(duskCenter.getTime() - 60 * 60 * 1000),
    end: new Date(duskCenter.getTime() + 60 * 60 * 1000),
    factors: ["Low light", "Dusk feeding period"],
    score: 65,
  });

  return windows;
}

// ─── Solunar Windows ────────────────────────────────────────
// Solunar theory says fish feed more when the moon is directly
// overhead or underfoot. Major periods (overhead/underfoot) last
// about 2 hours; minor periods (moonrise/moonset) about 1 hour.
//
// This is a simplified approximation based on the moon's position
// in its daily transit.

function getSolunarWindows(moonData: MoonPhaseData, date: Date): RawWindow[] {
  const windows: RawWindow[] = [];

  // The moon transits roughly 50 minutes later each day.
  // We approximate the major period based on days since new moon.
  const transitOffset = (moonData.daysSinceNewMoon * 50) % (24 * 60); // minutes into day
  const majorHour = Math.floor(transitOffset / 60) % 24;
  const majorMin = Math.floor(transitOffset % 60);

  // Major period: moon overhead (±1 hour)
  const majorOverhead = new Date(date);
  majorOverhead.setHours(majorHour, majorMin, 0, 0);
  windows.push({
    start: new Date(majorOverhead.getTime() - 60 * 60 * 1000),
    end: new Date(majorOverhead.getTime() + 60 * 60 * 1000),
    factors: ["Solunar major period"],
    score: 40, // Lower base score; boosted when combined with other factors
  });

  // Major period: moon underfoot (12 hours opposite)
  const majorUnderfoot = new Date(majorOverhead.getTime() + 12 * 60 * 60 * 1000);
  if (majorUnderfoot.getDate() === date.getDate()) {
    windows.push({
      start: new Date(majorUnderfoot.getTime() - 60 * 60 * 1000),
      end: new Date(majorUnderfoot.getTime() + 60 * 60 * 1000),
      factors: ["Solunar major period"],
      score: 40,
    });
  }

  return windows;
}

// ─── Merge Overlapping Windows ──────────────────────────────
// When windows overlap (e.g., dawn + incoming tide), combine them
// into one stronger window with all the factors listed.

function mergeWindows(windows: RawWindow[]): RawWindow[] {
  if (windows.length === 0) return [];

  // Sort by start time
  const sorted = [...windows].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  const merged: RawWindow[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    // Check if windows overlap
    if (current.start.getTime() <= last.end.getTime()) {
      // Merge: extend the end time and combine factors + boost score
      last.end = new Date(
        Math.max(last.end.getTime(), current.end.getTime())
      );
      // Add unique factors
      for (const factor of current.factors) {
        if (!last.factors.includes(factor)) {
          last.factors.push(factor);
        }
      }
      // Overlap bonus! Multiple factors = stronger window
      last.score = Math.min(100, last.score + current.score * 0.3);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

// ─── Helpers ────────────────────────────────────────────────

function scoreToStrength(score: number): WindowStrength {
  if (score >= 80) return "STRONG";
  if (score >= 55) return "MODERATE";
  return "WEAK";
}

function timeToWindowType(date: Date): WindowType {
  const hour = date.getHours();
  if (hour < 7) return "DAWN";
  if (hour < 11) return "MORNING";
  if (hour < 14) return "MIDDAY";
  if (hour < 17) return "AFTERNOON";
  return "EVENING";
}

function clampToDay(time: Date, dayStart: Date, dayEnd: Date): Date {
  if (time < dayStart) return dayStart;
  if (time > dayEnd) return dayEnd;
  return time;
}
