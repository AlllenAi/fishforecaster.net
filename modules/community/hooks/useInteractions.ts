"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleLike } from "../serverActions/interaction.action";
import { addComment, deleteComment, getComments } from "../serverActions/interaction.action";

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-feed"] });
      queryClient.invalidateQueries({ queryKey: ["community-post"] });
    },
    onError: (error) => {
      if (error.message?.includes("Upgrade")) {
        toast.error("Upgrade to a paid plan to like posts");
      } else {
        toast.error(error.message || "Failed to toggle like");
      }
    },
  });
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ["community-comments", postId],
    queryFn: () => getComments({ postId }),
    enabled: !!postId,
    staleTime: 1000 * 60,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { postId: string; text: string }) => addComment(input),
    onSuccess: (_, variables) => {
      toast.success("Comment added");
      queryClient.invalidateQueries({
        queryKey: ["community-comments", variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ["community-post"] });
      queryClient.invalidateQueries({ queryKey: ["community-feed"] });
    },
    onError: (error) => {
      if (error.message?.includes("Upgrade")) {
        toast.error("Upgrade to a paid plan to comment");
      } else {
        toast.error(error.message || "Failed to add comment");
      }
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      toast.success("Comment deleted");
      queryClient.invalidateQueries({ queryKey: ["community-comments"] });
      queryClient.invalidateQueries({ queryKey: ["community-post"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });
}
