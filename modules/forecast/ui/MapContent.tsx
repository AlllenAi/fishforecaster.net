"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useForecasts } from "../hooks/useForecasts";
import { useZones } from "../hooks/useZones";
import { WaterTypeToggle } from "./WaterTypeToggle";

// Dynamic import with SSR disabled — Leaflet cannot run on the server
const ForecastMap = dynamic(
  () => import("./ForecastMap").then((mod) => mod.ForecastMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="flex h-[500px] items-center justify-center rounded-xl border bg-card">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  );
}

function formatToday(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function MapContent() {
  const [waterFilter, setWaterFilter] = useState<"ALL" | "SALT" | "FRESH">("ALL");
  const date = formatToday();

  const { data: forecasts, isLoading: forecastsLoading } = useForecasts(date);
  const { data: zones, isLoading: zonesLoading } = useZones(
    waterFilter === "ALL" ? undefined : waterFilter
  );

  const isLoading = forecastsLoading || zonesLoading;

  // Build zone list with coordinates for the map
  const zoneCoords = (zones ?? []).map((z) => ({
    slug: z.slug,
    name: z.name,
    lat: z.lat,
    lon: z.lon,
  }));

  // Filter forecasts by water type
  const filteredForecasts = (forecasts ?? []).filter((f) => {
    if (waterFilter === "ALL") return true;
    const isSalt = f.conditions.tideDirection !== null;
    return waterFilter === "SALT" ? isSalt : !isSalt;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <WaterTypeToggle value={waterFilter} onChange={setWaterFilter} />
      </div>

      {isLoading ? (
        <MapSkeleton />
      ) : (
        <div className="h-[calc(100vh-220px)] min-h-[500px]">
          <ForecastMap forecasts={filteredForecasts} zones={zoneCoords} />
        </div>
      )}
    </div>
  );
}
