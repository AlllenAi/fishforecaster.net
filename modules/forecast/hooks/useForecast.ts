// ─── useForecast Hook ───────────────────────────────────────
//
// This hook fetches a single forecast for a specific zone and date.
// Components use this like:
//   const { data: forecast, isLoading } = useForecast(zoneId, "2024-01-15");
//
// TanStack Query handles caching, loading states, and error handling
// automatically — so the component just needs to worry about rendering.

"use client";

import { useQuery } from "@tanstack/react-query";
import { getForecast } from "../serverActions/forecast.action";

export function useForecast(zoneId: string, date?: string) {
  return useQuery({
    // The queryKey is like a cache key — if zoneId or date changes,
    // it automatically fetches new data.
    queryKey: ["forecast", zoneId, date],
    queryFn: () => getForecast({ zoneId, date }),
    enabled: !!zoneId, // Don't fetch if no zoneId provided
    staleTime: 1000 * 60 * 15, // Consider data fresh for 15 minutes
  });
}
