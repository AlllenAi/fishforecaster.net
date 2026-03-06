"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScoreCircle } from "./ScoreCircle";
import { ScoreLabel } from "./ScoreLabel";
import type { ForecastResult } from "../types/scoring.types";
import { Droplets, TreePine, Clock } from "lucide-react";

function getGlowClass(label: string) {
  if (label === "EXCELLENT") return "glow-excellent";
  if (label === "GOOD") return "glow-good";
  if (label === "FAIR") return "glow-fair";
  return "glow-poor";
}

export function ZoneCard({ forecast }: { forecast: ForecastResult }) {
  const bestWindow = forecast.biteWindows[0];
  const topSpecies = forecast.speciesScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((s) => s.species);

  // Build the slug from zone name
  const slug = forecast.zoneName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return (
    <Link href={`/dashboard/zones/${slug}`}>
      <div
        className={cn(
          "group rounded-xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg",
          getGlowClass(forecast.label)
        )}
      >
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {forecast.zoneName}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <WaterBadge conditions={forecast.conditions} />
              <ScoreLabel label={forecast.label} />
            </div>
          </div>
          <ScoreCircle score={forecast.score} size="sm" />
        </div>

        {/* Info rows */}
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          {bestWindow && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Best: {bestWindow.start} - {bestWindow.end}
              </span>
              <span
                className={cn(
                  "ml-auto text-xs font-medium",
                  bestWindow.strength === "STRONG"
                    ? "text-score-excellent"
                    : bestWindow.strength === "MODERATE"
                      ? "text-score-good"
                      : "text-score-fair"
                )}
              >
                {bestWindow.strength}
              </span>
            </div>
          )}

          {topSpecies.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs">Top: {topSpecies.join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function WaterBadge({ conditions }: { conditions: ForecastResult["conditions"] }) {
  const isSalt = conditions.tideDirection !== null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      {isSalt ? (
        <Droplets className="h-3 w-3" />
      ) : (
        <TreePine className="h-3 w-3" />
      )}
      {isSalt ? "Salt" : "Fresh"}
    </span>
  );
}
