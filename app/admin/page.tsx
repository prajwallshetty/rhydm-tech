import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  Layers,
  AlertTriangle,
  ArrowRight,
  Plus,
  TrendingUp,
  Clock,
  Eye,
  FileText,
  Recycle,
} from "lucide-react";
import { getDashboardStats, getRecentOrders, getLowStockProducts, getRecentCustomers } from "@/lib/repositories/admin";
import { formatMoney } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [stats, recentOrders, lowStockProducts, recentCustomers] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(5),
    getLowStockProducts(5),
    getRecentCustomers(5),
  ]);

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      subtext: `${stats.lowStockCount} low stock alerts`,
      icon: Package,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      href: "/admin/products",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      subtext: `${formatMoney(stats.totalRevenueCents)} total revenue`,
      icon: ShoppingCart,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      href: "/admin/orders",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      subtext: "Registered accounts",
      icon: Users,
      color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
      href: "/admin/customers",
    },
    {
      title: "Product Categories",
      value: stats.totalCategories.toString(),
      subtext: "Active categories",
      icon: Layers,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      href: "/admin/categories",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Quick Action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of both Disposal operations and Refurbished store metrics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/blogs/new"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>New Blog Post</span>
          </Link>
          <Link
            href="/admin/disposal"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Recycle className="h-4 w-4" />
            <span>Disposal CMS</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold tracking-tight text-foreground">{card.value}</div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{card.subtext}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground text-base">Recent Orders</h2>
            </div>
            <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No orders recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs font-semibold uppercase text-muted-foreground">
                    <th className="pb-3 pr-4">Order #</th>
                    <th className="pb-3 pr-4">Customer</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4 text-right">Total</th>
                    <th className="pb-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-4 font-mono font-medium text-foreground text-xs">{order.orderNumber}</td>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-foreground text-xs">{order.user?.name || "Guest"}</div>
                        <div className="text-[11px] text-muted-foreground">{order.email}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          order.status === "DELIVERED" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                          order.status === "CANCELLED" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                          "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-foreground text-xs">
                        {formatMoney(order.totalCents)}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Products (1 col) */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-foreground text-base">Low Stock Alert</h2>
            </div>
            <Link href="/admin/products" className="text-xs font-semibold text-primary hover:underline">
              Manage
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-8 text-center text-sm text-emerald-500 font-medium">All products well-stocked!</div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-lg border border-border/60 p-3 hover:bg-muted/40 transition-colors">
                  <div className="min-w-0 pr-2">
                    <div className="truncate text-xs font-semibold text-foreground">{product.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{product.sku}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                      {product.stock} left
                    </span>
                    <div className="text-[11px] font-semibold text-foreground mt-0.5">
                      {formatMoney(product.priceCents)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Customers widget */}
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-500" />
            <h2 className="font-semibold text-foreground text-base">Recent Customers</h2>
          </div>
          <Link href="/admin/customers" className="text-xs font-semibold text-primary hover:underline">
            View Customers
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {recentCustomers.map((cust) => (
            <Link
              key={cust.id}
              href={`/admin/customers/${cust.id}`}
              className="flex flex-col justify-between rounded-xl border border-border/60 p-4 hover:border-primary/30 hover:bg-muted/30 transition-all"
            >
              <div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 font-bold text-xs">
                  {(cust.name || cust.email).charAt(0).toUpperCase()}
                </div>
                <div className="mt-3 font-semibold text-foreground text-xs truncate">{cust.name || "Customer"}</div>
                <div className="text-[11px] text-muted-foreground truncate">{cust.email}</div>
                {cust.company && <div className="text-[10px] font-medium text-primary mt-1">{cust.company}</div>}
              </div>
              <div className="mt-3 text-[10px] text-muted-foreground border-t border-border/40 pt-2 flex items-center justify-between">
                <span>Orders: {cust._count.orders}</span>
                <span className="text-foreground font-semibold">View</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
