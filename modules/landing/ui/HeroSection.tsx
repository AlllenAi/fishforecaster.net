"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLeadCapture } from "../hooks/useLeadCapture";
import { Check } from "lucide-react";

export function HeroSection() {
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess } = useLeadCapture();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) mutate(email.trim());
  };

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

        {/* Promo video */}
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur aspect-video">
            <iframe
              src="https://www.youtube.com/embed/7h0ETkUD2Eg"
              title="TheFishForecaster Promo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
          {isSuccess ? (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-score-excellent">
              <Check className="h-4 w-4" />
              <span>Check your email for the cheat sheet!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "..." : "Sign Up"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
