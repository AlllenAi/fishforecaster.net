"use client";

import { useQuery } from "@tanstack/react-query";
import { getForecastAccuracy } from "../serverActions/catchStats.action";

export function useForecastAccuracy(zoneId: string, days: number = 30) {
  return useQuery({
    queryKey: ["forecast-accuracy", zoneId, days],
    queryFn: () => getForecastAccuracy({ zoneId, days }),
    enabled: !!zoneId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
