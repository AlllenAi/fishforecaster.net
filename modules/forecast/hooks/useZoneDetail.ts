// ─── useZoneDetail Hook ─────────────────────────────────────
//
// Fetches a single zone's details by its slug (URL-friendly name).
// Used on the zone detail page (e.g., /zones/san-diego-offshore).

"use client";

import { useQuery } from "@tanstack/react-query";
import { getZone } from "../serverActions/zone.action";

export function useZoneDetail(slug: string) {
  return useQuery({
    queryKey: ["zone", slug],
    queryFn: () => getZone(slug),
    enabled: !!slug, // Don't fetch if no slug
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
