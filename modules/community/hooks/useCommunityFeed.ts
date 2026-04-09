"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getCommunityFeed } from "../serverActions/post.action";

export function useCommunityFeed(filters?: {
  species?: string;
  search?: string;
}) {
  return useInfiniteQuery({
    queryKey: ["community-feed", filters],
    queryFn: ({ pageParam }) =>
      getCommunityFeed({ ...filters, cursor: pageParam, limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 1000 * 60 * 2,
  });
}
