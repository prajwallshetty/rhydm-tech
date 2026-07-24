"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Tag, Trash2, Pencil, Loader2, X, Check } from "lucide-react";

import {
  createCouponAction,
  updateCouponAction,
  setCouponActiveAction,
  deleteCouponAction,
} from "@/app/(backend)/(admin)/admin/actions";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minSpendCents: number | null;
  active: boolean;
  expiresAt: string | null;
};

const empty = { code: "", type: "PERCENT" as const, value: "", minSpend: "", expiresAt: "", active: true };

export function CouponsManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(c: Coupon) {
    setEditing(c);
    setShowForm(true);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setBusy(true);
    const res = editing
      ? await updateCouponAction(editing.id, formData)
      : await createCouponAction(formData);
    setBusy(false);

    if (res?.error) {
      push(res.error);
      return;
    }
    push(editing ? "Coupon updated" : "Coupon created", "check");
    setShowForm(false);
    setEditing(null);
    router.refresh();
  }

  async function toggleActive(c: Coupon) {
    setBusy(true);
    const res = await setCouponActiveAction(c.id, !c.active);
    setBusy(false);
    if (res?.success) {
      push(c.active ? "Coupon disabled" : "Coupon enabled");
      router.refresh();
    }
  }

  async function remove(c: Coupon) {
    if (confirmId !== c.id) {
      setConfirmId(c.id);
      return;
    }
    setConfirmId(null);
    setBusy(true);
    const res = await deleteCouponAction(c.id);
    setBusy(false);
    if (res?.success) {
      push("Coupon deleted");
      router.refresh();
    }
  }

  function discountLabel(c: Coupon) {
    return c.type === "PERCENT" ? `${c.value}% off` : `${formatMoney(c.value)} off`;
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-8 py-20 text-center">
          <Tag className="mx-auto size-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-sm font-bold text-foreground">No coupons yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Create your first discount code to offer customers savings at checkout.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-border/80 bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Discount</th>
                <th className="px-4 py-3 font-semibold">Min. spend</th>
                <th className="px-4 py-3 font-semibold">Expires</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {coupons.map((c) => {
                const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                return (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-bold text-foreground">
                      {c.code}
                    </td>
                    <td className="px-4 py-3 text-foreground">{discountLabel(c)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.minSpendCents ? formatMoney(c.minSpendCents) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.expiresAt ? (
                        <span className={cn(expired && "text-destructive")}>
                          {new Date(c.expiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        "Never"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(c)}
                        disabled={busy}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors disabled:opacity-50",
                          expired
                            ? "bg-muted text-muted-foreground"
                            : c.active
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground hover:bg-muted/70",
                        )}
                      >
                        {expired ? "Expired" : c.active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          aria-label="Edit coupon"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(c)}
                          onBlur={() => setConfirmId(null)}
                          className={cn(
                            "rounded p-1.5 transition-colors",
                            confirmId === c.id
                              ? "bg-destructive text-white"
                              : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                          )}
                          aria-label={confirmId === c.id ? "Confirm delete" : "Delete coupon"}
                        >
                          {confirmId === c.id ? (
                            <Check className="size-4" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / edit dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editing ? "Edit coupon" : "New coupon"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="Code" htmlFor="code">
                <input
                  id="code"
                  name="code"
                  required
                  defaultValue={editing?.code ?? ""}
                  placeholder="SAVE10"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono uppercase outline-none focus:border-primary"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Type" htmlFor="type">
                  <select
                    id="type"
                    name="type"
                    defaultValue={editing?.type ?? "PERCENT"}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FIXED">Fixed amount</option>
                  </select>
                </Field>
                <Field label="Value" htmlFor="value">
                  <input
                    id="value"
                    name="value"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={
                      editing
                        ? editing.type === "FIXED"
                          ? (editing.value / 100).toFixed(2)
                          : String(editing.value)
                        : ""
                    }
                    placeholder="10"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Min. spend" htmlFor="minSpend" hint="Optional">
                  <input
                    id="minSpend"
                    name="minSpend"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={
                      editing?.minSpendCents ? (editing.minSpendCents / 100).toFixed(2) : ""
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Expires" htmlFor="expiresAt" hint="Optional">
                  <input
                    id="expiresAt"
                    name="expiresAt"
                    type="date"
                    defaultValue={
                      editing?.expiresAt
                        ? new Date(editing.expiresAt).toISOString().slice(0, 10)
                        : ""
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </Field>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={editing ? editing.active : true}
                  className="size-4 rounded accent-[var(--primary)]"
                />
                Active
              </label>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  {editing ? "Save changes" : "Create coupon"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-border px-5 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
        {label}
        {hint && <span className="font-normal text-muted-foreground/60">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
