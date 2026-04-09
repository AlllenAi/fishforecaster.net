"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyPosts } from "../serverActions/post.action";

export function useMyPosts() {
  return useQuery({
    queryKey: ["my-community-posts"],
    queryFn: () => getMyPosts(),
    staleTime: 1000 * 60 * 2,
  });
}
