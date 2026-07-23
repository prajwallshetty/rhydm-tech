/**
 * Canonical Cloudinary folder set — uploads are always categorized into one
 * of these, never loose in the root. Client-safe (no secrets).
 */
export const MEDIA_FOLDERS = [
  "products",
  "products/gallery",
  "products/variants",
  "categories",
  "brands",
  "blog",
  "hero",
  "services",
  "testimonials",
  "team",
  "logos",
  "icons",
  "banners",
  "documents",
] as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export function isMediaFolder(value: string): value is MediaFolder {
  return (MEDIA_FOLDERS as readonly string[]).includes(value);
}

/** Everything lives under one root so the Cloudinary account stays tidy. */
export const MEDIA_ROOT = "rhydm";
