"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useCatchMap } from "../hooks/useCatchMap";

const CatchMap = dynamic(
  () => import("./CatchMap").then((mod) => mod.CatchMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-xl border bg-card">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    ),
  }
);

export function CatchMapContent() {
  const [days, setDays] = useState(7);
  const { data: reports, isLoading } = useCatchMap({ days });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Show catches from:</span>
        {[3, 7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              days === d
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-[500px] items-center justify-center rounded-xl border bg-card">
          <p className="text-muted-foreground">Loading catch data...</p>
        </div>
      ) : (
        <div className="h-[calc(100vh-260px)] min-h-[500px]">
          <CatchMap reports={reports ?? []} />
        </div>
      )}

      {reports && (
        <p className="text-xs text-muted-foreground">
          {reports.length} catch{reports.length !== 1 ? "es" : ""} in the last{" "}
          {days} days
        </p>
      )}
    </div>
  );
}
