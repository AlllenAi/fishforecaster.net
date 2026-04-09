"use client";

import { useQuery } from "@tanstack/react-query";
import { getEventById } from "../serverActions/event.action";

export function useEventDetail(eventId: string) {
  return useQuery({
    queryKey: ["community-event", eventId],
    queryFn: () => getEventById(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2,
  });
}
