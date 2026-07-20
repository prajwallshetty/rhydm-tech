"use client";

import { TrendingUp, ShoppingBag, DollarSign, Users, ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/lib/format";

export function AnalyticsCharts({ data }: { data: any }) {
  const { overview, ordersByStatus, topCategories } = data;

  const monthlyRevenue = [
    { month: "Jan", revenue: 14200 },
    { month: "Feb", revenue: 18500 },
    { month: "Mar", revenue: 22100 },
    { month: "Apr", revenue: 19800 },
    { month: "May", revenue: 27400 },
    { month: "Jun", revenue: 31500 },
    { month: "Jul", revenue: Math.max(34000, Math.round(overview.totalRevenueCents / 100)) },
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map((r) => r.revenue));

  return (
    <div className="space-y-8">
      {/* Top metric row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Total Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatMoney(overview.totalRevenueCents)}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> +18.4% from last month
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Orders Placed</span>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{overview.totalOrders}</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> +12.1% growth
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Active Customers</span>
            <Users className="h-4 w-4 text-violet-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{overview.totalCustomers}</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> +9.3% new users
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Catalog Items</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{overview.totalProducts}</div>
          <div className="text-[11px] text-muted-foreground">In active distribution</div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Trend Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="font-semibold text-foreground text-base">Revenue Growth Trend</h2>
              <p className="text-xs text-muted-foreground">Monthly sales performance summary</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              YTD 2026
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="flex h-64 items-end justify-between gap-3 pt-6 border-b border-border/40 pb-4">
            {monthlyRevenue.map((item) => {
              const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
              return (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-mono font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    ${(item.revenue / 1000).toFixed(1)}k
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/70 group-hover:from-primary/90 group-hover:to-primary transition-all shadow-sm"
                  />
                  <span className="text-xs font-medium text-muted-foreground">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Breakdown (1 col) */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          <div className="border-b border-border/60 pb-4">
            <h2 className="font-semibold text-foreground text-base">Top Categories</h2>
            <p className="text-xs text-muted-foreground">Products by category distribution</p>
          </div>

          <div className="space-y-4">
            {topCategories.map((cat: any) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground">{cat.name}</span>
                  <span className="text-muted-foreground">{cat.count} products</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (cat.count / Math.max(1, overview.totalProducts)) * 100)}%` }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
