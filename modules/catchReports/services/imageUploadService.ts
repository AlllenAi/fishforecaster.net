"use server";

import { put } from "@vercel/blob";

export async function uploadCatchPhoto(
  formData: FormData
): Promise<string> {
  const file = formData.get("photo") as File;
  if (!file) throw new Error("No photo provided");
  // Validate file
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("Image must be under 5MB");
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Image must be JPEG, PNG, or WebP");
  }

  // Generate unique filename
  const ext = file.type.split("/")[1];
  const filename = `catches/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Upload to Vercel Blob
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return blob.url;
}
