import { defineRouting } from "next-intl/routing";

/**
 * Locale routing. Adding a language later = append here + add
 * messages/<locale>.json — nothing else changes.
 */
export const routing = defineRouting({
  locales: ["en", "de"],
  defaultLocale: "en",
  // Per spec: every public URL carries its locale; "/" redirects to "/en".
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
