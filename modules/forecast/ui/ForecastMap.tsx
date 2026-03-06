// Leaflet must be loaded client-side only (no SSR) because it uses
// the browser's `window` object. That's why this file has "use client"
// and the map page uses dynamic() import with ssr: false.

"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { ForecastResult } from "../types/scoring.types";
import Link from "next/link";
import { ScoreLabel } from "./ScoreLabel";

function getScoreHexColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

// We need zone coordinates. Since forecasts don't include lat/lon,
// we pass zones alongside forecasts.
type ZoneWithCoords = {
  slug: string;
  name: string;
  lat: number;
  lon: number;
};

export function ForecastMap({
  forecasts,
  zones,
}: {
  forecasts: ForecastResult[];
  zones: ZoneWithCoords[];
}) {
  // Fix Leaflet default icon issue in Next.js
  useEffect(() => {
    // Leaflet expects icons from a specific path; this fixes it in bundled apps
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  // Match forecasts to zones by name
  const markers = zones.map((zone) => {
    const forecast = forecasts.find((f) => f.zoneName === zone.name);
    return { zone, forecast };
  });

  return (
    <MapContainer
      center={[33.5, -118.0]}
      zoom={8}
      className="h-full w-full rounded-xl"
      style={{ minHeight: "500px" }}
    >
      {/* Dark map tiles from CartoDB */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {markers.map(({ zone, forecast }) => {
        const score = forecast?.score ?? 0;
        const color = getScoreHexColor(score);
        const radius = score >= 80 ? 14 : score >= 60 ? 12 : score >= 40 ? 10 : 8;

        return (
          <CircleMarker
            key={zone.slug}
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
                      <span
                        className="text-2xl font-bold"
                        style={{ color }}
                      >
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
      })}
    </MapContainer>
  );
}
