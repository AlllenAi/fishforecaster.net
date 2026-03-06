// ─── useZones Hook ──────────────────────────────────────────
//
// Fetches the list of fishing zones, optionally filtered by water type.
// Used for zone listing pages and dropdown selectors.

"use client";

import { useQuery } from "@tanstack/react-query";
import { getZones } from "../serverActions/zone.action";

export function useZones(waterType?: "SALT" | "FRESH") {
  return useQuery({
    queryKey: ["zones", waterType],
    queryFn: () => getZones(waterType ? { waterType } : undefined),
    staleTime: 1000 * 60 * 60, // Zones rarely change — cache for 1 hour
  });
}
