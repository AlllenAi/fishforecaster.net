"use client";

import {
  Target,
  Clock,
  Fish,
  Satellite,
  MapPin,
  Compass,
} from "lucide-react";
import type { ReactNode } from "react";

const features: { icon: ReactNode; title: string; description: string }[] = [
  {
    icon: <Target className="h-6 w-6" />,
    title: "Bite Score",
    description: "One number tells you if today is worth fishing.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Best Windows",
    description: "Know exactly when to be on the water.",
  },
  {
    icon: <Fish className="h-6 w-6" />,
    title: "Species Forecasts",
    description: "Scores tailored to your target species.",
  },
  {
    icon: <Satellite className="h-6 w-6" />,
    title: "Real-Time Data",
    description: "Live tides, buoys, weather, and moon phase.",
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "SoCal Coverage",
    description: "13 zones from San Diego to Santa Barbara.",
  },
  {
    icon: <Compass className="h-6 w-6" />,
    title: "Captain's Call",
    description: "AI-powered tactical recommendations.",
  },
];

export function FeaturesSection() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Everything You Need to
          <span className="text-primary"> Fish Smarter</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          We crunch the data so you don&apos;t have to. Eight real-time data
          sources combined into one actionable forecast.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
