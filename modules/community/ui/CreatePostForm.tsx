"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useCreatePost } from "../hooks/useCreatePost";
import { uploadCommunityPhotos } from "../services/imageUploadService";
import { Camera, X, Send, MapPin, Fish, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CreatePostFormProps {
  isFreeUser?: boolean;
  onSuccess?: () => void;
}

export function CreatePostForm({ isFreeUser, onSuccess }: CreatePostFormProps) {
  const { mutate: createPost, isPending } = useCreatePost();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [location, setLocation] = useState("");
  const [speciesInput, setSpeciesInput] = useState("");
  const [speciesList, setSpeciesList] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photoFiles.length + files.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        toast.error("Images must be JPEG, PNG, or WebP");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Each image must be under 5MB");
        return;
      }
    }

    setPhotoFiles((prev) => [...prev, ...files]);
    setPhotoPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addSpecies = () => {
    const trimmed = speciesInput.trim();
    if (trimmed && !speciesList.includes(trimmed) && speciesList.length < 10) {
      setSpeciesList((prev) => [...prev, trimmed]);
      setSpeciesInput("");
    }
  };

  const removeSpecies = (species: string) => {
    setSpeciesList((prev) => prev.filter((s) => s !== species));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photoFiles.length === 0) {
      toast.error("Please add at least one photo");
      return;
    }

    let photoUrls: string[];
    try {
      setIsUploading(true);
      photoUrls = await uploadCommunityPhotos(photoFiles);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Photo upload failed");
      setIsUploading(false);
      return;
    } finally {
      setIsUploading(false);
    }

    createPost(
      {
        title,
        story,
        photoUrls,
        location: location || undefined,
        species: speciesList.length > 0 ? speciesList : undefined,
      },
      {
        onSuccess: () => {
          setTitle("");
          setStory("");
          setLocation("");
          setSpeciesList([]);
          setSpeciesInput("");
          photoPreviews.forEach((p) => URL.revokeObjectURL(p));
          setPhotoFiles([]);
          setPhotoPreviews([]);
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
            Your post will be saved as a draft. Upgrade to a paid plan to share
            it with the community!
          </p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your post a catchy title..."
          required
          maxLength={200}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Story */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Your Story</label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Tell us about your fishing adventure..."
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {story.length}/5000
        </p>
      </div>

      {/* Photos */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          <Camera className="mr-1 inline h-3.5 w-3.5" />
          Photos ({photoFiles.length}/5)
        </label>
        {photoPreviews.length > 0 && (
          <div className="mb-2 grid grid-cols-3 gap-2">
            {photoPreviews.map((preview, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={`Photo ${i + 1}`}
                  className="h-24 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {photoFiles.length < 5 && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handlePhotosChange}
            className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
        )}
      </div>

      {/* Location */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          <MapPin className="mr-1 inline h-3.5 w-3.5" />
          Location (optional)
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Lake Castaic, Huntington Beach Pier"
          maxLength={100}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Species tags */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          <Fish className="mr-1 inline h-3.5 w-3.5" />
          Species Tags (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={speciesInput}
            onChange={(e) => setSpeciesInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSpecies();
              }
            }}
            placeholder="Add a species..."
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSpecies}
            disabled={!speciesInput.trim()}
          >
            Add
          </Button>
        </div>
        {speciesList.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {speciesList.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSpecies(s)}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending || isUploading}
        className="w-full"
      >
        <Send className="mr-2 h-4 w-4" />
        {isUploading
          ? "Uploading photos..."
          : isPending
            ? "Submitting..."
            : isFreeUser
              ? "Save Draft"
              : "Submit for Review"}
      </Button>
    </form>
  );
}
