"use client";

import { cn } from "@/lib/utils";

function getScoreColor(score: number) {
  if (score >= 80) return "text-score-excellent";
  if (score >= 60) return "text-score-good";
  if (score >= 40) return "text-score-fair";
  return "text-score-poor";
}

function getScoreBorderColor(score: number) {
  if (score >= 80) return "border-score-excellent";
  if (score >= 60) return "border-score-good";
  if (score >= 40) return "border-score-fair";
  return "border-score-poor";
}

function getGlowClass(score: number) {
  if (score >= 80) return "glow-excellent";
  if (score >= 60) return "glow-good";
  if (score >= 40) return "glow-fair";
  return "glow-poor";
}

export function ScoreCircle({
  score,
  size = "md",
  className,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-12 w-12 text-lg border-2",
    md: "h-20 w-20 text-3xl border-3",
    lg: "h-28 w-28 text-4xl border-4",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold",
        sizeClasses[size],
        getScoreBorderColor(score),
        getScoreColor(score),
        getGlowClass(score),
        className
      )}
    >
      {score}
    </div>
  );
}
