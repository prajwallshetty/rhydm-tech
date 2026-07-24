/**
 * Sort options, shared by the server-side query layer and the client-side
 * <SortSelect>.
 *
 * These deliberately live outside `lib/repositories/store.ts`: that module is
 * `server-only` and pulls in Prisma and `pg`, so importing it from a Client
 * Component drags the database driver into the browser bundle and fails the
 * build.
 */

// `key` maps to messages `store.sort.<key>`; `label` is a build-time fallback.
export const SORT_OPTIONS = [
  { value: "newest", key: "newest", label: "Newest" },
  { value: "popular", key: "popular", label: "Popular" },
  { value: "price-asc", key: "priceAsc", label: "Price: Low to High" },
  { value: "price-desc", key: "priceDesc", label: "Price: High to Low" },
  { value: "rating", key: "rating", label: "Highest Rated" },
  { value: "best-selling", key: "bestSelling", label: "Best Selling" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
