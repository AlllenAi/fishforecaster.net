"use client";

import { useSearchParams } from "next/navigation";
import { useSubscription } from "../hooks/useSubscription";
import { PricingCards } from "./PricingCards";
import { PLAN_DISPLAY_NAMES } from "../types/subscription.schema";
import { CalendarDays, CreditCard, Clock } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export function AccountBilling() {
  const { data: subscription, isLoading } = useSubscription();
  const searchParams = useSearchParams();

  // Show toast on payment success/cancel
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast.success("Payment successful! Your access is now active.");
    } else if (payment === "canceled") {
      toast.info("Payment was canceled.");
    }
  }, [searchParams]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Account & Billing</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your subscription and access
        </p>
      </div>

      {/* Current Plan */}
      {isLoading ? (
        <div className="h-32 animate-pulse rounded-xl border bg-card" />
      ) : subscription?.isActive ? (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Current Plan</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium">
                  {PLAN_DISPLAY_NAMES[subscription.plan]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Expires</p>
                <p className="font-medium">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="font-medium">
                  {subscription.daysRemaining} days
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
          <h2 className="text-lg font-semibold">No Active Subscription</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a plan below to unlock fishing forecasts
          </p>
        </div>
      )}

      {/* Pricing Cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">
          {subscription?.isActive ? "Change Plan" : "Choose a Plan"}
        </h2>
        <PricingCards
          interactive={true}
          currentPlan={subscription?.isActive ? subscription.plan : null}
        />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          One-time payment. 3 months of access. No auto-renewal.
        </p>
      </div>
    </div>
  );
}
