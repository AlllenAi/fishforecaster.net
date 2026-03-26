"use client";

import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckout } from "../hooks/useCheckout";
import type { SubscriptionPlan } from "@prisma/client";

const plans: {
  plan: SubscriptionPlan;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
}[] = [
  {
    plan: "FRESHWATER",
    name: "Freshwater",
    price: "$7",
    period: "/ 3 months",
    description: "All freshwater zones",
    features: [
      "5 freshwater zone forecasts",
      "Daily bite scores",
      "Bite window predictions",
      "Species-specific scores",
      "Captain's Call recommendations",
    ],
    highlighted: false,
  },
  {
    plan: "ALL_ACCESS",
    name: "All Access",
    price: "$12",
    period: "/ 3 months",
    description: "Everything, all zones",
    features: [
      "All 13 zone forecasts",
      "Saltwater + freshwater",
      "Daily bite scores",
      "Bite window predictions",
      "Species-specific scores",
      "Captain's Call recommendations",
      "Priority support",
    ],
    highlighted: true,
    badge: "Best Value",
  },
  {
    plan: "SALTWATER",
    name: "Saltwater",
    price: "$7",
    period: "/ 3 months",
    description: "All saltwater zones",
    features: [
      "8 saltwater zone forecasts",
      "Daily bite scores",
      "Bite window predictions",
      "Species-specific scores",
      "Captain's Call recommendations",
    ],
    highlighted: false,
  },
];

interface PricingCardsProps {
  interactive?: boolean;
  currentPlan?: SubscriptionPlan | null;
  currentTier?: "FREE" | "FRESHWATER" | "SALTWATER" | "ALL_ACCESS" | null;
}

export function PricingCards({
  interactive = true,
  currentPlan,
  currentTier,
}: PricingCardsProps) {
  // Support both currentPlan and currentTier props
  const activePlan = currentPlan ?? (currentTier && currentTier !== "FREE" ? currentTier as SubscriptionPlan : null);
  const { mutate: checkout, isPending, variables } = useCheckout();

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {plans.map((plan) => {
        const isCurrentPlan = activePlan === plan.plan;
        const isLoadingThis =
          isPending && variables?.plan === plan.plan;

        return (
          <div
            key={plan.name}
            className={cn(
              "relative rounded-2xl border p-6 transition-all",
              plan.highlighted
                ? "border-primary bg-primary/5 shadow-lg glow-excellent scale-[1.02]"
                : "bg-card hover:border-primary/30"
            )}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
                {plan.badge}
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

            {interactive ? (
              <Button
                className="mt-6 w-full"
                variant={plan.highlighted ? "default" : "outline"}
                disabled={isPending || isCurrentPlan}
                onClick={() => checkout({ plan: plan.plan })}
              >
                {isLoadingThis ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isCurrentPlan
                  ? "Current Plan"
                  : isLoadingThis
                    ? "Redirecting..."
                    : "Get Started"}
              </Button>
            ) : (
              <Button
                className="mt-6 w-full"
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <a href="/register">Get Started</a>
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
