"use client";

import { cn } from "@/lib/utils";
import type { BiteWindow } from "../types/scoring.types";
import { Sunrise, Sunset } from "lucide-react";

const strengthColors: Record<string, string> = {
  STRONG: "bg-score-excellent/70",
  MODERATE: "bg-score-good/70",
  WEAK: "bg-score-fair/70",
};

const strengthBorder: Record<string, string> = {
  STRONG: "border-score-excellent/50",
  MODERATE: "border-score-good/50",
  WEAK: "border-score-fair/50",
};

const strengthText: Record<string, string> = {
  STRONG: "text-score-excellent",
  MODERATE: "text-score-good",
  WEAK: "text-score-fair",
};

/** Parse "HH:MM" to minutes since midnight */
function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Format minutes since midnight back to "H:MM AM/PM" */
function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function BiteWindowTimeline({
  windows,
  sunrise,
  sunset,
}: {
  windows: BiteWindow[];
  sunrise: string | null;
  sunset: string | null;
}) {
  if (windows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No bite windows available for this date.
      </p>
    );
  }

  // Timeline range: from 1hr before sunrise (or 4AM) to 1hr after sunset (or 9PM)
  const sunriseMin = sunrise ? parseTime(sunrise) : 360; // 6 AM default
  const sunsetMin = sunset ? parseTime(sunset) : 1140; // 7 PM default
  const rangeStart = Math.max(0, sunriseMin - 60);
  const rangeEnd = Math.min(1440, sunsetMin + 60);
  const totalMinutes = rangeEnd - rangeStart;

  function getPosition(timeStr: string): number {
    const mins = parseTime(timeStr);
    return ((mins - rangeStart) / totalMinutes) * 100;
  }

  function getWidth(start: string, end: string): number {
    const s = parseTime(start);
    const e = parseTime(end);
    return ((e - s) / totalMinutes) * 100;
  }

  // Hour markers along the timeline
  const firstHour = Math.ceil(rangeStart / 60);
  const lastHour = Math.floor(rangeEnd / 60);
  const hourMarkers: number[] = [];
  for (let h = firstHour; h <= lastHour; h += 2) {
    hourMarkers.push(h);
  }

  return (
    <div className="space-y-4">
      {/* Visual timeline bar */}
      <div className="relative">
        {/* Track */}
        <div className="relative h-10 w-full rounded-lg bg-muted/50 border border-border overflow-hidden">
          {/* Sunrise / sunset markers */}
          {sunrise && (
            <div
              className="absolute top-0 h-full w-px bg-amber-400/50"
              style={{ left: `${getPosition(sunrise)}%` }}
            />
          )}
          {sunset && (
            <div
              className="absolute top-0 h-full w-px bg-orange-400/50"
              style={{ left: `${getPosition(sunset)}%` }}
            />
          )}

          {/* Window blocks */}
          {windows.map((w, i) => {
            const left = Math.max(0, getPosition(w.start));
            const width = Math.max(2, getWidth(w.start, w.end));
            return (
              <div
                key={i}
                className={cn(
                  "absolute top-1 bottom-1 rounded-md transition-opacity hover:opacity-100",
                  strengthColors[w.strength] ?? "bg-muted"
                )}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${w.start} - ${w.end} (${w.strength})`}
              />
            );
          })}
        </div>

        {/* Hour labels */}
        <div className="relative mt-1 h-4">
          {hourMarkers.map((h) => {
            const pos = ((h * 60 - rangeStart) / totalMinutes) * 100;
            return (
              <span
                key={h}
                className="absolute -translate-x-1/2 text-[10px] text-muted-foreground"
                style={{ left: `${pos}%` }}
              >
                {formatTime(h * 60)}
              </span>
            );
          })}
        </div>

        {/* Sunrise/sunset labels */}
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          {sunrise && (
            <span className="flex items-center gap-1 text-amber-400">
              <Sunrise className="h-3 w-3" />
              {formatTime(sunriseMin)}
            </span>
          )}
          {sunset && (
            <span className="ml-auto flex items-center gap-1 text-orange-400">
              <Sunset className="h-3 w-3" />
              {formatTime(sunsetMin)}
            </span>
          )}
        </div>
      </div>

      {/* Window detail cards below the timeline */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {windows.map((w, i) => (
          <div
            key={i}
            className={cn(
              "rounded-lg border p-3 text-sm",
              strengthBorder[w.strength] ?? "border-border"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {formatTime(parseTime(w.start))} – {formatTime(parseTime(w.end))}
              </span>
              <span
                className={cn(
                  "text-xs font-bold uppercase",
                  strengthText[w.strength]
                )}
              >
                {w.strength}
              </span>
            </div>
            <p className="mt-0.5 text-xs capitalize text-muted-foreground">
              {w.windowType.toLowerCase()} window
            </p>
            {w.factors.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {w.factors.map((f) => (
                  <span
                    key={f}
                    className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
