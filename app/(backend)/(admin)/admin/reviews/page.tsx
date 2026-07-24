import { Star, ShieldCheck, MessageSquareText } from "lucide-react";

import { getAdminReviews } from "@/lib/repositories/admin";
import { ReviewsTable } from "@/components/admin/reviews-table";

type SearchParams = Promise<{
  q?: string;
  rating?: string;
  verified?: string;
  page?: string;
}>;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const rating = sp.rating ? Number(sp.rating) : undefined;
  const verified =
    sp.verified === "verified" || sp.verified === "unverified"
      ? sp.verified
      : undefined;

  const data = await getAdminReviews({
    search: sp.q,
    rating: rating && rating >= 1 && rating <= 5 ? rating : undefined,
    verified,
    page: sp.page ? Number(sp.page) : 1,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Reviews
          </h1>
          <p className="text-sm text-muted-foreground">
            Moderate customer reviews across the refurbished store.
          </p>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={MessageSquareText}
          label="Total reviews"
          value={String(data.total)}
        />
        <StatCard
          icon={Star}
          label="Average rating"
          value={data.averageRating ? data.averageRating.toFixed(2) : "—"}
        />
        <StatCard
          icon={ShieldCheck}
          label="Verified"
          value={String(data.verifiedCount)}
        />
      </div>

      <ReviewsTable
        reviews={data.items}
        page={data.page}
        pageCount={data.pageCount}
        total={data.total}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
        <span>{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}
