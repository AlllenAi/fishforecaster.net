"use client";

import { useCatchStats } from "../hooks/useCatchReports";
import { Fish, MapPin, TrendingUp } from "lucide-react";

export function CatchStats() {
  const { data: stats, isLoading } = useCatchStats(7);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3 rounded-xl border p-4">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-3 w-48 rounded bg-muted" />
      </div>
    );
  }

  if (!stats || stats.recentCount === 0) return null;

  return (
    <div className="rounded-xl border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">This Week&apos;s Catches</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {stats.recentCount} reports
        </span>
      </div>

      {/* Top Species */}
      {stats.topSpecies.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Top Species</p>
          <div className="flex flex-wrap gap-2">
            {stats.topSpecies.map((s) => (
              <span
                key={s.species}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                <Fish className="h-3 w-3" />
                {s.species}
                <span className="text-primary/60">({s.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hot Zones */}
      {stats.hotZones.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Hot Zones</p>
          <div className="space-y-1.5">
            {stats.hotZones.map((z) => (
              <div
                key={z.zoneId}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-1 text-foreground">
                  <MapPin className="h-3 w-3 text-red-500" />
                  {z.zoneName}
                </span>
                <span className="text-muted-foreground">{z.count} catches</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
