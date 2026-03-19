"use client";

import { useQuery } from "@tanstack/react-query";
import { getCatchReports } from "../serverActions/catchReport.action";
import { getCatchStats } from "../serverActions/catchStats.action";

export function useCatchReports(filters?: {
  zoneId?: string;
  species?: string;
  days?: number;
}) {
  return useQuery({
    queryKey: ["catch-reports", filters],
    queryFn: () => getCatchReports(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCatchStats(days?: number) {
  return useQuery({
    queryKey: ["catch-stats", days],
    queryFn: () => getCatchStats({ days }),
    staleTime: 1000 * 60 * 5,
  });
}
