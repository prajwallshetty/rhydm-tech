"use client";

import * as React from "react";
import { ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

/**
 * Minimal shadcn-style chart primitives over Recharts. `ChartContainer` injects
 * each series colour as a `--color-<key>` CSS variable (so charts theme with
 * the design tokens and switch cleanly in dark mode) and provides the
 * responsive wrapper; `ChartTooltipContent` renders a consistent tooltip card.
 */
export type ChartConfig = Record<
  string,
  { label: string; color: string; formatter?: (value: number) => string }
>;

const ChartContext = React.createContext<ChartConfig | null>(null);

function useChartConfig() {
  return React.useContext(ChartContext);
}

export function ChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig;
  className?: string;
  children: React.ReactElement;
}) {
  const style = Object.fromEntries(
    Object.entries(config).map(([key, v]) => [`--color-${key}`, v.color]),
  ) as React.CSSProperties;

  return (
    <ChartContext.Provider value={config}>
      <div className={cn("w-full", className)} style={style}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

type TooltipPayloadEntry = {
  dataKey?: string;
  name?: string;
  value?: number;
  color?: string;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
}) {
  const config = useChartConfig();
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label != null && (
        <div className="mb-1 font-semibold text-foreground">{label}</div>
      )}
      <div className="space-y-1">
        {payload.map((entry, i) => {
          const key = entry.dataKey ?? "";
          const meta = config?.[key];
          const value = typeof entry.value === "number" ? entry.value : 0;
          return (
            <div key={i} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: meta?.color ?? entry.color }}
                />
                {meta?.label ?? entry.name ?? key}
              </span>
              <span className="font-mono font-semibold text-foreground">
                {meta?.formatter ? meta.formatter(value) : value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
