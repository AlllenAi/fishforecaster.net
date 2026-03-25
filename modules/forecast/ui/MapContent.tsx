"use client";

import dynamic from "next/dynamic";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useForecasts } from "../hooks/useForecasts";
import { useZones } from "../hooks/useZones";
import { WaterTypeToggle } from "./WaterTypeToggle";
import { SpeciesFilter } from "./SpeciesFilter";

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

type WaterFilter = "ALL" | "SALT" | "FRESH";

export function MapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const waterFilter = (searchParams.get("water") as WaterFilter) || "ALL";
  const speciesFilter = searchParams.get("species")?.split(",").filter(Boolean) ?? [];
  const date = formatToday();

  function setParam(key: string, val: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (val === null || val === "") params.delete(key);
    else params.set(key, val);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

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
  let filteredForecasts = (forecasts ?? []).filter((f) => {
    if (waterFilter === "ALL") return true;
    const isSalt = f.conditions.tideDirection !== null;
    return waterFilter === "SALT" ? isSalt : !isSalt;
  });

  // Filter by species
  if (speciesFilter.length > 0) {
    filteredForecasts = filteredForecasts.filter((f) =>
      f.speciesScores.some((s) => speciesFilter.includes(s.species))
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <WaterTypeToggle
          value={waterFilter}
          onChange={(v) => setParam("water", v === "ALL" ? null : v)}
        />
        <SpeciesFilter
          forecasts={forecasts ?? []}
          value={speciesFilter}
          onChange={(v) => setParam("species", v.length ? v.join(",") : null)}
        />
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
