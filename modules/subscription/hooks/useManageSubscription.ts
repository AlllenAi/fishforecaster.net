"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createPortalSession } from "../serverActions/subscription.action";

export function useManageSubscription() {
  return useMutation({
    mutationFn: async () => {
      const result = await createPortalSession();
      return result;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to open subscription management");
    },
  });
}
