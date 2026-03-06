"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { captureLead } from "../serverActions/lead.action";

export function useLeadCapture() {
  return useMutation({
    mutationFn: (email: string) => captureLead({ email }),
    onSuccess: () => {
      toast.success("You're in! Check your email for the cheat sheet.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });
}
