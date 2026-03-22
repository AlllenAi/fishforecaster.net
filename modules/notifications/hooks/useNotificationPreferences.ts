"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../serverActions/notification.action";
import type { NotificationPreferences } from "../types/notification.schema";

export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => getNotificationPreferences(),
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: (prefs: NotificationPreferences) =>
      updateNotificationPreferences(prefs),
    onSuccess: () => {
      toast.success("Notification preferences updated");
      queryClient.invalidateQueries({
        queryKey: ["notification-preferences"],
      });
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
