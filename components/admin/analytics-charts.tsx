"use client";

import {
  DollarSign,
  ShoppingBag,
  Eye,
  Package,
  Boxes,
  BarChart3,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import { formatMoney } from "@/lib/format";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tooltip as RTooltip } from "recharts";

type MonthPoint = {
  label: string;
  revenueCents: number;
  orders: number;
  units: number;
  views: number;
};

type AnalyticsData = {
  series: MonthPoint[];
  snapshot: {
    totalProducts: number;
    totalCustomers: number;
    totalOrders: number;
    totalRevenueCents: number;
    totalStockUnits: number;
    lowStock: number;
  };
};

const AXIS = { fontSize: 11, className: "fill-muted-foreground" };

export function AnalyticsCharts({ data }: { data: AnalyticsData }) {
  const { series, snapshot } = data;

  // Revenue is charted in whole currency units so the axis reads naturally.
  const revenueSeries = series.map((m) => ({ ...m, revenue: m.revenueCents / 100 }));

  const revenueConfig: ChartConfig = {
    revenue: { label: "Revenue", color: "#2E6F40", formatter: (v) => formatMoney(Math.round(v * 100)) },
  };
  const ordersConfig: ChartConfig = {
    orders: { label: "Orders", color: "#2563EB" },
  };
  const salesConfig: ChartConfig = {
    units: { label: "Units sold", color: "#7C3AED" },
  };
  const viewsConfig: ChartConfig = {
    views: { label: "Product views", color: "#EA580C" },
  };

  return (
    <div className="space-y-6">
      {/* Snapshot metric row (all live) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Metric icon={DollarSign} label="Revenue" value={formatMoney(snapshot.totalRevenueCents)} />
        <Metric icon={ShoppingBag} label="Orders" value={String(snapshot.totalOrders)} />
        <Metric icon={Eye} label="Customers" value={String(snapshot.totalCustomers)} />
        <Metric icon={Package} label="Products" value={String(snapshot.totalProducts)} />
        <Metric icon={Boxes} label="Units in stock" value={String(snapshot.totalStockUnits)} />
        <Metric
          icon={BarChart3}
          label="Low stock"
          value={String(snapshot.lowStock)}
          tone={snapshot.lowStock > 0 ? "amber" : undefined}
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue — area line */}
        <ChartCard title="Revenue" subtitle="Last 6 months" accent="#2E6F40">
          <ChartContainer config={revenueConfig} className="h-[240px]">
            <AreaChart data={revenueSeries} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={52}
                tick={AXIS}
                tickFormatter={(v: number) => formatMoney(Math.round(v * 100))}
              />
              <RTooltip cursor={{ stroke: "var(--color-revenue)", strokeOpacity: 0.2 }} content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={2.5}
                fill="url(#fillRevenue)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ChartContainer>
        </ChartCard>

        {/* Orders — line */}
        <ChartCard title="Orders" subtitle="Last 6 months" accent="#2563EB">
          <ChartContainer config={ordersConfig} className="h-[240px]">
            <LineChart data={series} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS} />
              <YAxis tickLine={false} axisLine={false} width={32} tick={AXIS} allowDecimals={false} />
              <RTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="var(--color-orders)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </ChartCard>

        {/* Sales (units) — line */}
        <ChartCard title="Sales" subtitle="Units sold · last 6 months" accent="#7C3AED">
          <ChartContainer config={salesConfig} className="h-[240px]">
            <LineChart data={series} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS} />
              <YAxis tickLine={false} axisLine={false} width={32} tick={AXIS} allowDecimals={false} />
              <RTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="units"
                stroke="var(--color-units)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </ChartCard>

        {/* Visitors / product views — line */}
        <ChartCard title="Product Views" subtitle="Storefront activity · last 6 months" accent="#EA580C">
          <ChartContainer config={viewsConfig} className="h-[240px]">
            <LineChart data={series} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS} />
              <YAxis tickLine={false} axisLine={false} width={32} tick={AXIS} allowDecimals={false} />
              <RTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="views"
                stroke="var(--color-views)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: "amber";
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-muted-foreground">
        <span>{label}</span>
        <Icon className={tone === "amber" ? "h-4 w-4 text-amber-500" : "h-4 w-4 text-primary"} />
      </div>
      <div className="mt-1.5 text-xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <span className="size-2.5 rounded-full" style={{ backgroundColor: accent }} />
      </div>
      {children}
    </div>
  );
}
