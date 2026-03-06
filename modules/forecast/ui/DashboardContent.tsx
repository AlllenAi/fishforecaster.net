// This is the main client-side dashboard content.
// It's a separate component from the page because it uses hooks (client-side),
// while the page itself is a server component that checks authentication.

"use client";

import { useState } from "react";
import { useForecasts } from "../hooks/useForecasts";
import { ZoneCard } from "./ZoneCard";
import { WaterTypeToggle } from "./WaterTypeToggle";
import { DatePicker } from "./DatePicker";
import type { ForecastResult } from "../types/scoring.types";

function formatToday(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type SortOption = "score" | "name" | "waterType";

export function DashboardContent() {
  const [date, setDate] = useState(formatToday);
  const [waterFilter, setWaterFilter] = useState<"ALL" | "SALT" | "FRESH">("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("score");

  const { data: forecasts, isLoading, error } = useForecasts(date);

  // Filter by water type
  const filtered = (forecasts ?? []).filter((f) => {
    if (waterFilter === "ALL") return true;
    const isSalt = f.conditions.tideDirection !== null;
    return waterFilter === "SALT" ? isSalt : !isSalt;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "name") return a.zoneName.localeCompare(b.zoneName);
    // waterType: salt first
    const aIsSalt = a.conditions.tideDirection !== null;
    const bIsSalt = b.conditions.tideDirection !== null;
    if (aIsSalt !== bIsSalt) return aIsSalt ? -1 : 1;
    return b.score - a.score;
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <DatePicker value={date} onChange={setDate} />
          <WaterTypeToggle value={waterFilter} onChange={setWaterFilter} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-md border bg-muted px-2 py-1 text-sm text-foreground"
          >
            <option value="score">Best Score</option>
            <option value="name">Name</option>
            <option value="waterType">Water Type</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-xl border bg-card"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">
            Failed to load forecasts. Please try again.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && sorted.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            No forecasts available for this date and filter.
          </p>
        </div>
      )}

      {/* Zone cards grid */}
      {!isLoading && sorted.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((forecast: ForecastResult) => (
            <ZoneCard key={forecast.zoneId} forecast={forecast} />
          ))}
        </div>
      )}
    </div>
  );
}
