"use client";

import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  tier: "FREE" | "FRESHWATER" | "SALTWATER" | "ALL_ACCESS";
}

const tierConfig = {
  FREE: { label: "Free", className: "bg-muted text-muted-foreground" },
  FRESHWATER: { label: "Freshwater", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  SALTWATER: { label: "Saltwater", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  ALL_ACCESS: { label: "All Access", className: "bg-primary/10 text-primary" },
};

export function PlanBadge({ tier }: PlanBadgeProps) {
  const config = tierConfig[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
