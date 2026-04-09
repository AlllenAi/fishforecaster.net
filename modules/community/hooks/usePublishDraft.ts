"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { publishDraft } from "../serverActions/post.action";

export function usePublishDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => publishDraft(postId),
    onSuccess: () => {
      toast.success("Post submitted for review! It will appear after admin approval.");
      queryClient.invalidateQueries({ queryKey: ["my-community-posts"] });
    },
    onError: (error) => {
      if (error.message?.includes("Upgrade")) {
        toast.error("Upgrade to a paid plan to publish your post");
      } else {
        toast.error(error.message || "Failed to publish post");
      }
    },
  });
}
