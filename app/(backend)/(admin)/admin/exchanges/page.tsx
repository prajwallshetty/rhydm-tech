import Link from "next/link";
import { RotateCcw, Search, Eye, Filter, Inbox } from "lucide-react";

import { db } from "@/lib/db";
import { formatPriceExact } from "@/lib/format";
import {
  EXCHANGE_STATUSES,
  EXCHANGE_TONE_CLASSES,
  exchangeStatusLabel,
  exchangeStatusTone,
} from "@/lib/data/exchange-status";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminExchangesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; status?: string }>;
}) {
  const { query = "", status = "" } = await searchParams;

  const [exchanges, newCount, awaitingOfferCount] = await Promise.all([
    db.exchangeRequest.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { referenceNumber: { contains: query, mode: "insensitive" } },
                  { brand: { contains: query, mode: "insensitive" } },
                  { model: { contains: query, mode: "insensitive" } },
                  { contactName: { contains: query, mode: "insensitive" } },
                  { contactEmail: { contains: query, mode: "insensitive" } },
                  {
                    user: {
                      OR: [
                        { email: { contains: query, mode: "insensitive" } },
                        { name: { contains: query, mode: "insensitive" } },
                      ],
                    },
                  },
                ],
              }
            : {},
          status ? { status } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { name: true, email: true } } },
    }),
    db.exchangeRequest.count({ where: { status: "PENDING" } }),
    db.exchangeRequest.count({ where: { status: { in: ["PENDING", "UNDER_REVIEW"] } } }),
  ]);

  const buildHref = (nextStatus: string) => {
    const params = new URLSearchParams();
    if (nextStatus) params.set("status", nextStatus);
    if (query) params.set("query", query);
    const qs = params.toString();
    return qs ? `/admin/exchanges?${qs}` : "/admin/exchanges";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          <RotateCcw className="h-7 w-7 shrink-0 text-primary md:h-8 md:w-8" />
          <span>Device Exchanges</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review each trade-in by hand, then record the offer you sent the customer.
        </p>
      </div>

      {/* Queue snapshot */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="New" value={newCount} href={buildHref("PENDING")} />
        <Stat label="Awaiting an offer" value={awaitingOfferCount} href={buildHref("UNDER_REVIEW")} />
        <Stat label="Shown here" value={exchanges.length} href={buildHref(status)} />
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-xs">
        <form className="flex max-w-md flex-1 gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="query"
              defaultValue={query}
              placeholder="Reference, brand, customer…"
              aria-label="Search exchange requests"
              className="min-h-10 w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-xs outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="min-h-10 shrink-0 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary/95 cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1.5 pr-1 text-xs font-semibold text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Status:</span>
          </span>
          <FilterPill href={buildHref("")} active={!status} label="All" />
          {EXCHANGE_STATUSES.map((st) => (
            <FilterPill
              key={st.value}
              href={buildHref(st.value)}
              active={status === st.value}
              label={st.label}
            />
          ))}
        </div>
      </div>

      {exchanges.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 text-base font-bold text-foreground">No exchange requests found</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            {query || status
              ? "Nothing matches these filters. Try clearing the search or picking a different status."
              : "Trade-in requests submitted from the storefront will appear here for review."}
          </p>
          {(query || status) && (
            <Link
              href="/admin/exchanges"
              className="mt-5 inline-flex min-h-10 items-center rounded-lg border border-border bg-background px-4 text-xs font-bold transition-colors hover:bg-muted"
            >
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: cards. A seven-column table cannot be read on a phone,
              so below `lg` each request becomes its own card. */}
          <ul className="space-y-3 lg:hidden">
            {exchanges.map((ex) => (
              <li key={ex.id}>
                <Link
                  href={`/admin/exchanges/${ex.id}`}
                  className="block rounded-xl border border-border/80 bg-card p-4 shadow-xs transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-foreground">{ex.referenceNumber}</p>
                      <p className="mt-1 truncate text-sm font-bold text-foreground">
                        {ex.brand} {ex.model}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {ex.deviceType} · {ex.condition}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                        EXCHANGE_TONE_CLASSES[exchangeStatusTone(ex.status)],
                      )}
                    >
                      {exchangeStatusLabel(ex.status)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px]">
                    <span className="min-w-0 truncate text-muted-foreground">
                      {ex.contactName || ex.user?.name || "Guest"} ·{" "}
                      {ex.contactEmail || ex.user?.email || "no email"}
                    </span>
                    <span className="shrink-0 font-extrabold text-foreground">
                      {ex.finalValueCents != null ? formatPriceExact(ex.finalValueCents) : "No offer yet"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th scope="col" className="p-4">Reference</th>
                  <th scope="col" className="p-4">Customer</th>
                  <th scope="col" className="p-4">Device</th>
                  <th scope="col" className="p-4">Offer</th>
                  <th scope="col" className="p-4">Status</th>
                  <th scope="col" className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-medium">
                {exchanges.map((ex) => (
                  <tr key={ex.id} className="transition-colors hover:bg-muted/40">
                    <td className="p-4">
                      <span className="font-mono font-bold text-foreground">{ex.referenceNumber}</span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">
                        {new Date(ex.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-foreground">
                        {ex.contactName || ex.user?.name || "Guest"}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                        {ex.contactEmail || ex.user?.email || "No email"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-foreground">{ex.brand} {ex.model}</span>
                      <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                        {ex.deviceType} · {ex.condition}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-foreground">
                      {ex.finalValueCents != null ? (
                        formatPriceExact(ex.finalValueCents)
                      ) : (
                        <span className="font-semibold text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                          EXCHANGE_TONE_CLASSES[exchangeStatusTone(ex.status)],
                        )}
                      >
                        {exchangeStatusLabel(ex.status)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/exchanges/${ex.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 font-semibold shadow-2xs transition-colors hover:bg-muted"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Review</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border/80 bg-card p-4 shadow-xs transition-colors hover:bg-muted/40"
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
    </Link>
  );
}

function FilterPill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-slate-600 hover:bg-muted",
      )}
    >
      {label}
    </Link>
  );
}
