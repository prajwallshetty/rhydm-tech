import Link from "next/link";
import { AlertTriangle, Calendar } from "lucide-react";

import { formatMoney } from "@/lib/format";
import {
  getDashboardStats,
  getRecentOrders,
  getSalesByCategory,
  getSalesByDay,
  getTopProducts,
} from "@/lib/repositories/admin";

/**
 * Dashboard, driven entirely by live queries — no hardcoded numbers. There is
 * deliberately no fake "+18% vs last week" chip: we have no historical
 * baseline yet, and an invented trend is worse than none.
 */
export default async function AdminDashboardPage() {
  const [stats, salesByDay, topProducts, recentOrders, categorySales] =
    await Promise.all([
      getDashboardStats(),
      getSalesByDay(7),
      getTopProducts(5),
      getRecentOrders(5),
      getSalesByCategory(),
    ]);

  const averageOrderCents =
    stats.totalOrders > 0
      ? Math.round(stats.totalRevenueCents / stats.totalOrders)
      : 0;

  const kpiCards = [
    { title: "Total Sales", value: formatMoney(stats.totalRevenueCents) },
    { title: "Orders", value: String(stats.totalOrders) },
    { title: "Customers", value: String(stats.totalCustomers) },
    { title: "Avg. Order Value", value: formatMoney(averageOrderCents) },
    {
      title: "Low Stock",
      value: String(stats.lowStockCount),
      alert: stats.lowStockCount > 0,
    },
  ];

  // --- Area chart geometry (viewBox 700×200) ------------------------------
  const maxDay = Math.max(...salesByDay.map((d) => d.totalCents), 1);
  const chartPoints = salesByDay.map((day, i) => ({
    x: salesByDay.length > 1 ? (i / (salesByDay.length - 1)) * 700 : 350,
    y: 190 - (day.totalCents / maxDay) * 170,
    ...day,
  }));
  const linePath = chartPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L700 200 L0 200 Z`;
  const hasSales = salesByDay.some((d) => d.totalCents > 0);

  const gridLabels = [maxDay, maxDay * 0.75, maxDay * 0.5, maxDay * 0.25, 0];

  const dayLabel = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);
  const rangeLabel = `${weekAgo.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  // Donut palette (kept from the existing admin theme).
  const DONUT_COLORS = ["#2E6F40", "#4CAF50", "#81C784", "#A5D6A7", "#C8E6C9"];
  const donutSegments = categorySales.slice(0, 4);
  const donutOther = categorySales.slice(4);
  const donutRows = [
    ...donutSegments,
    ...(donutOther.length > 0
      ? [
          {
            name: "Others",
            totalCents: donutOther.reduce((t, c) => t + c.totalCents, 0),
            percent: donutOther.reduce((t, c) => t + c.percent, 0),
          },
        ]
      : []),
  ];

  const STATUS_STYLES: Record<string, string> = {
    DELIVERED: "bg-[#E8F5E9] text-[#2E6F40]",
    SHIPPED: "bg-[#E3F2FD] text-blue-600",
    PROCESSING: "bg-[#FFF8E1] text-amber-600",
    CONFIRMED: "bg-[#E3F2FD] text-blue-600",
    CANCELLED: "bg-red-50 text-red-600",
    PENDING: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="space-y-6">
      {/* Greeting + real date range */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Welcome back, Admin 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Here&rsquo;s what&rsquo;s happening across the store and disposal
            operations.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card px-4 py-2 text-xs font-bold text-slate-700 dark:text-foreground shadow-xs self-start sm:self-auto">
          <Calendar className="size-3.5 text-slate-500" />
          <span>{rangeLabel}</span>
        </span>
      </div>

      {/* KPI cards — live values */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-border dark:bg-card hover:shadow-md transition-shadow"
          >
            <span className="text-[11px] font-bold text-slate-500 dark:text-muted-foreground">
              {card.title}
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </span>
              {card.alert && (
                <AlertTriangle className="size-4 text-amber-500" aria-label="Attention needed" />
              )}
            </div>
            <span className="mt-3 text-[10px] font-medium text-slate-400">
              All-time · live
            </span>
          </div>
        ))}
      </div>

      {/* Sales overview + top products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-border dark:bg-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Sales Overview
            </h2>
            <span className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 dark:border-border dark:bg-muted/50 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-foreground">
              Last 7 days
            </span>
          </div>

          {hasSales ? (
            <>
              <div className="relative w-full h-64 flex flex-col justify-between pt-4">
                {gridLabels.map((value, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-center text-[10px] text-slate-400 font-medium"
                  >
                    <span className="w-14 shrink-0">
                      {formatMoney(Math.round(value))}
                    </span>
                    <div className="w-full border-b border-slate-100 dark:border-border/50" />
                  </div>
                ))}

                <div className="absolute inset-0 pl-14 pt-2 pb-6">
                  <svg
                    className="h-full w-full overflow-visible"
                    viewBox="0 0 700 200"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Daily revenue, last 7 days"
                  >
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2E6F40" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2E6F40" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#salesGrad)" />
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#2E6F40"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {chartPoints.map((pt) => (
                      <circle
                        key={pt.date}
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill="#2E6F40"
                        stroke="#ffffff"
                        strokeWidth="2"
                      >
                        <title>{`${dayLabel(pt.date)}: ${formatMoney(pt.totalCents)}`}</title>
                      </circle>
                    ))}
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold pt-3 pl-14">
                {salesByDay.map((day) => (
                  <span key={day.date}>{dayLabel(day.date)}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="grid h-64 place-items-center rounded-xl border border-dashed border-slate-200 dark:border-border">
              <p className="text-xs font-medium text-slate-400">
                No orders in the last 7 days yet — the chart fills in as sales
                come through.
              </p>
            </div>
          )}
        </div>

        {/* Top selling products — real order volume */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-border dark:bg-card flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-border/60 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Top Selling Products
            </h2>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-[#2E6F40] hover:underline"
            >
              View All
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className="grid flex-1 place-items-center py-10">
              <p className="text-xs font-medium text-slate-400">
                No orders yet — best sellers appear once items are purchased.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 flex-1">
              {topProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/refurbished/products/${product.slug}`}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {product.unitsSold} sold
                    </p>
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                    {formatMoney(product.revenueCents)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders + category share */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-border dark:bg-card">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-border/60 pb-4 mb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#2E6F40] hover:underline"
            >
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="py-10 text-center text-xs font-medium text-slate-400">
              No orders yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-border/60 text-[11px] font-bold text-slate-400">
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border/40">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-muted/40 transition-colors"
                    >
                      <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        {order.user?.name ?? order.email}
                      </td>
                      <td className="py-3 font-black text-slate-900 dark:text-white">
                        {formatMoney(order.totalCents)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-bold ${STATUS_STYLES[order.status] ?? "bg-slate-100 text-slate-600"}`}
                        >
                          {order.status.charAt(0) +
                            order.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-500 font-medium">
                        {order.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sales by category — real share of order revenue */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-border dark:bg-card flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-border/60 pb-3 mb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Sales by Category
            </h2>
            <Link
              href="/admin/categories"
              className="text-xs font-bold text-[#2E6F40] hover:underline"
            >
              View All
            </Link>
          </div>

          {donutRows.length === 0 ? (
            <div className="grid flex-1 place-items-center py-10">
              <p className="text-xs font-medium text-slate-400">
                Category share appears once orders exist.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
              <div className="relative size-44 shrink-0 flex items-center justify-center">
                <svg
                  className="size-full transform -rotate-90"
                  viewBox="0 0 36 36"
                  role="img"
                  aria-label="Revenue share by category"
                >
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E8F5E9"
                    strokeWidth="4"
                  />
                  {(() => {
                    let offset = 0;
                    return donutRows.map((row, i) => {
                      const segment = (
                        <path
                          key={row.name}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                          strokeWidth="4.5"
                          strokeDasharray={`${row.percent.toFixed(1)}, 100`}
                          strokeDashoffset={`-${offset.toFixed(1)}`}
                        />
                      );
                      offset += row.percent;
                      return segment;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Total
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {formatMoney(stats.totalRevenueCents)}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 w-full">
                {donutRows.map((row, i) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length],
                        }}
                      />
                      <span className="font-bold text-slate-800 dark:text-white">
                        {row.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-500 font-medium">
                        {formatMoney(row.totalCents)}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white w-12 text-right">
                        {row.percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
