"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface CatchMapPin {
  id: string;
  species: string;
  zoneName: string;
  location: { lat: number; lon: number };
  caughtAt: Date;
  lure: string | null;
  weight: number | null;
  userName: string;
}

function getSpeciesColor(species: string): string {
  // Deterministic color based on species name
  let hash = 0;
  for (let i = 0; i < species.length; i++) {
    hash = species.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 55%)`;
}

export function CatchMap({ reports }: { reports: CatchMapPin[] }) {
  useEffect(() => {
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={[33.5, -118.0]}
      zoom={8}
      className="h-full w-full rounded-xl"
      style={{ minHeight: "500px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {reports.map((report) => {
        const color = getSpeciesColor(report.species);
        const hoursAgo = Math.floor(
          (Date.now() - new Date(report.caughtAt).getTime()) / (1000 * 60 * 60)
        );
        const timeLabel =
          hoursAgo < 1
            ? "Just now"
            : hoursAgo < 24
              ? `${hoursAgo}h ago`
              : `${Math.floor(hoursAgo / 24)}d ago`;

        return (
          <CircleMarker
            key={report.id}
            center={[report.location.lat, report.location.lon]}
            radius={hoursAgo < 24 ? 10 : hoursAgo < 72 ? 8 : 6}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: hoursAgo < 24 ? 0.8 : 0.5,
              weight: 2,
            }}
          >
            <Popup>
              <div className="min-w-[160px] space-y-1 text-sm">
                <p className="font-bold">{report.species}</p>
                <p className="text-xs text-muted-foreground">{report.zoneName}</p>
                {report.weight && (
                  <p className="text-xs">{report.weight} lbs</p>
                )}
                {report.lure && (
                  <p className="text-xs">Lure: {report.lure}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {timeLabel} &middot; {report.userName}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
