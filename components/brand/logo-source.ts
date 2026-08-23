import "server-only";

import { db } from "@/lib/db";

/**
 * Resolves the admin-configured logo URL, or null to fall back to the bundled
 * brand asset.
 *
 * This lives apart from `logo-provider.tsx` on purpose. That file is a
 * `"use client"` module, and a client module cannot hold a database call: any
 * Client Component importing `useLogo` from it pulls this code — and with it
 * `lib/db` and `lib/repositories/admin` — into the browser graph, which fails
 * the production build with "the chunking context does not support external
 * modules (request: node:module)". `import "server-only"` makes that mistake
 * fail loudly at the import site instead of deep inside a Turbopack trace.
 */
export async function getGlobalLogoUrl(): Promise<string | null> {
  try {
    const section = await db.pageSection.findFirst({
      where: { key: "site.logo" },
      select: { content: true },
    });

    const content = section?.content as { logoUrl?: string } | null;
    if (content?.logoUrl && content.logoUrl.trim().length > 0) {
      return content.logoUrl;
    }
  } catch (err) {
    console.error("[getGlobalLogoUrl] Failed to load CMS logo:", err);
  }

  try {
    const { getAdminSiteSettings } = await import("@/lib/repositories/admin");
    const settings = await getAdminSiteSettings();
    if (settings.logoUrl && settings.logoUrl.trim().length > 0) {
      return settings.logoUrl;
    }
  } catch {
    // No admin settings row yet — fall through to the bundled asset.
  }

  return null;
}
