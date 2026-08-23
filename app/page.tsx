import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";

/**
 * The unlocalized root.
 *
 * `proxy.ts` normally rewrites "/" to "/{locale}" before this ever runs, but
 * the route still existed and still prerendered — a second, full copy of the
 * gateway at https://rhydm-tech.com/ with its own (stale) title and an
 * English-only H1. That is a duplicate homepage competing with /en for the
 * brand query, which is exactly what a canonical strategy is meant to prevent.
 *
 * Redirecting instead of rendering leaves exactly one homepage per locale, and
 * keeps "/" working if the proxy is ever bypassed.
 */
export default function RootPage(): never {
  redirect(`/${routing.defaultLocale}`);
}
