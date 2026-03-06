"use client";

import { Button } from "@/components/ui/button";
import { ScoreCircle } from "@/modules/forecast/ui/ScoreCircle";
import { ScoreLabel } from "@/modules/forecast/ui/ScoreLabel";

export function HeroSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-[#0c1629]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        {/* Text */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Know When The
            <span className="block text-primary"> Fish Will Bite</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            AI-powered fishing forecasts combining tides, weather, moon phase,
            and swell data into one daily bite score for Southern California.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button size="lg" onClick={() => scrollTo("lead-capture")}>
              Get Your Free Forecast
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo("sample-forecast")}
            >
              View Demo
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Trusted by 500+ anglers across Southern California
          </p>
        </div>

        {/* Score preview */}
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl border bg-card/50 p-8 backdrop-blur">
            <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
              Today&apos;s Top Zone
            </p>
            <div className="flex flex-col items-center gap-3">
              <ScoreCircle score={84} size="lg" />
              <ScoreLabel label="EXCELLENT" />
              <p className="text-lg font-semibold">San Clemente Basin</p>
              <p className="text-sm text-muted-foreground">
                Best window: 5:40 AM
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
