"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useCreateEvent } from "../hooks/useCreateEvent";
import { uploadCommunityPhotos } from "../services/imageUploadService";
import { Camera, X, Send, MapPin, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CreateEventFormProps {
  isFreeUser?: boolean;
  onSuccess?: () => void;
}

export function CreateEventForm({
  isFreeUser,
  onSuccess,
}: CreateEventFormProps) {
  const { mutate: createEvent, isPending } = useCreateEvent();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let photoUrl: string | undefined;
    if (photoFile) {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("photos", photoFile);
        const urls = await uploadCommunityPhotos(formData);
        photoUrl = urls[0];
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Photo upload failed"
        );
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    createEvent(
      {
        title,
        description,
        photoUrl,
        location,
        eventDate,
        endDate: endDate || undefined,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setLocation("");
          setEventDate("");
          setEndDate("");
          if (photoPreview) URL.revokeObjectURL(photoPreview);
          setPhotoFile(null);
          setPhotoPreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isFreeUser && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
          <p className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
            Free Preview Mode
          </p>
          <p className="mt-1 text-muted-foreground">
            Your event will be saved as a draft. Upgrade to a paid plan to share
            it with the community!
          </p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Event Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Weekend Bass Tournament"
          required
          maxLength={200}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us about the event, rules, what to bring..."
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm"
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {description.length}/5000
        </p>
      </div>

      {/* Event Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            <Calendar className="mr-1 inline h-3.5 w-3.5" />
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            <Calendar className="mr-1 inline h-3.5 w-3.5" />
            End Date & Time (optional)
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          <MapPin className="mr-1 inline h-3.5 w-3.5" />
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Lake Castaic Marina, CA"
          required
          maxLength={200}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Cover Photo */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          <Camera className="mr-1 inline h-3.5 w-3.5" />
          Cover Photo (optional)
        </label>
        {photoPreview && (
          <div className="relative mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreview}
              alt="Cover preview"
              className="h-40 w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {!photoFile && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending || isUploading}
        className="w-full"
      >
        <Send className="mr-2 h-4 w-4" />
        {isUploading
          ? "Uploading photo..."
          : isPending
            ? "Submitting..."
            : isFreeUser
              ? "Save Draft"
              : "Submit for Review"}
      </Button>
    </form>
  );
}
