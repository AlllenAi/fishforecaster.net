"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAdminCommunityPosts,
  approvePost,
  rejectPost,
  adminDeletePost,
  adminRestorePost,
} from "@/modules/community/serverActions/moderation.action";
import type { AdminCommunityQuery } from "@/modules/community/types/community.schema";

export function useAdminCommunityPosts(query: AdminCommunityQuery) {
  return useQuery({
    queryKey: ["admin", "community-posts", query],
    queryFn: () => getAdminCommunityPosts(query),
  });
}

export function useApprovePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => approvePost(postId),
    onSuccess: () => {
      toast.success("Post approved");
      qc.invalidateQueries({ queryKey: ["admin", "community-posts"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useRejectPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, reason }: { postId: string; reason?: string }) =>
      rejectPost(postId, reason),
    onSuccess: () => {
      toast.success("Post rejected");
      qc.invalidateQueries({ queryKey: ["admin", "community-posts"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useAdminDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => adminDeletePost(postId),
    onSuccess: () => {
      toast.success("Post deleted");
      qc.invalidateQueries({ queryKey: ["admin", "community-posts"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useAdminRestorePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => adminRestorePost(postId),
    onSuccess: () => {
      toast.success("Post restored");
      qc.invalidateQueries({ queryKey: ["admin", "community-posts"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e) => toast.error(e.message),
  });
}
