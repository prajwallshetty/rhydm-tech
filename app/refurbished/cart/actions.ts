"use server";

import { getProductsBySlugs } from "@/lib/repositories/store";

export type CartProduct = {
  slug: string;
  name: string;
  priceCents: number;
  compareAtCents: number | null;
  condition: string;
  warrantyMonths: number;
  stock: number;
  categorySlug: string;
  categoryName: string;
  brandName: string | null;
};

/**
 * Resolves cart/wishlist slugs to authoritative product data.
 *
 * The client stores only slugs and quantities — prices are always read from
 * the database here, so editing localStorage cannot change what anything
 * costs. Any slug that no longer resolves (unpublished or deleted) is simply
 * omitted, and the caller drops it from the cart.
 */
export async function getCartProducts(
  slugs: string[],
): Promise<CartProduct[]> {
  if (slugs.length === 0) return [];

  const products = await getProductsBySlugs(slugs);

  return products.map((product) => ({
    slug: product.slug,
    name: product.name,
    priceCents: product.priceCents,
    compareAtCents: product.compareAtCents,
    condition: product.condition,
    warrantyMonths: product.warrantyMonths,
    stock: product.stock,
    categorySlug: product.category.slug,
    categoryName: product.category.name,
    brandName: product.brand?.name ?? null,
  }));
}
