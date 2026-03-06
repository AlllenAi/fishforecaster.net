"use client";

import { ScoreCircle } from "@/modules/forecast/ui/ScoreCircle";
import { ScoreLabel } from "@/modules/forecast/ui/ScoreLabel";
import { BiteWindowCard } from "@/modules/forecast/ui/BiteWindowCard";
import { ConditionCard } from "@/modules/forecast/ui/ConditionCard";
import { CaptainCall } from "@/modules/forecast/ui/CaptainCall";
import { Waves, Wind, Thermometer, ArrowUpDown } from "lucide-react";
import type { BiteWindow } from "@/modules/forecast/types/scoring.types";

const sampleWindows: BiteWindow[] = [
  {
    start: "05:40",
    end: "08:10",
    strength: "STRONG",
    windowType: "DAWN",
    factors: ["Incoming tide", "Low light", "Falling pressure"],
  },
  {
    start: "18:20",
    end: "19:45",
    strength: "MODERATE",
    windowType: "EVENING",
    factors: ["Outgoing tide", "Dusk feeding period"],
  },
];

export function SampleForecastSection() {
  return (
    <section id="sample-forecast" className="px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          See a <span className="text-primary">Real Forecast</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          This is what your daily forecast looks like. Real data, real
          recommendations.
        </p>

        {/* Forecast card */}
        <div className="mt-12 rounded-2xl border bg-card/80 p-6 shadow-lg backdrop-blur sm:p-8">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Live forecast example
          </div>

          {/* Header */}
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div>
              <h3 className="text-2xl font-bold">San Clemente Basin</h3>
              <div className="mt-2 flex items-center gap-2">
                <ScoreLabel label="EXCELLENT" />
                <span className="text-sm text-muted-foreground">
                  Saltwater
                </span>
              </div>
            </div>
            <ScoreCircle score={84} size="lg" />
          </div>

          {/* Bite Windows */}
          <div className="mt-8">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Best Bite Windows
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {sampleWindows.map((w, i) => (
                <BiteWindowCard key={i} window={w} />
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div className="mt-8">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Conditions
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ConditionCard
                icon={<Waves className="h-4 w-4" />}
                label="Swell"
                value="3.2 ft"
                detail="@ 14s period"
              />
              <ConditionCard
                icon={<Wind className="h-4 w-4" />}
                label="Wind"
                value="7 kt"
                detail="NW"
              />
              <ConditionCard
                icon={<Thermometer className="h-4 w-4" />}
                label="Water Temp"
                value="66°F"
              />
              <ConditionCard
                icon={<ArrowUpDown className="h-4 w-4" />}
                label="Tide Swing"
                value="5.1 ft"
              />
            </div>
          </div>

          {/* Captain's Call */}
          <div className="mt-8">
            <CaptainCall text="Great conditions for fly-lining sardines near the kelp line. Light winds and a strong incoming tide make this a prime morning for yellowtail." />
          </div>
        </div>
      </div>
    </section>
  );
}
