"use server";

import { searchProducts } from "@/lib/repositories/store";

export type SearchHit = {
  slug: string;
  name: string;
  priceCents: number;
  condition: string;
  categoryName: string;
  brandName: string | null;
};

/**
 * Backs the header's instant search. Returns a flattened shape so the client
 * component doesn't depend on Prisma's nested types.
 */
export async function searchAction(term: string): Promise<SearchHit[]> {
  // Avoid a database round trip for single characters.
  if (term.trim().length < 2) return [];

  const results = await searchProducts(term, 6);

  return results.map((product) => ({
    slug: product.slug,
    name: product.name,
    priceCents: product.priceCents,
    condition: product.condition,
    categoryName: product.category.name,
    brandName: product.brand?.name ?? null,
  }));
}
