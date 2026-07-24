import { Boxes, AlertTriangle, PackageX, Layers } from "lucide-react";

import { getInventory } from "@/lib/repositories/admin";
import { InventoryTable } from "@/components/admin/inventory-table";

type SearchParams = Promise<{ q?: string; level?: string; page?: string }>;

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const stockLevel =
    sp.level === "low" || sp.level === "out" ? sp.level : "all";

  const data = await getInventory({
    search: sp.q,
    stockLevel,
    page: sp.page ? Number(sp.page) : 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Inventory
        </h1>
        <p className="text-sm text-muted-foreground">
          Track and adjust on-hand stock. Changes sync to the storefront immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard icon={Layers} label="SKUs" value={String(data.total)} />
        <StatCard icon={Boxes} label="Units on hand" value={String(data.totalUnits)} />
        <StatCard
          icon={AlertTriangle}
          label="Low stock"
          value={String(data.lowStock)}
          tone="amber"
        />
        <StatCard
          icon={PackageX}
          label="Out of stock"
          value={String(data.outOfStock)}
          tone="red"
        />
      </div>

      <InventoryTable
        items={data.items.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          slug: p.slug,
          stock: p.stock,
          priceCents: p.priceCents,
          categoryName: p.category?.name ?? "—",
        }))}
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
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: "amber" | "red";
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
        <span>{label}</span>
        <Icon
          className={
            tone === "amber"
              ? "h-4 w-4 text-amber-500"
              : tone === "red"
                ? "h-4 w-4 text-red-500"
                : "h-4 w-4 text-primary"
          }
        />
      </div>
      <div className="mt-2 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}
