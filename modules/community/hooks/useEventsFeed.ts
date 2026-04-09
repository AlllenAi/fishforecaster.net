"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getEventsFeed } from "../serverActions/event.action";

export function useEventsFeed(filters?: {
  search?: string;
  upcoming?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: ["events-feed", filters],
    queryFn: ({ pageParam }) =>
      getEventsFeed({ ...filters, cursor: pageParam, limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 1000 * 60 * 2,
  });
}
