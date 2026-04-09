"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleRSVP } from "../serverActions/event.action";

export function useToggleRSVP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { eventId: string; status: "GOING" | "INTERESTED" }) =>
      toggleRSVP(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events-feed"] });
      queryClient.invalidateQueries({ queryKey: ["community-event"] });
    },
    onError: (error) => {
      if (error.message?.includes("Upgrade")) {
        toast.error("Upgrade to a paid plan to RSVP to events");
      } else {
        toast.error(error.message || "Failed to update RSVP");
      }
    },
  });
}
