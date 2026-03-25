// Leaflet must be loaded client-side only (no SSR) because it uses
// the browser's `window` object. That's why this file has "use client"
// and the map page uses dynamic() import with ssr: false.

"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { ForecastResult } from "../types/scoring.types";
import { ZoneMarker } from "./ZoneMarker";

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

      {markers.map(({ zone, forecast }) => (
        <ZoneMarker key={zone.slug} zone={zone} forecast={forecast} />
      ))}
    </MapContainer>
  );
}
