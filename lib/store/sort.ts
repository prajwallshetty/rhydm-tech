/**
 * Sort options, shared by the server-side query layer and the client-side
 * <SortSelect>.
 *
 * These deliberately live outside `lib/repositories/store.ts`: that module is
 * `server-only` and pulls in Prisma and `pg`, so importing it from a Client
 * Component drags the database driver into the browser bundle and fails the
 * build.
 */

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "best-selling", label: "Best Selling" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
