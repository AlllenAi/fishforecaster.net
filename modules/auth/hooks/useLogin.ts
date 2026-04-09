"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { LoginInput } from "../types/auth.schema";
import { trackAuthEvent, setSentryBreadcrumb } from "@/lib/telemetry";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const signInResult = await signIn("credentials", {
        email: input.email,
        password: input.password,
        twoFactorCode: input.twoFactorCode,
        redirect: false,
      });

      if (signInResult?.error) {
        // NextAuth v5 returns "Configuration" or "CredentialsSignin" when
        // authorize() returns null — map it to a user-friendly message
        throw new Error("Invalid email or password");
      }

      return signInResult;
    },
    onSuccess: () => {
      toast.success("Welcome back!");
      trackAuthEvent("login_success");
      setSentryBreadcrumb("Login successful");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
      trackAuthEvent("login_failed", { message: error.message });
      setSentryBreadcrumb("Login failed", { message: error.message });
    },
  });
}
