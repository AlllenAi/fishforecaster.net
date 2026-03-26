"use client";

import { useQuery } from "@tanstack/react-query";
import { getSubscriptionStatus } from "../serverActions/subscription.action";

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: () => getSubscriptionStatus(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
