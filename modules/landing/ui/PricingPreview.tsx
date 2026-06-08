"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Freshwater",
    price: "$8.99",
    period: "/ 3 months",
    description: "All freshwater zones",
    features: [
      "8 freshwater zone forecasts",
      "Daily bite scores",
      "Bite window predictions",
      "Species-specific scores",
      "Captain's Call recommendations",
    ],
    highlighted: false,
  },
  {
    name: "All Access",
    price: "$12.99",
    period: "/ 3 months",
    description: "Everything, all zones",
    features: [
      "All 22 zone forecasts",
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
    name: "Saltwater",
    price: "$8.99",
    period: "/ 3 months",
    description: "All saltwater zones",
    features: [
      "14 saltwater zone forecasts",
      "Daily bite scores",
      "Bite window predictions",
      "Species-specific scores",
      "Captain's Call recommendations",
    ],
    highlighted: false,
  },
];

export function PricingPreview() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Simple, Honest <span className="text-primary">Pricing</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Choose the water you fish. One-time payment, 3 months access.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {plans.map((plan) => (
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

              <Button
                className="mt-6 w-full"
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <a href="/register">Get Started</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
