"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Loader2, Pencil, Percent, Plus, X } from "lucide-react";

import { endDealAction, setDealAction } from "@/app/(backend)/(admin)/admin/actions";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type Deal = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  priceCents: number;
  compareAtCents: number | null;
  stock: number;
  status: string;
  category: { name: string; slug: string };
  brand: { name: string } | null;
};

type Candidate = {
  id: string;
  name: string;
  sku: string;
  priceCents: number;
  category: { name: string };
};

function discountPct(priceCents: number, compareAtCents: number | null) {
  if (!compareAtCents || compareAtCents <= priceCents) return 0;
  return Math.round(((compareAtCents - priceCents) / compareAtCents) * 100);
}

/** "1234.56" → 123456 cents; null when not a valid positive amount. */
function toCents(value: string): number | null {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100);
}

export function DealsTable({
  deals,
  candidates,
}: {
  deals: Deal[];
  candidates: Candidate[];
}) {
  const push = useToast((s) => s.push);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editCompare, setEditCompare] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [addProductId, setAddProductId] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addCompare, setAddCompare] = useState("");
  const [addBusy, setAddBusy] = useState(false);

  function startEdit(deal: Deal) {
    setEditingId(deal.id);
    setEditPrice((deal.priceCents / 100).toFixed(2));
    setEditCompare(((deal.compareAtCents ?? 0) / 100).toFixed(2));
  }

  async function saveEdit(dealId: string) {
    const price = toCents(editPrice);
    const compare = toCents(editCompare);
    if (price == null || compare == null) {
      push("Enter valid positive amounts");
      return;
    }

    setBusyId(dealId);
    const res = await setDealAction(dealId, price, compare);
    setBusyId(null);

    if (res?.error) {
      push(res.error);
      return;
    }
    setEditingId(null);
    push("Deal updated");
  }

  async function endDeal(dealId: string, name: string) {
    setBusyId(dealId);
    const res = await endDealAction(dealId);
    setBusyId(null);
    if (res?.success) push(`Ended deal on ${name}`);
  }

  async function addDeal(e: React.FormEvent) {
    e.preventDefault();
    const price = toCents(addPrice);
    const compare = toCents(addCompare);
    if (!addProductId || price == null || compare == null) {
      push("Pick a product and enter valid amounts");
      return;
    }

    setAddBusy(true);
    const res = await setDealAction(addProductId, price, compare);
    setAddBusy(false);

    if (res?.error) {
      push(res.error);
      return;
    }
    push("Product added to deals");
    setShowAdd(false);
    setAddProductId("");
    setAddPrice("");
    setAddCompare("");
  }

  const selectedCandidate = candidates.find((c) => c.id === addProductId);

  return (
    <div className="space-y-5">
      {/* Summary + add */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{deals.length}</span>{" "}
          active {deals.length === 1 ? "deal" : "deals"}
          {deals.length > 0 && (
            <>
              {" "}
              · up to{" "}
              <span className="font-bold text-[#2E6F40]">
                {Math.max(
                  ...deals.map((d) => discountPct(d.priceCents, d.compareAtCents)),
                )}
                % off
              </span>
            </>
          )}
        </p>

        {!showAdd && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-full bg-[#2E6F40] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#2E6F40]/20 transition-colors hover:bg-[#255833]"
          >
            <Plus className="size-4" />
            Add product to deals
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <form
          onSubmit={addDeal}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-border dark:bg-card"
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_140px_140px_auto] sm:items-end">
            <div className="space-y-1.5">
              <label
                htmlFor="deal-product"
                className="text-xs font-bold text-muted-foreground"
              >
                Product
              </label>
              <select
                id="deal-product"
                value={addProductId}
                onChange={(e) => {
                  setAddProductId(e.target.value);
                  const candidate = candidates.find(
                    (c) => c.id === e.target.value,
                  );
                  // Pre-fill: current price becomes the compare-at baseline.
                  if (candidate) {
                    setAddCompare((candidate.priceCents / 100).toFixed(2));
                    setAddPrice("");
                  }
                }}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-[#2E6F40]"
              >
                <option value="">Select a product…</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name} — {formatMoney(candidate.priceCents)} (
                    {candidate.category.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="deal-price"
                className="text-xs font-bold text-muted-foreground"
              >
                Sale price ($)
              </label>
              <input
                id="deal-price"
                inputMode="decimal"
                value={addPrice}
                onChange={(e) => setAddPrice(e.target.value)}
                placeholder="649.00"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-[#2E6F40]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="deal-compare"
                className="text-xs font-bold text-muted-foreground"
              >
                Compare at ($)
              </label>
              <input
                id="deal-compare"
                inputMode="decimal"
                value={addCompare}
                onChange={(e) => setAddCompare(e.target.value)}
                placeholder="1299.00"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-[#2E6F40]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addBusy}
                className="flex h-10 items-center gap-1.5 rounded-xl bg-[#2E6F40] px-4 text-xs font-bold text-white transition-colors hover:bg-[#255833] disabled:opacity-50"
              >
                {addBusy ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex h-10 items-center rounded-xl border border-border px-4 text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>

          {selectedCandidate && toCents(addPrice) != null && (
            <p className="mt-3 text-xs text-muted-foreground">
              Preview:{" "}
              <span className="font-bold text-[#2E6F40]">
                {discountPct(toCents(addPrice)!, toCents(addCompare))}% off
              </span>{" "}
              — customers pay {formatMoney(toCents(addPrice)!)} instead of{" "}
              {formatMoney(toCents(addCompare) ?? 0)}
            </p>
          )}
        </form>
      )}

      {/* Deals table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-border dark:bg-card">
        {deals.length === 0 ? (
          <div className="grid place-items-center px-6 py-16 text-center">
            <Percent className="size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-bold">No active deals</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add a product above to put it on the storefront deals page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 dark:border-border/60">
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Sale price</th>
                  <th className="px-5 py-3.5">Compare at</th>
                  <th className="px-5 py-3.5">Discount</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border/40">
                {deals.map((deal) => {
                  const editing = editingId === deal.id;
                  const busy = busyId === deal.id;
                  const pct = discountPct(deal.priceCents, deal.compareAtCents);

                  return (
                    <tr
                      key={deal.id}
                      className="transition-colors hover:bg-slate-50/80 dark:hover:bg-muted/40"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/refurbished/products/${deal.slug}`}
                          target="_blank"
                          className="font-bold text-foreground hover:underline"
                        >
                          {deal.name}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {deal.brand?.name ?? deal.category.name} · SKU{" "}
                          {deal.sku}
                          {deal.status !== "PUBLISHED" && (
                            <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-600">
                              {deal.status} — not visible in store
                            </span>
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-3.5">
                        {editing ? (
                          <input
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            inputMode="decimal"
                            aria-label="Sale price in dollars"
                            className="h-8 w-24 rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-[#2E6F40]"
                          />
                        ) : (
                          <span className="font-black">
                            {formatMoney(deal.priceCents)}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        {editing ? (
                          <input
                            value={editCompare}
                            onChange={(e) => setEditCompare(e.target.value)}
                            inputMode="decimal"
                            aria-label="Compare-at price in dollars"
                            className="h-8 w-24 rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-[#2E6F40]"
                          />
                        ) : (
                          <span className="text-muted-foreground line-through">
                            {formatMoney(deal.compareAtCents ?? 0)}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-[#2E6F40]/10 px-2.5 py-1 text-[11px] font-black text-[#2E6F40]">
                          −{pct}%
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "font-bold",
                            deal.stock === 0 && "text-red-500",
                            deal.stock > 0 && deal.stock <= 5 && "text-amber-600",
                          )}
                        >
                          {deal.stock}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {editing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveEdit(deal.id)}
                                disabled={busy}
                                aria-label="Save deal pricing"
                                className="grid size-8 place-items-center rounded-lg bg-[#2E6F40] text-white transition-colors hover:bg-[#255833] disabled:opacity-50"
                              >
                                {busy ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <Check className="size-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                aria-label="Cancel editing"
                                className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
                              >
                                <X className="size-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(deal)}
                                aria-label={`Edit pricing for ${deal.name}`}
                                className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-[#2E6F40]/40 hover:text-[#2E6F40]"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => endDeal(deal.id, deal.name)}
                                disabled={busy}
                                className="h-8 rounded-lg border border-border px-3 text-[11px] font-bold text-muted-foreground transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              >
                                {busy ? "…" : "End deal"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
