"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { sendPasswordResetRequest } from "../serverActions/auth.action";
import { trackAuthEvent, setSentryBreadcrumb } from "@/lib/telemetry";

export function useForgotPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (email: string) => {
      const result = await sendPasswordResetRequest(email);
      if (!result.success) {
        throw new Error(result.message || "Failed to send password-reset email");
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Reset link sent if the email is registered.");
      trackAuthEvent("password_reset_requested");
      setSentryBreadcrumb("Password reset requested");
      router.push("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message);
      trackAuthEvent("password_reset_failed", { error: error.message });
      setSentryBreadcrumb("Password reset failed", { reason: error.message });
    },
  });
}
