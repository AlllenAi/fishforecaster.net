"use client";

import { cn } from "@/lib/utils";
import type { SpeciesScore } from "../types/scoring.types";
import { ScoreLabel } from "./ScoreLabel";

function getBarColor(score: number) {
  if (score >= 80) return "bg-score-excellent";
  if (score >= 60) return "bg-score-good";
  if (score >= 40) return "bg-score-fair";
  return "bg-score-poor";
}

function getTextColor(score: number) {
  if (score >= 80) return "text-score-excellent";
  if (score >= 60) return "text-score-good";
  if (score >= 40) return "text-score-fair";
  return "text-score-poor";
}

export function SpeciesScoreRow({ species }: { species: SpeciesScore }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-card-foreground">
            {species.species}
          </span>
          <div className="flex items-center gap-2">
            <span className={cn("text-lg font-bold", getTextColor(species.score))}>
              {species.score}
            </span>
            <ScoreLabel label={species.label} />
          </div>
        </div>
        {/* Score bar */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", getBarColor(species.score))}
            style={{ width: `${species.score}%` }}
          />
        </div>
        {/* Temp info */}
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>
            Optimal: {species.optimalTempRange[0]}-{species.optimalTempRange[1]}°F
          </span>
          {species.currentWaterTemp != null && (
            <span>Current: {species.currentWaterTemp.toFixed(0)}°F</span>
          )}
        </div>
      </div>
    </div>
  );
}
