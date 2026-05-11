"use client";

import { AlertTriangle, Info } from "lucide-react";
import type { ForecastConditions } from "../types/scoring.types";

type Props = {
  marineAlert: ForecastConditions["marineAlert"];
  marineForecastText: ForecastConditions["marineForecastText"];
};

export function MarineAlertBanner({ marineAlert, marineForecastText }: Props) {
  if (!marineAlert && !marineForecastText) return null;

  const severity = marineAlert?.severity?.toLowerCase() ?? "";
  const event = marineAlert?.event ?? "";
  const isStorm =
    event.toLowerCase().includes("storm warning") ||
    event.toLowerCase().includes("hurricane") ||
    event.toLowerCase().includes("hazardous seas");
  const isGale = event.toLowerCase().includes("gale");

  const alertColors = isStorm
    ? "border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-400"
    : isGale
    ? "border-orange-500/60 bg-orange-500/10 text-orange-700 dark:text-orange-400"
    : "border-yellow-500/60 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";

  return (
    <div className="space-y-3">
      {/* Active alert banner */}
      {marineAlert && (
        <div className={`flex gap-3 rounded-xl border p-4 ${alertColors}`}>
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold">{marineAlert.event}</p>
            {marineAlert.headline && (
              <p className="text-sm opacity-90">{marineAlert.headline}</p>
            )}
            <p className="text-xs opacity-70 uppercase tracking-wide">
              Severity: {marineAlert.severity} · Source: NOAA / NWS
            </p>
          </div>
        </div>
      )}

      {/* NWS marine forecast text */}
      {marineForecastText && (
        <div className="flex gap-3 rounded-xl border bg-card p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              NOAA Marine Forecast
            </p>
            <p className="text-sm text-card-foreground">{marineForecastText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
