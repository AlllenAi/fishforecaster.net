"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getEmailPreferences,
  updateEmailPreferences,
} from "../serverActions/email.action";
import type { EmailPreferences } from "../types/email.schema";

export function useEmailPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["email-preferences"],
    queryFn: () => getEmailPreferences(),
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: (prefs: EmailPreferences) => updateEmailPreferences(prefs),
    onSuccess: () => {
      toast.success("Email preferences updated");
      queryClient.invalidateQueries({ queryKey: ["email-preferences"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update preferences");
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    updatePreferences: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
