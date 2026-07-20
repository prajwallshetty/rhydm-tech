/**
 * Money is stored in minor units (cents) throughout — see Product.priceCents.
 * These helpers are the only place that conversion should happen.
 */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const preciseCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** Whole-dollar display, e.g. "$749". Used on cards and listings. */
export function formatPrice(cents: number) {
  return currencyFormatter.format(cents / 100);
}

/** Two-decimal display, e.g. "$749.00". Used in cart and order totals. */
export function formatPriceExact(cents: number) {
  return preciseCurrencyFormatter.format(cents / 100);
}

/** Whole-percent saving, or null when there is no comparison price. */
export function discountPercent(
  priceCents: number,
  compareAtCents: number | null | undefined,
) {
  if (!compareAtCents || compareAtCents <= priceCents) return null;
  return Math.round(((compareAtCents - priceCents) / compareAtCents) * 100);
}

const CONDITION_LABELS = {
  GRADE_A: "Grade A — Excellent",
  GRADE_B: "Grade B — Good",
  GRADE_C: "Grade C — Fair",
  OPEN_BOX: "Open Box",
} as const;

const CONDITION_SHORT = {
  GRADE_A: "Grade A",
  GRADE_B: "Grade B",
  GRADE_C: "Grade C",
  OPEN_BOX: "Open Box",
} as const;

export type ConditionKey = keyof typeof CONDITION_LABELS;

export function conditionLabel(condition: string) {
  return CONDITION_LABELS[condition as ConditionKey] ?? condition;
}

export function conditionShort(condition: string) {
  return CONDITION_SHORT[condition as ConditionKey] ?? condition;
}

export function stockLabel(stock: number) {
  if (stock <= 0) return { label: "Out of stock", tone: "out" as const };
  if (stock <= 5) return { label: `Only ${stock} left`, tone: "low" as const };
  return { label: "In stock", tone: "in" as const };
}
