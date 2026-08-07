import Link from "next/link";
import { ArrowRight, RotateCcw, Search, Eye, Filter, Calendar, DollarSign } from "lucide-react";
import { db } from "@/lib/db";
import { formatPriceExact } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminExchangesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; status?: string }>;
}) {
  const { query = "", status = "" } = await searchParams;

  // Fetch exchange requests with filters
  const exchanges = await db.exchangeRequest.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { referenceNumber: { contains: query, mode: "insensitive" } },
                { brand: { contains: query, mode: "insensitive" } },
                { model: { contains: query, mode: "insensitive" } },
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
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const statuses = ["PENDING", "COUNTER_OFFER", "APPROVED", "PICKUP_SCHEDULED", "RECEIVED", "COMPLETED", "REJECTED"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl flex items-center gap-2">
          <RotateCcw className="h-8 w-8 text-primary" />
          <span>Device Exchanges</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review, counter, approve, and track client trade-in hardware requests.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border/80 shadow-xs">
        <form className="flex-1 flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search reference, brand, client..."
              className="w-full pl-9 pr-4 py-2 border border-input rounded-lg text-xs outline-none bg-background focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/95 rounded-lg shadow-xs cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 pr-2">
            <Filter className="h-3.5 w-3.5" />
            <span>Status:</span>
          </span>
          <Link
            href="/admin/exchanges"
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
              !status
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-slate-600 border-border hover:bg-muted"
            )}
          >
            All
          </Link>
          {statuses.map((st) => (
            <Link
              key={st}
              href={`/admin/exchanges?status=${st}${query ? `&query=${query}` : ""}`}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border uppercase",
                status === st
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-slate-600 border-border hover:bg-muted"
              )}
            >
              {st.replace("_", " ")}
            </Link>
          ))}
        </div>
      </div>

      {/* Exchanges Table */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="p-4">Reference</th>
                <th className="p-4">Client</th>
                <th className="p-4">Device</th>
                <th className="p-4">Est Value</th>
                <th className="p-4">Final Value</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-medium">
              {exchanges.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-bold text-slate-900">{ex.referenceNumber}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {new Date(ex.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-800">{ex.user?.name || "Guest Customer"}</span>
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{ex.user?.email || "No Email"}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-800">{ex.brand} {ex.model}</span>
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{ex.deviceType} · {ex.condition}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-600">
                    {formatPriceExact(ex.estimatedValueCents)}
                  </td>
                  <td className="p-4 font-extrabold text-slate-900">
                    {ex.finalValueCents ? formatPriceExact(ex.finalValueCents) : "—"}
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border",
                      ex.status === "PENDING" && "bg-slate-50 text-slate-600 border-slate-200",
                      ex.status === "COUNTER_OFFER" && "bg-amber-50 text-amber-700 border-amber-200",
                      ex.status === "APPROVED" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                      ex.status === "REJECTED" && "bg-red-50 text-red-700 border-red-200",
                      ex.status === "PICKUP_SCHEDULED" && "bg-blue-50 text-blue-700 border-blue-200",
                      ex.status === "RECEIVED" && "bg-violet-50 text-violet-700 border-violet-200",
                      ex.status === "COMPLETED" && "bg-[#E8F5E9] text-[#1B5E20] border-emerald-250"
                    )}>
                      {ex.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/exchanges/${ex.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 hover:bg-slate-50 transition-colors shadow-2xs font-semibold"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Review</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {exchanges.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                    No exchange requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
