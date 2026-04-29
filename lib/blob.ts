/**
 * Convert a private blob URL to a proxy URL that can be displayed in the browser.
 * Returns the original string if it's not a blob URL.
 */
export function signBlobUrl(url: string): string {
  if (!url.includes("vercel-storage.com")) return url;
  return `/api/images?url=${encodeURIComponent(url)}`;
}

/**
 * Convert an array of blob URLs to proxy URLs.
 */
export function signBlobUrls(urls: string[]): string[] {
  return urls.map(signBlobUrl);
}
