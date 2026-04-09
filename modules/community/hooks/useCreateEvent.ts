"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createEvent } from "../serverActions/event.action";

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Record<string, unknown>) => createEvent(input),
    onSuccess: (data) => {
      if (data.status === "DRAFT") {
        toast.success(
          "Your event has been saved! Upgrade to a paid plan to share it with the community."
        );
      } else {
        toast.success(
          "Event submitted! It will appear in the feed after admin approval."
        );
      }
      queryClient.invalidateQueries({ queryKey: ["events-feed"] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create event");
    },
  });
}
