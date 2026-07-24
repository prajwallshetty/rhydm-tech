import "server-only";

import { db } from "@/lib/db";
import {
  getSectionDef,
  type SectionContent,
} from "@/lib/cms/registry";

/**
 * Reads a section's content for a locale.
 *
 * Storage: the base key holds English; other locales live in sibling rows
 * keyed `${key}#${locale}` (e.g. `section.disposal.hero#de`). Merge order is
 * defaults → English row → locale row, field by field — so an untranslated
 * German field falls back to the (possibly admin-edited) English text, never
 * to a blank, and a fresh database renders the built-in copy.
 */
export async function getSectionContent<T extends SectionContent>(
  key: string,
  locale: string = "en",
): Promise<T> {
  const def = getSectionDef(key);
  if (!def) {
    throw new Error(`Unknown CMS section "${key}" — add it to lib/cms/registry.ts`);
  }

  const keys = locale === "en" ? [key] : [key, `${key}#${locale}`];
  const rows = await db.pageSection.findMany({
    where: { key: { in: keys } },
    select: { key: true, content: true },
  });

  const layers = keys.map(
    (k) =>
      (rows.find((row) => row.key === k)?.content ?? {}) as Record<
        string,
        unknown
      >,
  );

  const merged: Record<string, unknown> = {
    ...def.defaults,
    ...(def.localizedDefaults?.[locale] ?? {}),
  };

  for (const layer of layers) {
    for (const [field, defaultValue] of Object.entries(def.defaults)) {
      const value = layer[field];

      if (Array.isArray(defaultValue)) {
        // Lists replace wholesale — but only when the saved value is a
        // non-empty array of objects; anything else keeps the layer below.
        if (
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((item) => item && typeof item === "object")
        ) {
          merged[field] = value;
        }
      } else if (typeof value === "string" && value.trim().length > 0) {
        merged[field] = value;
      }
    }
  }

  return merged as T;
}
