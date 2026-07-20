import Link from "next/link";
import { Search, ShoppingCart, Eye, Clock } from "lucide-react";
import { getAdminOrders } from "@/lib/repositories/admin";
import { formatMoney } from "@/lib/format";
import { OrderStatus } from "@/lib/generated/prisma/enums";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const ordersData = await getAdminOrders({
    search: params.search,
    status: params.status as OrderStatus,
    page,
    limit: 10,
  });

  const statuses: Array<{ label: string; value?: OrderStatus }> = [
    { label: "All Orders" },
    { label: "Pending", value: OrderStatus.PENDING },
    { label: "Confirmed", value: OrderStatus.CONFIRMED },
    { label: "Processing", value: OrderStatus.PROCESSING },
    { label: "Shipped", value: OrderStatus.SHIPPED },
    { label: "Delivered", value: OrderStatus.DELIVERED },
    { label: "Cancelled", value: OrderStatus.CANCELLED },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage customer purchases, fulfillment status, and order notes.</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-2 md:border-b-0 md:pb-0">
          {statuses.map((tab) => {
            const active = (tab.value === undefined && !params.status) || params.status === tab.value;
            const query = new URLSearchParams();
            if (params.search) query.set("search", params.search);
            if (tab.value) query.set("status", tab.value);

            return (
              <Link
                key={tab.label}
                href={`/admin/orders?${query.toString()}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <form className="relative max-w-xs w-full">
          {params.status && <input type="hidden" name="status" value={params.status} />}
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="search"
            defaultValue={params.search || ""}
            placeholder="Search order # or email..."
            className="w-full rounded-lg border border-input bg-background/50 pl-9 pr-4 py-2 text-xs outline-none focus:border-primary"
          />
        </form>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/30 font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Order #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {ordersData.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                    No orders found.
                  </td>
                </tr>
              ) : (
                ordersData.items.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground text-xs">{order.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-semibold text-foreground">{order.user?.name || "Guest Checkout"}</div>
                      <div className="text-[11px] text-muted-foreground">{order.email}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </td>
                    <td className="p-3 font-semibold text-foreground">{formatMoney(order.totalCents)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : order.status === "CANCELLED"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : order.status === "SHIPPED"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted hover:text-primary transition-colors"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border/60 p-4 text-xs text-muted-foreground">
          <span>
            Showing {ordersData.items.length} of {ordersData.total} orders
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/orders?page=${Math.max(1, page - 1)}${params.status ? `&status=${params.status}` : ""}`}
              className={`rounded border border-border px-2.5 py-1 ${page <= 1 ? "opacity-40 pointer-events-none" : "hover:bg-muted"}`}
            >
              Previous
            </Link>
            <span className="font-medium text-foreground">
              Page {page} of {ordersData.totalPages || 1}
            </span>
            <Link
              href={`/admin/orders?page=${Math.min(ordersData.totalPages, page + 1)}${params.status ? `&status=${params.status}` : ""}`}
              className={`rounded border border-border px-2.5 py-1 ${page >= ordersData.totalPages ? "opacity-40 pointer-events-none" : "hover:bg-muted"}`}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
