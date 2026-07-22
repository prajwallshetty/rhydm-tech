import "server-only";

import { db } from "@/lib/db";
import {
  getSectionDef,
  type SectionContent,
} from "@/lib/cms/registry";

/**
 * Reads a section's content: registry defaults overlaid with whatever the
 * admin has saved. A missing row, a missing field, or an empty string all
 * fall back to the default — so adding a new field to the registry never
 * breaks previously-saved sections, and clearing a field in the admin
 * restores the original copy rather than rendering blank UI.
 */
export async function getSectionContent<T extends SectionContent>(
  key: string,
): Promise<T> {
  const def = getSectionDef(key);
  if (!def) {
    throw new Error(`Unknown CMS section "${key}" — add it to lib/cms/registry.ts`);
  }

  const row = await db.pageSection.findUnique({
    where: { key },
    select: { content: true },
  });

  const saved = (row?.content ?? {}) as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...def.defaults };

  for (const [field, defaultValue] of Object.entries(def.defaults)) {
    const savedValue = saved[field];

    if (Array.isArray(defaultValue)) {
      // Lists replace wholesale — but only when the saved value is a
      // non-empty array of objects; anything else keeps the default.
      if (
        Array.isArray(savedValue) &&
        savedValue.length > 0 &&
        savedValue.every((item) => item && typeof item === "object")
      ) {
        merged[field] = savedValue;
      }
    } else if (typeof savedValue === "string" && savedValue.trim().length > 0) {
      merged[field] = savedValue;
    }
  }

  return merged as T;
}
