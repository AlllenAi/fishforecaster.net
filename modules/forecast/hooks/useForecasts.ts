// ─── useForecasts Hook ──────────────────────────────────────
//
// Fetches forecasts for ALL zones on a given date.
// Used on the main dashboard to show all zones at once.

"use client";

import { useQuery } from "@tanstack/react-query";
import { getForecasts } from "../serverActions/forecast.action";

export function useForecasts(date?: string) {
  return useQuery({
    queryKey: ["forecasts", date],
    queryFn: () => getForecasts({ date }),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}
