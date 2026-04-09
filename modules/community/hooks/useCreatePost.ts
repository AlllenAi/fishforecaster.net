"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createPost } from "../serverActions/post.action";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Record<string, unknown>) => createPost(input),
    onSuccess: (data) => {
      if (data.status === "DRAFT") {
        toast.success(
          "Your post has been saved! Upgrade to a paid plan to share it with the community."
        );
      } else {
        toast.success(
          "Post submitted! It will appear in the feed after admin approval."
        );
      }
      queryClient.invalidateQueries({ queryKey: ["community-feed"] });
      queryClient.invalidateQueries({ queryKey: ["my-community-posts"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });
}
