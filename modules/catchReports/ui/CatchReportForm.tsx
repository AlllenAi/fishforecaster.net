"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSubmitCatch } from "../hooks/useSubmitCatch";
import { useQuery } from "@tanstack/react-query";
import { getZones } from "@/modules/forecast/serverActions/zone.action";
import { uploadCatchPhoto } from "../services/imageUploadService";
import { Fish, MapPin, Send, Camera, X } from "lucide-react";
import { toast } from "sonner";

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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get species for selected zone
  const selectedZone = zones?.find((z) => z.id === zoneId);
  const zoneSpecies = selectedZone?.species || [];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Image must be JPEG, PNG, or WebP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let photoUrl: string | undefined;
    if (photoFile) {
      try {
        setIsUploading(true);
        photoUrl = await uploadCatchPhoto(photoFile);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Photo upload failed");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

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
        photoUrl,
      },
      {
        onSuccess: () => {
          setSpecies("");
          setLure("");
          setWeight("");
          setNotes("");
          clearPhoto();
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

      {/* Photo */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          <Camera className="mr-1 inline h-3.5 w-3.5" />
          Photo
        </label>
        {photoPreview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreview}
              alt="Catch preview"
              className="h-40 w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
        )}
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

      <Button type="submit" disabled={isPending || isUploading} className="w-full">
        <Send className="mr-2 h-4 w-4" />
        {isUploading ? "Uploading photo..." : isPending ? "Submitting..." : "Submit Catch Report"}
      </Button>
    </form>
  );
}
