"use client";

import { CircleMarker, Popup } from "react-leaflet";
import Link from "next/link";
import { ScoreLabel } from "./ScoreLabel";
import type { ForecastResult } from "../types/scoring.types";

function getScoreHexColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

type ZoneWithCoords = {
  slug: string;
  name: string;
  lat: number;
  lon: number;
};

export function ZoneMarker({
  zone,
  forecast,
}: {
  zone: ZoneWithCoords;
  forecast: ForecastResult | undefined;
}) {
  const score = forecast?.score ?? 0;
  const color = getScoreHexColor(score);
  const radius = score >= 80 ? 14 : score >= 60 ? 12 : score >= 40 ? 10 : 8;

  return (
    <CircleMarker
      center={[zone.lat, zone.lon]}
      radius={radius}
      pathOptions={{
        color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 2,
      }}
    >
      <Popup>
        <div className="min-w-[180px] space-y-2 text-sm">
          <p className="font-bold text-foreground">{zone.name}</p>
          {forecast ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold" style={{ color }}>
                  {forecast.score}
                </span>
                <ScoreLabel label={forecast.label} />
              </div>
              {forecast.biteWindows[0] && (
                <p className="text-xs text-muted-foreground">
                  Best: {forecast.biteWindows[0].start} -{" "}
                  {forecast.biteWindows[0].end}
                </p>
              )}
              <Link
                href={`/dashboard/zones/${zone.slug}`}
                className="mt-1 block text-xs font-medium text-ocean hover:underline"
              >
                View Details &rarr;
              </Link>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              No forecast available
            </p>
          )}
        </div>
      </Popup>
    </CircleMarker>
  );
}
