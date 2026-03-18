"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createPortalSession } from "../serverActions/stripe.action";

export function useManageSubscription() {
  return useMutation({
    mutationFn: async () => {
      const result = await createPortalSession();
      return result;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Billing Portal
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to open subscription management");
    },
  });
}
