"use client";

import { createContext, useContext } from "react";

const LogoContext = createContext<string | null>(null);

export function LogoProvider({ logoUrl, children }: { logoUrl: string | null; children: React.ReactNode }) {
  return (
    <LogoContext.Provider value={logoUrl}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  return useContext(LogoContext);
}

/**
 * Global helper to get the logo URL on the server.
 * Checks CMS section "site.logo" first, then falls back to admin settings.
 */
export async function getGlobalLogoUrl(): Promise<string | null> {
  try {
    const { db } = await import("@/lib/db");
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
      if (content.logoUrl && content.logoUrl.trim().length > 0) {
        return content.logoUrl;
      }
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
  } catch (err) {
    // Ignore and fallback
  }

  return null;
}
