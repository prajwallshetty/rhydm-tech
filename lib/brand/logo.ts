import "server-only";
import { db } from "@/lib/db";
import { getAdminSiteSettings } from "@/lib/repositories/admin";

/**
 * Global helper to get the logo URL on the server.
 * Checks CMS section "site.logo" first, then falls back to admin settings.
 */
export async function getGlobalLogoUrl(): Promise<string | null> {
  try {
    const section = await db.pageSection.findFirst({
      where: {
        key: "site.logo",
      },
      select: {
        content: true,
      },
    });

    if (section && section.content) {
      const content = section.content as any;
      if (content.logoUrl && typeof content.logoUrl === "string" && content.logoUrl.trim().length > 0) {
        return content.logoUrl;
      }
    }
  } catch (err) {
    console.error("[getGlobalLogoUrl] Failed to load CMS logo:", err);
  }

  try {
    const settings = await getAdminSiteSettings();
    if (settings.logoUrl && settings.logoUrl.trim().length > 0) {
      return settings.logoUrl;
    }
  } catch (err) {
    // Ignore and fallback
  }

  return null;
}
