/**
 * Crawl rules, split by the mechanism that enforces them.
 *
 * These two lists must stay disjoint, because `Disallow` and `noindex` cancel
 * each other out: a crawler that is forbidden to fetch a page never reads the
 * `noindex` on it, so a blocked-but-linked URL can still be indexed — as a bare
 * URL with no title or description, which is worse than not blocking it.
 *
 * Rule of thumb applied here:
 *   - DISALLOWED_PATHS  — never linked from public HTML, and worthless to
 *                         crawl. Blocking saves crawl budget and nothing else.
 *   - NOINDEX_PATHS     — reachable from public HTML (footer, nav, checkout
 *                         flow), so they must stay crawlable in order for the
 *                         `noindex` they serve to be seen and obeyed.
 *
 * Paths are locale-independent (no `/en` or `/de` prefix); `app/robots.ts`
 * expands each one across the configured locales.
 */
export const DISALLOWED_PATHS = [
  "/admin",
  "/api",
  "/private",
  // Faceted search: infinite parameter combinations, no unique content.
  "/refurbished/search",
] as const;

export const NOINDEX_PATHS = [
  "/refurbished/cart",
  "/refurbished/checkout",
  "/refurbished/account",
  "/refurbished/wishlist",
  "/refurbished/order-success",
  "/account",
  "/login",
  "/signup",
  "/auth",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/unsubscribe",
] as const;

/** Every path that must never appear in the sitemap, for either reason. */
export const NON_INDEXABLE_PATHS: readonly string[] = [
  ...DISALLOWED_PATHS,
  ...NOINDEX_PATHS,
];
