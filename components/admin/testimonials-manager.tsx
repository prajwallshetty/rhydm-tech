"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Loader2,
  X,
  MessageSquareQuote,
  Check,
} from "lucide-react";

import {
  saveTestimonialCmsAction,
  toggleTestimonialStatusAction,
  deleteTestimonialCmsAction,
  reorderTestimonialsAction,
} from "@/app/(backend)/(admin)/admin/actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Division = "DISPOSAL" | "REFURBISHED";
type Status = "PUBLISHED" | "DRAFT";

type Testimonial = {
  id: string;
  division: Division;
  author: string;
  role: string | null;
  company: string | null;
  quote: string;
  rating: number | null;
  avatarUrl: string | null;
  status: Status;
  position: number;
};

export function TestimonialsManager({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [division, setDivision] = useState<Division>("REFURBISHED");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  // Local ordering copy so drag/reorder feels instant before the server round-trip.
  const [localOrder, setLocalOrder] = useState<Record<Division, string[] | null>>({
    DISPOSAL: null,
    REFURBISHED: null,
  });

  const rowsByDivision = useMemo(() => {
    const map: Record<Division, Testimonial[]> = { DISPOSAL: [], REFURBISHED: [] };
    for (const t of testimonials) map[t.division].push(t);
    for (const d of ["DISPOSAL", "REFURBISHED"] as Division[]) {
      const order = localOrder[d];
      if (order) {
        map[d].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      } else {
        map[d].sort((a, b) => a.position - b.position);
      }
    }
    return map;
  }, [testimonials, localOrder]);

  const rows = rowsByDivision[division];

  async function persistOrder(ids: string[]) {
    setLocalOrder((prev) => ({ ...prev, [division]: ids }));
    const res = await reorderTestimonialsAction(ids, division);
    if (res?.success) {
      push("Order saved");
      router.refresh();
    }
  }

  function move(id: string, dir: -1 | 1) {
    const ids = rows.map((r) => r.id);
    const idx = ids.indexOf(id);
    const next = idx + dir;
    if (next < 0 || next >= ids.length) return;
    [ids[idx], ids[next]] = [ids[next], ids[idx]];
    persistOrder(ids);
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const ids = rows.map((r) => r.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    setDragId(null);
    persistOrder(ids);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const res = await saveTestimonialCmsAction(new FormData(e.currentTarget));
    setBusy(false);
    if (res?.error) {
      push(res.error);
      return;
    }
    push(editing ? "Testimonial updated" : "Testimonial added", "check");
    setShowForm(false);
    setEditing(null);
    router.refresh();
  }

  async function toggleStatus(t: Testimonial) {
    setBusy(true);
    const res = await toggleTestimonialStatusAction(t.id, t.status !== "PUBLISHED", t.division);
    setBusy(false);
    if (res?.success) {
      push(t.status === "PUBLISHED" ? "Hidden from storefront" : "Published");
      router.refresh();
    }
  }

  async function remove(t: Testimonial) {
    if (confirmId !== t.id) {
      setConfirmId(t.id);
      return;
    }
    setConfirmId(null);
    setBusy(true);
    const res = await deleteTestimonialCmsAction(t.id, t.division);
    setBusy(false);
    if (res?.success) {
      push("Testimonial deleted");
      router.refresh();
    }
  }

  return (
    <div className="space-y-5">
      {/* Division tabs + add */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
          {(["REFURBISHED", "DISPOSAL"] as Division[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDivision(d)}
              className={cn(
                "rounded-md px-4 py-1.5 text-xs font-semibold capitalize transition-colors",
                division === d
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {d === "REFURBISHED" ? "Refurbished" : "Disposal"} ({rowsByDivision[d].length})
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span>New Testimonial</span>
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-8 py-20 text-center">
          <MessageSquareQuote className="mx-auto size-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-sm font-bold text-foreground">No testimonials yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Add a customer quote for the{" "}
            {division === "REFURBISHED" ? "refurbished store" : "disposal site"}.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((t, i) => (
            <li
              key={t.id}
              draggable
              onDragStart={() => setDragId(t.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(t.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all",
                dragId === t.id && "opacity-50 ring-2 ring-primary/40",
              )}
            >
              {/* Drag handle + arrows */}
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <GripVertical className="size-4 cursor-grab text-muted-foreground/60" />
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => move(t.id, -1)}
                    disabled={i === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(t.id, 1)}
                    disabled={i === rows.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Avatar */}
              {t.avatarUrl ? (
                <img
                  src={t.avatarUrl}
                  alt={t.author}
                  className="size-10 shrink-0 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {t.author.slice(0, 2).toUpperCase()}
                </div>
              )}

              {/* Body */}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm italic text-muted-foreground">
                  “{t.quote}”
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="font-bold text-foreground">{t.author}</span>
                  {(t.role || t.company) && (
                    <span className="text-muted-foreground">
                      {[t.role, t.company].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {t.rating != null && (
                    <span className="inline-flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: t.rating }).map((_, s) => (
                        <Star key={s} className="size-3 fill-amber-400 text-amber-400" />
                      ))}
                    </span>
                  )}
                  {t.status === "DRAFT" && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                      Hidden
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleStatus(t)}
                  disabled={busy}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-50"
                  aria-label={t.status === "PUBLISHED" ? "Hide" : "Publish"}
                  title={t.status === "PUBLISHED" ? "Hide from storefront" : "Publish"}
                >
                  {t.status === "PUBLISHED" ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(t);
                    setShowForm(true);
                  }}
                  className="rounded p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  aria-label="Edit"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(t)}
                  onBlur={() => setConfirmId(null)}
                  className={cn(
                    "rounded p-1.5 transition-colors",
                    confirmId === t.id
                      ? "bg-destructive text-white"
                      : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                  )}
                  aria-label={confirmId === t.id ? "Confirm delete" : "Delete"}
                >
                  {confirmId === t.id ? <Check className="size-4" /> : <Trash2 className="size-4" />}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Create / edit dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editing ? "Edit testimonial" : "New testimonial"}
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
              {editing && <input type="hidden" name="id" value={editing.id} />}

              <Field label="Site" htmlFor="division">
                <select
                  id="division"
                  name="division"
                  defaultValue={editing?.division ?? division}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="REFURBISHED">Refurbished store</option>
                  <option value="DISPOSAL">Disposal site</option>
                </select>
              </Field>

              <Field label="Quote" htmlFor="quote">
                <textarea
                  id="quote"
                  name="quote"
                  required
                  rows={3}
                  defaultValue={editing?.quote ?? ""}
                  placeholder="This service exceeded our expectations…"
                  className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Author" htmlFor="author">
                  <input
                    id="author"
                    name="author"
                    required
                    defaultValue={editing?.author ?? ""}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Rating" htmlFor="rating">
                  <select
                    id="rating"
                    name="rating"
                    defaultValue={String(editing?.rating ?? 5)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} star{r > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Position / title" htmlFor="role" hint="Optional">
                  <input
                    id="role"
                    name="role"
                    defaultValue={editing?.role ?? ""}
                    placeholder="IT Director"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Company" htmlFor="company" hint="Optional">
                  <input
                    id="company"
                    name="company"
                    defaultValue={editing?.company ?? ""}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </Field>
              </div>

              <Field label="Photo URL" htmlFor="avatarUrl" hint="Optional · from the media library">
                <input
                  id="avatarUrl"
                  name="avatarUrl"
                  defaultValue={editing?.avatarUrl ?? ""}
                  placeholder="https://…"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </Field>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                <input
                  type="checkbox"
                  name="status"
                  value="PUBLISHED"
                  defaultChecked={editing ? editing.status === "PUBLISHED" : true}
                  className="size-4 rounded accent-[var(--primary)]"
                />
                Published (visible on the storefront)
              </label>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  {editing ? "Save changes" : "Add testimonial"}
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
