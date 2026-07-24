"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Loader2, Check, Boxes, History, X, ArrowUp, ArrowDown } from "lucide-react";

import {
  updateStockAction,
  getStockHistoryAction,
} from "@/app/(backend)/(admin)/admin/actions";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type Movement = {
  id: string;
  delta: number;
  balance: number;
  reason: string;
  note: string | null;
  createdAt: string;
};

const LOW_STOCK = 10;

type Item = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  stock: number;
  priceCents: number;
  categoryName: string;
};

export function InventoryTable({
  items,
  page,
  pageCount,
  total,
}: {
  items: Item[];
  page: number;
  pageCount: number;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const push = useToast((s) => s.push);
  const [pending, startTransition] = useTransition();

  const [term, setTerm] = useState(searchParams.get("q") ?? "");
  const level = searchParams.get("level") ?? "all";

  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [historyFor, setHistoryFor] = useState<Item | null>(null);
  const [movements, setMovements] = useState<Movement[] | null>(null);

  async function openHistory(item: Item) {
    setHistoryFor(item);
    setMovements(null);
    const res = await getStockHistoryAction(item.id);
    setMovements(res.movements);
  }

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setParam("q", term.trim());
  }

  function startEdit(item: Item) {
    setEditId(item.id);
    setEditValue(String(item.stock));
  }

  async function saveStock(item: Item) {
    const next = Number(editValue);
    if (!Number.isFinite(next) || next < 0) {
      push("Enter a valid non-negative number");
      return;
    }
    setBusyId(item.id);
    const res = await updateStockAction(item.id, next);
    setBusyId(null);
    if (res?.error) {
      push(res.error);
      return;
    }
    setEditId(null);
    push(`Stock updated for ${item.name}`, "check");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={submitSearch} className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search name or SKU…"
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </form>

        <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
          {(["all", "low", "out"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setParam("level", l)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                level === l
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {l === "all" ? "All" : l === "low" ? "Low stock" : "Out of stock"}
            </button>
          ))}
        </div>

        {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-8 py-20 text-center">
          <Boxes className="mx-auto size-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-sm font-bold text-foreground">No products found</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Adjust your search or stock-level filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-border/80 bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((item) => {
                const out = item.stock <= 0;
                const low = !out && item.stock <= LOW_STOCK;
                return (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.categoryName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatMoney(item.priceCents)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
                          out
                            ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            : low
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
                        )}
                      >
                        {item.stock} {out ? "· out" : low ? "· low" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {editId === item.id ? (
                          <>
                            <input
                              type="number"
                              min="0"
                              value={editValue}
                              autoFocus
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && saveStock(item)}
                              className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                            />
                            <button
                              type="button"
                              onClick={() => saveStock(item)}
                              disabled={busyId === item.id}
                              className="rounded-lg bg-primary p-1.5 text-primary-foreground disabled:opacity-50"
                              aria-label="Save stock"
                            >
                              {busyId === item.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Check className="size-4" />
                              )}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => openHistory(item)}
                              className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
                              aria-label="Stock history"
                              title="Stock history"
                            >
                              <History className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                            >
                              Edit stock
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

      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-4 text-sm">
          <span className="text-muted-foreground">
            Page {page} of {pageCount} · {total} SKUs
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setParam("page", String(page - 1))}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => setParam("page", String(page + 1))}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Stock history drawer */}
      {historyFor && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setHistoryFor(null)}
          />
          <div className="relative z-10 h-full w-full max-w-md overflow-y-auto border-l border-border bg-card p-6 shadow-2xl">
            <div className="mb-1 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground">Stock history</h2>
                <p className="text-xs text-muted-foreground">{historyFor.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryFor(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5">
              {movements === null ? (
                <div className="grid place-items-center py-16">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : movements.length === 0 ? (
                <p className="py-16 text-center text-xs text-muted-foreground">
                  No adjustments recorded yet. Stock changes will appear here.
                </p>
              ) : (
                <ol className="space-y-2.5">
                  {movements.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-background p-3"
                    >
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-lg",
                          m.delta >= 0
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
                        )}
                      >
                        {m.delta >= 0 ? (
                          <ArrowUp className="size-4" />
                        ) : (
                          <ArrowDown className="size-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-foreground">
                            {m.delta >= 0 ? `+${m.delta}` : m.delta}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            → {m.balance} on hand
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{m.note || m.reason}</span>
                          <span>{new Date(m.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
