"use client";

import { useQuery } from "@tanstack/react-query";
import { getCatchMapData } from "../serverActions/catchReport.action";

export function useCatchMap(filters?: {
  days?: number;
  species?: string;
  waterType?: "SALT" | "FRESH";
}) {
  return useQuery({
    queryKey: ["catch-map", filters],
    queryFn: () => getCatchMapData(filters),
    staleTime: 1000 * 60 * 5,
  });
}
