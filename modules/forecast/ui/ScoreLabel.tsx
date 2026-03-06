"use client";

import { cn } from "@/lib/utils";

const labelStyles: Record<string, string> = {
  EXCELLENT: "bg-score-excellent/20 text-score-excellent",
  GOOD: "bg-score-good/20 text-score-good",
  FAIR: "bg-score-fair/20 text-score-fair",
  POOR: "bg-score-poor/20 text-score-poor",
};

export function ScoreLabel({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        labelStyles[label] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      {label}
    </span>
  );
}
