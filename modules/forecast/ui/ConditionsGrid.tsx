"use client";

import type { ForecastConditions } from "../types/scoring.types";
import { ConditionCard } from "./ConditionCard";
import {
  Waves,
  Wind,
  Thermometer,
  ArrowUpDown,
  Gauge,
  Moon,
  Cloud,
  Sun,
} from "lucide-react";

const trendArrow: Record<string, string> = {
  RISING: "Rising",
  FALLING: "Falling",
  STABLE: "Stable",
};

export function ConditionsGrid({
  conditions,
}: {
  conditions: ForecastConditions;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {conditions.waveHeight != null && (
        <ConditionCard
          icon={<Waves className="h-4 w-4" />}
          label="Swell"
          value={`${conditions.waveHeight.toFixed(1)} ft`}
          detail={
            conditions.wavePeriod
              ? `@ ${conditions.wavePeriod}s period`
              : undefined
          }
        />
      )}

      {conditions.windSpeed != null && (
        <ConditionCard
          icon={<Wind className="h-4 w-4" />}
          label="Wind"
          value={`${conditions.windSpeed.toFixed(0)} kt`}
          detail={conditions.windDirection ?? undefined}
        />
      )}

      {conditions.waterTemp != null && (
        <ConditionCard
          icon={<Thermometer className="h-4 w-4" />}
          label="Water Temp"
          value={`${conditions.waterTemp.toFixed(0)}°F`}
        />
      )}

      {conditions.tideDirection != null && (
        <ConditionCard
          icon={<ArrowUpDown className="h-4 w-4" />}
          label="Tide"
          value={conditions.tideDirection}
        />
      )}

      {conditions.pressure != null && (
        <ConditionCard
          icon={<Gauge className="h-4 w-4" />}
          label="Pressure"
          value={`${conditions.pressure.toFixed(0)} hPa`}
          detail={
            conditions.pressureTrend
              ? trendArrow[conditions.pressureTrend]
              : undefined
          }
        />
      )}

      <ConditionCard
        icon={<Moon className="h-4 w-4" />}
        label="Moon"
        value={conditions.moonPhase.replace(/_/g, " ")}
        detail={`${conditions.moonIllumination}% illuminated`}
      />

      {conditions.cloudCover != null && (
        <ConditionCard
          icon={<Cloud className="h-4 w-4" />}
          label="Cloud Cover"
          value={`${conditions.cloudCover}%`}
        />
      )}

      {conditions.airTemp != null && (
        <ConditionCard
          icon={<Sun className="h-4 w-4" />}
          label="Air Temp"
          value={`${conditions.airTemp.toFixed(0)}°F`}
          detail={
            conditions.sunrise && conditions.sunset
              ? `${conditions.sunrise} - ${conditions.sunset}`
              : undefined
          }
        />
      )}
    </div>
  );
}
