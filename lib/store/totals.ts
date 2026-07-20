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
};

export function shippingCents({ subtotalCents, delivery = "standard" }: TotalsInput) {
  if (delivery === "express") return EXPRESS_SHIPPING_CENTS;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : STANDARD_SHIPPING_CENTS;
}

export function calculateTotals(input: TotalsInput) {
  const shipping = shippingCents(input);
  // Rounded once, at the end, to avoid compounding rounding error.
  const tax = Math.round((input.subtotalCents * TAX_RATE_BASIS_POINTS) / 10_000);

  return {
    subtotalCents: input.subtotalCents,
    shippingCents: shipping,
    taxCents: tax,
    totalCents: input.subtotalCents + shipping + tax,
  };
}

/** Amount still needed to qualify for free shipping, or 0 if already there. */
export function amountToFreeShipping(subtotalCents: number) {
  return Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
}
