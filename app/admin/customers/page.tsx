import Link from "next/link";
import { Search, Users, Eye } from "lucide-react";
import { getAdminCustomers } from "@/lib/repositories/admin";
import { formatMoney } from "@/lib/format";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const customersData = await getAdminCustomers({
    search: params.search,
    page,
    limit: 10,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Customers</h1>
          <p className="text-sm text-muted-foreground">Manage user accounts, company profiles, and order histories.</p>
        </div>
      </div>

      {/* Search Header */}
      <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <form className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="search"
            defaultValue={params.search || ""}
            placeholder="Search by customer name, email, or company..."
            className="w-full rounded-lg border border-input bg-background/50 pl-9 pr-4 py-2 text-xs outline-none focus:border-primary"
          />
        </form>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/30 font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Company</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Total Orders</th>
                <th className="p-3">Total Spent</th>
                <th className="p-3">Joined Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {customersData.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customersData.items.map((cust) => (
                  <tr key={cust.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 font-bold text-xs shrink-0">
                          {(cust.name || cust.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{cust.name || "Customer"}</div>
                          <div className="text-[11px] text-muted-foreground">{cust.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{cust.company || "—"}</td>
                    <td className="p-3 text-muted-foreground">{cust.phone || "—"}</td>
                    <td className="p-3 font-semibold text-foreground">{cust._count.orders}</td>
                    <td className="p-3 font-semibold text-foreground">{formatMoney(cust.totalSpentCents)}</td>
                    <td className="p-3 text-muted-foreground">{new Date(cust.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/customers/${cust.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted hover:text-primary transition-colors"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> View Profile
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
            Showing {customersData.items.length} of {customersData.total} customers
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/customers?page=${Math.max(1, page - 1)}${params.search ? `&search=${params.search}` : ""}`}
              className={`rounded border border-border px-2.5 py-1 ${page <= 1 ? "opacity-40 pointer-events-none" : "hover:bg-muted"}`}
            >
              Previous
            </Link>
            <span className="font-medium text-foreground">
              Page {page} of {customersData.totalPages || 1}
            </span>
            <Link
              href={`/admin/customers?page=${Math.min(customersData.totalPages, page + 1)}${params.search ? `&search=${params.search}` : ""}`}
              className={`rounded border border-border px-2.5 py-1 ${page >= customersData.totalPages ? "opacity-40 pointer-events-none" : "hover:bg-muted"}`}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
