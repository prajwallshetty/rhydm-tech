/**
 * Order total calculation, shared by the cart and checkout so the two can
 * never disagree.
 *
 * All amounts are in minor units (cents) and integer arithmetic throughout —
 * no floating point is involved in any total.
 */

export const FREE_SHIPPING_THRESHOLD_CENTS = 50_000;
export const STANDARD_SHIPPING_CENTS = 1_900;
export const EXPRESS_SHIPPING_CENTS = 3_900;
export const TAX_RATE_BASIS_POINTS = 825; // 8.25%

export type DeliveryMethod = "standard" | "express";

export type TotalsInput = {
  subtotalCents: number;
  delivery?: DeliveryMethod;
  /** A validated coupon discount, in cents. Clamped to the subtotal. */
  discountCents?: number;
};

export function shippingCents({ subtotalCents, delivery = "standard" }: TotalsInput) {
  if (delivery === "express") return EXPRESS_SHIPPING_CENTS;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : STANDARD_SHIPPING_CENTS;
}

export function calculateTotals(input: TotalsInput) {
  const shipping = shippingCents(input);
  // Discount never exceeds the goods subtotal (shipping/tax are not discounted).
  const discount = Math.min(Math.max(0, input.discountCents ?? 0), input.subtotalCents);
  const discountedSubtotal = input.subtotalCents - discount;
  // Rounded once, at the end, to avoid compounding rounding error.
  const tax = Math.round((discountedSubtotal * TAX_RATE_BASIS_POINTS) / 10_000);

  return {
    subtotalCents: input.subtotalCents,
    discountCents: discount,
    shippingCents: shipping,
    taxCents: tax,
    totalCents: discountedSubtotal + shipping + tax,
  };
}

/** Amount still needed to qualify for free shipping, or 0 if already there. */
export function amountToFreeShipping(subtotalCents: number) {
  return Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
}
