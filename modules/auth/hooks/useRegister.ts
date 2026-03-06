"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { register } from "../serverActions/auth.action";
import type { RegisterInput } from "../types/auth.schema";

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const result = await register(input);
      if (!result.success) throw new Error("Registration failed");

      const signInResult = await signIn("credentials", {
        email: input.email,
        password: input.password,
        redirect: false,
      });

      if (signInResult?.error) throw new Error("Failed to sign in after registration");
      return result;
    },
    onSuccess: () => {
      toast.success("Account created successfully!");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
