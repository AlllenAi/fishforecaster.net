"use client";

import { useQuery } from "@tanstack/react-query";
import { getMySubscription } from "../serverActions/subscription.action";

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: () => getMySubscription(),
    staleTime: 1000 * 60 * 5, // Fresh for 5 minutes
  });
}
