"use server";

import { put } from "@vercel/blob";

export async function uploadCommunityPhotos(
  formData: FormData
): Promise<string[]> {
  const files = formData.getAll("photos") as File[];

  if (files.length === 0) {
    throw new Error("No photos provided");
  }
  if (files.length > 5) {
    throw new Error("Maximum 5 photos allowed");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  const validTypes = ["image/jpeg", "image/png", "image/webp"];

  const urls: string[] = [];

  for (const file of files) {
    if (file.size > maxSize) {
      throw new Error("Each image must be under 5MB");
    }
    if (!validTypes.includes(file.type)) {
      throw new Error("Images must be JPEG, PNG, or WebP");
    }

    const ext = file.type.split("/")[1];
    const filename = `community/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    urls.push(blob.url);
  }

  return urls;
}
