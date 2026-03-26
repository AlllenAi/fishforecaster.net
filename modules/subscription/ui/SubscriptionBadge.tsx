"use client";

import { cn } from "@/lib/utils";
import { useSubscription } from "../hooks/useSubscription";
import { PLAN_DISPLAY_NAMES } from "../types/subscription.schema";

export function SubscriptionBadge() {
  const { data: subscription } = useSubscription();

  if (!subscription || !subscription.isActive) {
    return (
      <span className="rounded-full border border-muted-foreground/30 px-2 py-0.5 text-xs text-muted-foreground">
        Free
      </span>
    );
  }

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        subscription.plan === "ALL_ACCESS"
          ? "bg-primary/20 text-primary"
          : "bg-accent text-accent-foreground"
      )}
    >
      {PLAN_DISPLAY_NAMES[subscription.plan]}
    </span>
  );
}
