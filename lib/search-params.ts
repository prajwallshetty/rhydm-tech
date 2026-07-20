import type { ProductFilters } from "@/lib/repositories/store";
import { SORT_OPTIONS, type SortValue } from "@/lib/store/sort";

/** Shape Next.js gives page components for `searchParams`. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toInt(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const VALID_SORTS = new Set(SORT_OPTIONS.map((option) => option.value));
const VALID_CONDITIONS = new Set([
  "GRADE_A",
  "GRADE_B",
  "GRADE_C",
  "OPEN_BOX",
]);

/**
 * Turns raw query parameters into typed filters.
 *
 * Everything here arrives from the URL, so values are validated rather than
 * trusted — an unrecognised sort key or condition is dropped instead of being
 * passed through to the query.
 */
export function parseFilters(
  params: RawSearchParams,
  overrides: Partial<ProductFilters> = {},
): ProductFilters {
  const sortRaw = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const sort: SortValue =
    sortRaw && VALID_SORTS.has(sortRaw as SortValue)
      ? (sortRaw as SortValue)
      : "newest";

  const conditions = toArray(params.condition).filter((c) =>
    VALID_CONDITIONS.has(c),
  );

  const search = Array.isArray(params.q) ? params.q[0] : params.q;

  return {
    category: toArray(params.category)[0],
    brands: toArray(params.brand),
    conditions,
    minCents: toInt(params.minPrice),
    maxCents: toInt(params.maxPrice),
    minWarranty: toInt(params.warranty),
    inStockOnly: params.inStock === "1",
    search: search ?? undefined,
    sort,
    page: toInt(params.page) ?? 1,
    ...overrides,
  };
}

/** Rebuilds a query string with a different page number, preserving filters. */
export function buildPageHref(
  pathname: string,
  params: RawSearchParams,
  page: number,
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || value == null) continue;
    toArray(value).forEach((v) => search.append(key, v));
  }

  if (page > 1) search.set("page", String(page));

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}
