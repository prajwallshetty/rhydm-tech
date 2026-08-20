"use server";

import { getProductsBySlugs } from "@/lib/repositories/store";
import { db } from "@/lib/db";

export type CartProduct = {
  slug: string;
  variantId?: string;
  name: string;
  priceCents: number;
  compareAtCents: number | null;
  condition: string;
  warrantyMonths: number;
  stock: number;
  categorySlug: string;
  categoryName: string;
  brandName: string | null;
  imageUrl: string | null;
};

/**
 * Resolves cart/wishlist slugs to authoritative product data.
 *
 * The client stores only slugs/variantIds and quantities — prices are always read from
 * the database here, so editing localStorage cannot change what anything
 * costs. Any slug that no longer resolves (unpublished or deleted) is simply
 * omitted, and the caller drops it from the cart.
 */
export async function getCartProducts(
  inputs: string[] | Array<{ slug: string; variantId?: string }>,
): Promise<CartProduct[]> {
  if (inputs.length === 0) return [];

  const items = inputs.map((input) => {
    if (typeof input === "string") {
      return { slug: input, variantId: undefined };
    }
    return input;
  });

  const slugs = Array.from(new Set(items.map((it) => it.slug)));
  const products = await getProductsBySlugs(slugs);
  const { getProductWithVariants } = await import("@/lib/data/variants");

  const productsWithVariants = await Promise.all(
    slugs.map((slug) => getProductWithVariants(slug))
  );

  const resolvedProducts: CartProduct[] = [];

  for (const item of items) {
    const pWithV = productsWithVariants.find((p) => p && p.slug === item.slug);
    if (!pWithV) continue;

    const baseProduct = products.find((p) => p.slug === item.slug);
    if (!baseProduct) continue;

    let priceCents = baseProduct.priceCents;
    let compareAtCents = baseProduct.compareAtCents;
    let stock = baseProduct.stock;
    let condition = baseProduct.condition;
    let warrantyMonths = baseProduct.warrantyMonths;
    let imageUrl = baseProduct.images?.[0]?.url ?? null;
    let name = baseProduct.name;

    if (item.variantId) {
      const variant = pWithV.variants.find((v) => v.id === item.variantId);
      if (variant) {
        priceCents = variant.priceCents ?? priceCents;
        compareAtCents = variant.compareAtCents ?? compareAtCents;
        stock = variant.stock;
        condition = variant.condition || condition;
        warrantyMonths = variant.warrantyMonths || warrantyMonths;
        if (variant.images && variant.images.length > 0) {
          imageUrl = variant.images[0].url;
        }
        const optionsStr = Object.entries(variant.selectedOptions)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        if (optionsStr) {
          name = `${baseProduct.name} (${optionsStr})`;
        }
      }
    }

    resolvedProducts.push({
      slug: item.slug,
      variantId: item.variantId,
      name,
      priceCents,
      compareAtCents,
      condition,
      warrantyMonths,
      stock,
      categorySlug: baseProduct.category.slug,
      categoryName: baseProduct.category.name,
      brandName: baseProduct.brand?.name ?? null,
      imageUrl,
    });
  }

  return resolvedProducts;
}

export type CartScopeItem = { slug: string; categorySlug: string };

export type CouponResult =
  | {
      ok: true;
      code: string;
      discountCents: number;
      type: "PERCENT" | "FIXED";
      value: number;
    }
  | {
      ok: false;
      reason: "invalid" | "inactive" | "expired" | "minspend" | "scope" | "limit";
      minSpendCents?: number;
    };

/**
 * Server-side coupon validation. Every rule — existence, active flag, expiry,
 * minimum spend, product/category scope, and the redemption cap — is checked
 * against the database here, so a tampered client can never conjure a discount.
 * Scope is matched on slugs (the cart knows slugs, the coupon stores them).
 */
export async function validateCoupon(
  rawCode: string,
  subtotalCents: number,
  items: CartScopeItem[] = [],
): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "invalid" };

  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon) return { ok: false, reason: "invalid" };
  if (!coupon.active) return { ok: false, reason: "inactive" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    return { ok: false, reason: "limit" };
  }
  if (coupon.minSpendCents && subtotalCents < coupon.minSpendCents) {
    return { ok: false, reason: "minspend", minSpendCents: coupon.minSpendCents };
  }

  // Scope: when a coupon is limited to certain products or categories, the cart
  // must contain at least one qualifying item.
  const hasScope = coupon.productIds.length > 0 || coupon.categoryIds.length > 0;
  if (hasScope) {
    const qualifies = items.some(
      (it) =>
        coupon.productIds.includes(it.slug) ||
        coupon.categoryIds.includes(it.categorySlug),
    );
    if (!qualifies) return { ok: false, reason: "scope" };
  }

  const discountCents =
    coupon.type === "PERCENT"
      ? Math.round((subtotalCents * coupon.value) / 100)
      : Math.min(coupon.value, subtotalCents);

  return {
    ok: true,
    code: coupon.code,
    discountCents,
    type: coupon.type,
    value: coupon.value,
  };
}
