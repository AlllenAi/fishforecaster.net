"use client";

import { cn } from "@/lib/utils";
import type { BiteWindow } from "../types/scoring.types";
import { Clock } from "lucide-react";

const strengthColors: Record<string, string> = {
  STRONG: "border-score-excellent/50 bg-score-excellent/10",
  MODERATE: "border-score-good/50 bg-score-good/10",
  WEAK: "border-score-fair/50 bg-score-fair/10",
};

const strengthText: Record<string, string> = {
  STRONG: "text-score-excellent",
  MODERATE: "text-score-good",
  WEAK: "text-score-fair",
};

export function BiteWindowCard({ window }: { window: BiteWindow }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        strengthColors[window.strength] ?? "border-border bg-card"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">
            {window.start} - {window.end}
          </span>
        </div>
        <span
          className={cn(
            "text-xs font-bold uppercase tracking-wide",
            strengthText[window.strength]
          )}
        >
          {window.strength}
        </span>
      </div>
      <p className="mt-1 text-xs capitalize text-muted-foreground">
        {window.windowType.toLowerCase()} window
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {window.factors.map((factor) => (
          <span
            key={factor}
            className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            {factor}
          </span>
        ))}
      </div>
    </div>
  );
}
