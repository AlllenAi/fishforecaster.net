"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAdminCommunityEvents,
  approveEvent,
  rejectEvent,
  adminDeleteEvent,
} from "@/modules/community/serverActions/moderation.action";
import type { AdminCommunityQuery } from "@/modules/community/types/community.schema";

export function useAdminCommunityEvents(query: AdminCommunityQuery) {
  return useQuery({
    queryKey: ["admin", "community-events", query],
    queryFn: () => getAdminCommunityEvents(query),
  });
}

export function useApproveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => approveEvent(eventId),
    onSuccess: () => {
      toast.success("Event approved");
      qc.invalidateQueries({ queryKey: ["admin", "community-events"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useRejectEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      reason,
    }: {
      eventId: string;
      reason?: string;
    }) => rejectEvent(eventId, reason),
    onSuccess: () => {
      toast.success("Event rejected");
      qc.invalidateQueries({ queryKey: ["admin", "community-events"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useAdminDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => adminDeleteEvent(eventId),
    onSuccess: () => {
      toast.success("Event deleted");
      qc.invalidateQueries({ queryKey: ["admin", "community-events"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e) => toast.error(e.message),
  });
}
