"use client";

import { Target, TrendingUp, TrendingDown } from "lucide-react";
import { useForecastAccuracy } from "../hooks/useForecastAccuracy";

export function ForecastAccuracy({ zoneId }: { zoneId: string }) {
  const { data, isLoading } = useForecastAccuracy(zoneId, 30);

  if (isLoading) {
    return (
      <div className="rounded-xl border p-6">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Forecast Accuracy</h3>
        </div>
        <div className="mt-4 animate-pulse space-y-3">
          <div className="h-5 w-40 rounded bg-muted" />
          <div className="h-5 w-56 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!data || data.totalForecasts === 0 || data.totalCatches === 0) {
    return (
      <div className="rounded-xl border p-6">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Forecast Accuracy</h3>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Not enough data yet. Catch reports and forecasts from the last 30 days
          are used to measure accuracy.
        </p>
      </div>
    );
  }

  const { accuracy, totalForecasts, totalCatches, dataPoints } = data;
  const isPositive = accuracy.correlationPositive;

  // Calculate a simple accuracy percentage:
  // If high-score days have more catches than low-score days, that's good.
  // We express it as how much more productive high-score days are.
  const ratio =
    accuracy.avgCatchesOnLowScoreDays > 0
      ? accuracy.avgCatchesOnHighScoreDays / accuracy.avgCatchesOnLowScoreDays
      : accuracy.avgCatchesOnHighScoreDays > 0
        ? 2
        : 1;

  // Find the best and worst predicted days that had actual data
  const withCatches = dataPoints.filter((d) => d.actualCatches > 0);
  const bestDay = withCatches.sort(
    (a, b) => b.actualCatches - a.actualCatches
  )[0];

  return (
    <div className="rounded-xl border p-6">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Forecast Accuracy</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          Last 30 days
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {/* Correlation indicator */}
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-orange-500" />
            )}
            <span
              className={`text-lg font-bold ${isPositive ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}
            >
              {isPositive ? `${ratio.toFixed(1)}x` : "Weak"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {isPositive
              ? "More catches on high-score days"
              : "Correlation needs more data"}
          </p>
        </div>

        {/* Data volume */}
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <span className="text-lg font-bold">{totalCatches}</span>
          <p className="mt-1 text-xs text-muted-foreground">
            Catches across {totalForecasts} forecast days
          </p>
        </div>

        {/* Avg catches on high vs low days */}
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="font-bold text-green-600 dark:text-green-400">
              {accuracy.avgCatchesOnHighScoreDays}
            </span>
            <span className="text-muted-foreground">vs</span>
            <span className="font-bold text-orange-600 dark:text-orange-400">
              {accuracy.avgCatchesOnLowScoreDays}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Avg catches: high vs low score days
          </p>
        </div>
      </div>

      {/* Best day callout */}
      {bestDay && (
        <p className="mt-3 text-xs text-muted-foreground">
          Best day: {bestDay.date} — {bestDay.actualCatches} catch
          {bestDay.actualCatches !== 1 ? "es" : ""} (predicted score:{" "}
          {bestDay.predictedScore})
        </p>
      )}
    </div>
  );
}
