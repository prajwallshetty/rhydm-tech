import "server-only";

import crypto from "node:crypto";

/**
 * Cloudinary integration, no SDK: signed uploads need only a SHA-1 signature
 * over the sorted parameters, and the destroy endpoint is one POST. Keeping
 * it dependency-free avoids shipping the (large, Node-only) cloudinary
 * package into the bundle graph.
 *
 * Upload flow (the Shopify pattern):
 *   1. Admin browser asks our server action to sign the upload params.
 *   2. Browser POSTs the file bytes directly to Cloudinary with that
 *      signature — file never transits our server, secret never leaves it.
 *   3. Browser reports Cloudinary's response to a second action, which
 *      validates and persists the MediaAsset row.
 */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET);
}

export function cloudinaryCloudName(): string | null {
  return CLOUD_NAME ?? null;
}

/**
 * Cloudinary request signature: SHA-1 of the alphabetically sorted
 * `key=value` pairs joined with `&`, with the API secret appended.
 * (Verified against the worked example in Cloudinary's signature docs.)
 */
export function signParams(
  params: Record<string, string | number>,
  secret: string = API_SECRET ?? "",
): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + secret).digest("hex");
}

export type SignedUpload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

/** Produces everything the browser needs to upload one file to a folder. */
export function signUpload(folder: string): SignedUpload {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error("Cloudinary is not configured");
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signParams({ folder, timestamp });
  return { cloudName: CLOUD_NAME, apiKey: API_KEY, timestamp, folder, signature };
}

/**
 * Deletes an asset at Cloudinary. `resourceType` must match how it was
 * uploaded (image / video / raw for documents).
 */
export async function destroyAsset(
  publicId: string,
  resourceType: "image" | "video" | "raw",
): Promise<{ ok: boolean; result?: string }> {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error("Cloudinary is not configured");
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signParams({ public_id: publicId, timestamp });

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: API_KEY,
    signature,
  });

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/destroy`,
    { method: "POST", body },
  );
  const json = (await res.json().catch(() => ({}))) as { result?: string };
  // "not found" is fine — the DB row is the thing being cleaned up.
  return { ok: json.result === "ok" || json.result === "not found", result: json.result };
}
