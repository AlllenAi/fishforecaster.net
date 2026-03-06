"use client";

import { MapPin, BarChart3, Anchor } from "lucide-react";
import type { ReactNode } from "react";

const steps: { number: number; icon: ReactNode; title: string; description: string }[] = [
  {
    number: 1,
    icon: <MapPin className="h-6 w-6" />,
    title: "Choose Your Zone",
    description:
      "Pick from 13 SoCal saltwater and freshwater zones — from San Diego to Santa Barbara.",
  },
  {
    number: 2,
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Check Your Score",
    description:
      "Our algorithm crunches 8+ data sources into one bite score from 0-100.",
  },
  {
    number: 3,
    icon: <Anchor className="h-6 w-6" />,
    title: "Fish The Window",
    description:
      "Hit the water during peak bite windows for the best results.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          How It <span className="text-primary">Works</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Three steps to better fishing days.
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} className="relative text-center">
              {/* Connecting line (hidden on mobile, shown between steps on desktop) */}
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-10 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-primary/50 to-transparent sm:block" />
              )}

              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary">
                {step.icon}
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step.number}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
