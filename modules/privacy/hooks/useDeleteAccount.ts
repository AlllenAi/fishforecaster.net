"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { deleteAccount } from "../serverActions/privacy.action";
import type { DeleteAccountInput } from "../types/privacy.schema";

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (input: DeleteAccountInput) => {
      const result = await deleteAccount(input);
      if (!result.success) throw new Error("Account deletion failed");
      return result;
    },
    onSuccess: () => {
      toast.success("Your account has been deleted.");
      signOut({ callbackUrl: "/" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
