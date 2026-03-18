"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckout } from "../hooks/useCheckout";
import { useManageSubscription } from "../hooks/useManageSubscription";
import type { Plan } from "../types/subscription.schema";
import { PLAN_CONFIG } from "../types/subscription.schema";

interface PricingCardsProps {
  currentTier?: "FREE" | "FRESHWATER" | "SALTWATER" | "ALL_ACCESS" | null;
}

const planOrder: Plan[] = ["FRESHWATER", "ALL_ACCESS", "SALTWATER"];

// Feature comparison matrix
const featureMatrix = [
  { feature: "Freshwater Zones (5)", FRESHWATER: true, SALTWATER: false, ALL_ACCESS: true },
  { feature: "Saltwater Zones (8)", FRESHWATER: false, SALTWATER: true, ALL_ACCESS: true },
  { feature: "Daily Bite Scores", FRESHWATER: true, SALTWATER: true, ALL_ACCESS: true },
  { feature: "Bite Windows", FRESHWATER: true, SALTWATER: true, ALL_ACCESS: true },
  { feature: "Species Forecasts", FRESHWATER: true, SALTWATER: true, ALL_ACCESS: true },
  { feature: "Captain's Call", FRESHWATER: true, SALTWATER: true, ALL_ACCESS: true },
  { feature: "Map Dashboard", FRESHWATER: true, SALTWATER: true, ALL_ACCESS: true },
  { feature: "Priority Support", FRESHWATER: false, SALTWATER: false, ALL_ACCESS: true },
];

export function PricingCards({ currentTier }: PricingCardsProps) {
  const { mutate: checkout, isPending } = useCheckout();
  const { mutate: manageSubscription, isPending: isManaging } = useManageSubscription();

  const isSubscribed = currentTier && currentTier !== "FREE";

  return (
    <div>
      {/* Plan Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        {planOrder.map((planKey) => {
          const plan = PLAN_CONFIG[planKey];
          const isHighlighted = planKey === "ALL_ACCESS";
          const isCurrent = currentTier === planKey;

          return (
            <div
              key={planKey}
              className={cn(
                "relative rounded-2xl border p-6 transition-all",
                isHighlighted
                  ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                  : "bg-card hover:border-primary/30",
                isCurrent && "ring-2 ring-primary"
              )}
            >
              {"badge" in plan && plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
                  {plan.badge}
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 right-4 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-bold text-white">
                  Current Plan
                </div>
              )}

              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button
                  className="mt-6 w-full"
                  variant="outline"
                  disabled={isManaging}
                  onClick={() => manageSubscription()}
                >
                  {isManaging ? "Opening..." : "Manage Subscription"}
                </Button>
              ) : isSubscribed ? (
                <Button
                  className="mt-6 w-full"
                  variant="outline"
                  disabled={isManaging}
                  onClick={() => manageSubscription()}
                >
                  {isManaging ? "Opening..." : "Change Plan"}
                </Button>
              ) : (
                <Button
                  className="mt-6 w-full"
                  variant={isHighlighted ? "default" : "outline"}
                  disabled={isPending}
                  onClick={() => checkout(planKey)}
                >
                  {isPending ? "Loading..." : "Subscribe"}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-16">
        <h3 className="mb-6 text-center text-xl font-semibold">
          Feature Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left font-medium text-muted-foreground">Feature</th>
                <th className="pb-3 text-center font-medium">Freshwater</th>
                <th className="pb-3 text-center font-medium">Saltwater</th>
                <th className="pb-3 text-center font-medium">All Access</th>
              </tr>
            </thead>
            <tbody>
              {featureMatrix.map((row) => (
                <tr key={row.feature} className="border-b">
                  <td className="py-3 text-muted-foreground">{row.feature}</td>
                  {(["FRESHWATER", "SALTWATER", "ALL_ACCESS"] as const).map((plan) => (
                    <td key={plan} className="py-3 text-center">
                      {row[plan] ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-500" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
