/**
 * Exchange request lifecycle.
 *
 * The stored value stays a plain string (matching the existing column) and the
 * historical codes are preserved verbatim so no row needs rewriting — only the
 * labels changed, plus two new codes for the manual-offer workflow.
 */
export const EXCHANGE_STATUSES = [
  { value: "PENDING", label: "New", tone: "slate" },
  { value: "UNDER_REVIEW", label: "Under Review", tone: "blue" },
  { value: "INFO_REQUIRED", label: "More Information Required", tone: "amber" },
  { value: "OFFER_SENT", label: "Offer Sent", tone: "violet" },
  { value: "APPROVED", label: "Customer Accepted", tone: "emerald" },
  { value: "REJECTED", label: "Customer Declined", tone: "rose" },
  { value: "PICKUP_SCHEDULED", label: "Pickup Scheduled", tone: "blue" },
  { value: "RECEIVED", label: "Device Received", tone: "blue" },
  { value: "INSPECTION", label: "Inspection", tone: "amber" },
  { value: "COMPLETED", label: "Completed", tone: "emerald" },
  { value: "CANCELLED", label: "Cancelled", tone: "slate" },
] as const;

export type ExchangeStatus = (typeof EXCHANGE_STATUSES)[number]["value"];
export type ExchangeStatusTone = (typeof EXCHANGE_STATUSES)[number]["tone"];

const BY_VALUE = new Map(EXCHANGE_STATUSES.map((s) => [s.value, s]));

export function exchangeStatusLabel(status: string): string {
  return BY_VALUE.get(status as ExchangeStatus)?.label ?? status.replaceAll("_", " ");
}

export function exchangeStatusTone(status: string): ExchangeStatusTone {
  return BY_VALUE.get(status as ExchangeStatus)?.tone ?? "slate";
}

/** Tailwind classes per tone, so every surface badges a status identically. */
export const EXCHANGE_TONE_CLASSES: Record<ExchangeStatusTone, string> = {
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
};

/**
 * Statuses at which the admin's offer becomes visible to the customer.
 * Before this point the request is under internal review and the customer is
 * shown progress only — never a number.
 */
const OFFER_VISIBLE = new Set<string>([
  "OFFER_SENT",
  "APPROVED",
  "REJECTED",
  "PICKUP_SCHEDULED",
  "RECEIVED",
  "INSPECTION",
  "COMPLETED",
]);

export function isOfferVisibleToCustomer(status: string, finalValueCents: number | null) {
  return finalValueCents != null && OFFER_VISIBLE.has(status);
}
