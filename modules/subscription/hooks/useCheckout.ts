"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCheckout } from "../serverActions/stripe.action";
import type { Plan } from "../types/subscription.schema";

export function useCheckout() {
  return useMutation({
    mutationFn: async (plan: Plan) => {
      const result = await createCheckout({ plan });
      return result;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start checkout");
    },
  });
}
