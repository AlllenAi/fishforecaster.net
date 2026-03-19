"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Map, Fish } from "lucide-react";

interface MapTabsProps {
  forecastMap: ReactNode;
  catchMap: ReactNode;
}

export function MapTabs({ forecastMap, catchMap }: MapTabsProps) {
  const [tab, setTab] = useState<"forecasts" | "catches">("forecasts");

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg bg-muted p-1">
        <button
          onClick={() => setTab("forecasts")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            tab === "forecasts"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Map className="h-3.5 w-3.5" />
          Forecasts
        </button>
        <button
          onClick={() => setTab("catches")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            tab === "catches"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Fish className="h-3.5 w-3.5" />
          Catches
        </button>
      </div>

      {tab === "forecasts" ? forecastMap : catchMap}
    </div>
  );
}
