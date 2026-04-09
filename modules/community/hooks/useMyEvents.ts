"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyEvents } from "../serverActions/event.action";

export function useMyEvents() {
  return useQuery({
    queryKey: ["my-events"],
    queryFn: () => getMyEvents(),
    staleTime: 1000 * 60 * 2,
  });
}
