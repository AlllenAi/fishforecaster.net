"use client";

import { useQuery } from "@tanstack/react-query";
import { getPostById } from "../serverActions/post.action";

export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: ["community-post", postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
    staleTime: 1000 * 60 * 2,
  });
}
