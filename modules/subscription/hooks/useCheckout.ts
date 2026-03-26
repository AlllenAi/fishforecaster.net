"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCheckoutSession } from "../serverActions/subscription.action";
import type { CheckoutInput } from "../types/subscription.schema";

export function useCheckout() {
  return useMutation({
    mutationFn: (input: CheckoutInput) => createCheckoutSession(input),
    onSuccess: (result) => {
      // Redirect to Stripe Checkout
      window.location.href = result.url;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start checkout");
    },
  });
}
