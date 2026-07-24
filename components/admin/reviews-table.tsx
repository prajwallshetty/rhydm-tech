"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Star,
  ShieldCheck,
  ShieldX,
  Trash2,
  Search,
  Loader2,
  MessageSquareText,
} from "lucide-react";

import {
  setReviewVerifiedAction,
  deleteReviewAction,
} from "@/app/(backend)/(admin)/admin/actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Review = {
  id: string;
  author: string;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean;
  createdAt: Date;
  product: { name: string; slug: string };
};

export function ReviewsTable({
  reviews,
  page,
  pageCount,
  total,
}: {
  reviews: Review[];
  page: number;
  pageCount: number;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const push = useToast((s) => s.push);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [term, setTerm] = useState(searchParams.get("q") ?? "");
  const rating = searchParams.get("rating") ?? "";
  const verified = searchParams.get("verified") ?? "";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setParam("q", term.trim());
  }

  async function toggleVerified(review: Review) {
    setBusyId(review.id);
    const res = await setReviewVerifiedAction(review.id, !review.verified);
    setBusyId(null);
    if (res?.success) {
      push(review.verified ? "Marked as unverified" : "Marked as verified purchase", "check");
      router.refresh();
    }
  }

  async function remove(review: Review) {
    if (confirmId !== review.id) {
      setConfirmId(review.id);
      return;
    }
    setConfirmId(null);
    setBusyId(review.id);
    const res = await deleteReviewAction(review.id);
    setBusyId(null);
    if (res?.success) {
      push("Review deleted");
      router.refresh();
    }
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
            placeholder="Search author, title, product…"
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </form>

        <select
          value={rating}
          onChange={(e) => setParam("rating", e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>

        <select
          value={verified}
          onChange={(e) => setParam("verified", e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">All reviews</option>
          <option value="verified">Verified only</option>
          <option value="unverified">Unverified only</option>
        </select>

        {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-8 py-20 text-center">
          <MessageSquareText className="mx-auto size-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-sm font-bold text-foreground">No reviews found</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Reviews left by customers on the refurbished store will appear here for moderation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-border/80 bg-card p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {review.author}
                    </span>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                        <ShieldCheck className="size-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    on{" "}
                    <span className="font-medium text-foreground/80">
                      {review.product.name}
                    </span>{" "}
                    · {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-4",
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30",
                      )}
                    />
                  ))}
                </div>
              </div>

              {review.title && (
                <h4 className="mt-3 text-sm font-semibold text-foreground">
                  {review.title}
                </h4>
              )}
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {review.body}
              </p>

              <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
                <button
                  type="button"
                  onClick={() => toggleVerified(review)}
                  disabled={busyId === review.id}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50",
                    review.verified
                      ? "text-muted-foreground hover:bg-muted"
                      : "bg-primary/10 text-primary hover:bg-primary/20",
                  )}
                >
                  {busyId === review.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : review.verified ? (
                    <ShieldX className="size-3.5" />
                  ) : (
                    <ShieldCheck className="size-3.5" />
                  )}
                  {review.verified ? "Unverify" : "Verify"}
                </button>

                <button
                  type="button"
                  onClick={() => remove(review)}
                  onBlur={() => setConfirmId(null)}
                  disabled={busyId === review.id}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50",
                    confirmId === review.id
                      ? "bg-destructive text-white"
                      : "text-destructive hover:bg-destructive/10",
                  )}
                >
                  <Trash2 className="size-3.5" />
                  {confirmId === review.id ? "Confirm delete" : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-4 text-sm">
          <span className="text-muted-foreground">
            Page {page} of {pageCount} · {total} reviews
          </span>
          <div className="flex gap-2">
            <PagerButton disabled={page <= 1} onClick={() => setParam("page", String(page - 1))}>
              Previous
            </PagerButton>
            <PagerButton
              disabled={page >= pageCount}
              onClick={() => setParam("page", String(page + 1))}
            >
              Next
            </PagerButton>
          </div>
        </div>
      )}
    </div>
  );
}

function PagerButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
