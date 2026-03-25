"use client";

import { useState } from "react";
import { useZoneDetail } from "../hooks/useZoneDetail";
import { useForecast } from "../hooks/useForecast";
import { ScoreCircle } from "./ScoreCircle";
import { ScoreLabel } from "./ScoreLabel";
import { BiteWindowTimeline } from "./BiteWindowTimeline";
import { ConditionsGrid } from "./ConditionsGrid";
import { SpeciesScoreRow } from "./SpeciesScoreRow";
import { CaptainCall } from "./CaptainCall";
import { DatePicker } from "./DatePicker";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

function formatToday(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ZoneDetailContent({ slug }: { slug: string }) {
  const [date, setDate] = useState(formatToday);
  const { data: zone, isLoading: zoneLoading } = useZoneDetail(slug);
  const {
    data: forecast,
    isLoading: forecastLoading,
    error,
  } = useForecast(zone?.id ?? "", date);

  const isLoading = zoneLoading || forecastLoading;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-foreground">{zone?.name ?? "Loading..."}</span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-xl border bg-card" />
          <div className="h-60 animate-pulse rounded-xl border bg-card" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">
            Failed to load forecast. Please try again.
          </p>
        </div>
      )}

      {/* Forecast content */}
      {forecast && (
        <>
          {/* Hero Section */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
              <div className="text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <h1 className="text-2xl font-bold">{forecast.zoneName}</h1>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {forecast.conditions.tideDirection !== null
                      ? "Saltwater"
                      : "Freshwater"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-center gap-3 sm:justify-start">
                  <ScoreLabel label={forecast.label} />
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    {forecast.confidence} confidence
                  </span>
                </div>
                <div className="mt-3">
                  <DatePicker value={date} onChange={setDate} />
                </div>
              </div>
              <ScoreCircle score={forecast.score} size="lg" />
            </div>
          </div>

          {/* Captain's Call */}
          {forecast.captainCall && (
            <CaptainCall text={forecast.captainCall} />
          )}

          {/* Bite Windows */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Bite Windows</h2>
            <BiteWindowTimeline
              windows={forecast.biteWindows}
              sunrise={forecast.conditions.sunrise}
              sunset={forecast.conditions.sunset}
            />
          </section>

          {/* Conditions */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Conditions</h2>
            <ConditionsGrid conditions={forecast.conditions} />
          </section>

          {/* Species Scores */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Species Scores</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {forecast.speciesScores.map((s) => (
                <SpeciesScoreRow key={s.species} species={s} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
