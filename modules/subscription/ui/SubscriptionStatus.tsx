"use client";

import { Button } from "@/components/ui/button";
import { PlanBadge } from "./PlanBadge";
import { useSubscription } from "../hooks/useSubscription";
import { useManageSubscription } from "../hooks/useManageSubscription";
import { CreditCard, ExternalLink } from "lucide-react";

export function SubscriptionStatus() {
  const { data: subscription, isLoading } = useSubscription();
  const { mutate: manageSubscription, isPending } = useManageSubscription();

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl border p-6">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="mt-4 h-8 w-48 rounded bg-muted" />
      </div>
    );
  }

  if (!subscription) return null;

  const isFree = subscription.tier === "FREE";

  return (
    <div className="rounded-xl border p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Subscription</h3>
        <PlanBadge tier={subscription.tier} />
      </div>

      {isFree ? (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            You&apos;re on the free plan. Upgrade to unlock full forecast access.
          </p>
          <Button className="mt-4" size="sm" asChild>
            <a href="/pricing">View Plans</a>
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium capitalize">
              {subscription.status?.toLowerCase().replace("_", " ") ?? "Active"}
            </span>
          </div>

          {subscription.currentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              {subscription.cancelAtPeriodEnd
                ? "Cancels on "
                : "Renews on "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}

          {subscription.cancelAtPeriodEnd && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Your subscription will be canceled at the end of the billing period.
            </p>
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => manageSubscription()}
          >
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            {isPending ? "Opening..." : "Manage Subscription"}
          </Button>
        </div>
      )}
    </div>
  );
}
