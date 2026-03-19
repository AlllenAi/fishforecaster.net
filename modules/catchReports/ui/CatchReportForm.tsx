"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubmitCatch } from "../hooks/useSubmitCatch";
import { useQuery } from "@tanstack/react-query";
import { getZones } from "@/modules/forecast/serverActions/zone.action";
import { Fish, MapPin, Send } from "lucide-react";

interface CatchReportFormProps {
  defaultZoneId?: string;
  onSuccess?: () => void;
}

export function CatchReportForm({ defaultZoneId, onSuccess }: CatchReportFormProps) {
  const { mutate: submitCatch, isPending } = useSubmitCatch();
  const { data: zones } = useQuery({
    queryKey: ["zones"],
    queryFn: () => getZones(),
  });

  const [species, setSpecies] = useState("");
  const [zoneId, setZoneId] = useState(defaultZoneId || "");
  const [caughtAt, setCaughtAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [lure, setLure] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  // Get species for selected zone
  const selectedZone = zones?.find((z) => z.id === zoneId);
  const zoneSpecies = selectedZone?.species || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    submitCatch(
      {
        species,
        zoneId,
        location: {
          lat: selectedZone?.lat || 33.5,
          lon: selectedZone?.lon || -118.0,
        },
        caughtAt: new Date(caughtAt).toISOString(),
        lure: lure || undefined,
        weight: weight ? parseFloat(weight) : undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setSpecies("");
          setLure("");
          setWeight("");
          setNotes("");
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Zone */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          <MapPin className="mr-1 inline h-3.5 w-3.5" />
          Zone
        </label>
        <select
          value={zoneId}
          onChange={(e) => {
            setZoneId(e.target.value);
            setSpecies("");
          }}
          required
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="">Select a zone...</option>
          {zones?.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name} ({z.waterType === "SALT" ? "Saltwater" : "Freshwater"})
            </option>
          ))}
        </select>
      </div>

      {/* Species */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          <Fish className="mr-1 inline h-3.5 w-3.5" />
          Species
        </label>
        {zoneSpecies.length > 0 ? (
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            required
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select species...</option>
            {zoneSpecies.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        ) : (
          <input
            type="text"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            placeholder="Enter species name"
            required
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        )}
      </div>

      {/* Date/Time */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Date & Time Caught</label>
        <input
          type="datetime-local"
          value={caughtAt}
          onChange={(e) => setCaughtAt(e.target.value)}
          required
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Lure + Weight row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Lure/Bait</label>
          <input
            type="text"
            value={lure}
            onChange={(e) => setLure(e.target.value)}
            placeholder="Optional"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Weight (lbs)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Optional"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any details about the catch..."
          maxLength={500}
          rows={3}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        <Send className="mr-2 h-4 w-4" />
        {isPending ? "Submitting..." : "Submit Catch Report"}
      </Button>
    </form>
  );
}
