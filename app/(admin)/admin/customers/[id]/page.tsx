import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, MapPin, ShoppingCart, Heart, Building, Phone, Mail } from "lucide-react";
import { getAdminCustomerById } from "@/lib/repositories/admin";
import { formatMoney } from "@/lib/format";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getAdminCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Back button and title */}
      <div className="border-b border-border/60 pb-4">
        <Link
          href="/admin/customers"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customers</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 font-bold text-lg">
            {(customer.name || customer.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{customer.name || "Customer Profile"}</h1>
            <p className="text-xs text-muted-foreground">Joined on {new Date(customer.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left 1 Col: Profile details & Saved Addresses */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-violet-500" />
              <span>Contact Details</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="font-mono text-foreground">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-foreground">{customer.phone}</span>
                </div>
              )}
              {customer.company && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="font-semibold text-foreground">{customer.company}</span>
                </div>
              )}
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-500" />
              <span>Saved Addresses ({customer.addresses.length})</span>
            </h2>

            {customer.addresses.length === 0 ? (
              <p className="text-xs text-muted-foreground">No saved addresses.</p>
            ) : (
              <div className="space-y-3">
                {customer.addresses.map((addr) => (
                  <div key={addr.id} className="rounded-lg border border-border/60 p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span>{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground">{addr.line1}</div>
                    {addr.line2 && <div className="text-muted-foreground">{addr.line2}</div>}
                    <div className="text-muted-foreground">
                      {addr.city}, {addr.region} {addr.postalCode}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Cols: Order History & Wishlist */}
        <div className="space-y-6 md:col-span-2">
          {/* Order History */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span>Order History ({customer.orders.length})</span>
            </h2>

            {customer.orders.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">This customer has not placed any orders yet.</p>
            ) : (
              <div className="divide-y divide-border/40">
                {customer.orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-mono font-bold text-xs text-foreground">{order.orderNumber}</div>
                      <div className="text-[11px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xs text-foreground">{formatMoney(order.totalCents)}</div>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[10px] text-primary hover:underline font-semibold"
                      >
                        View Order Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Items */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span>Wishlist Items ({customer.wishlistItems.length})</span>
            </h2>

            {customer.wishlistItems.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">No items saved in wishlist.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {customer.wishlistItems.map((w) => (
                  <div key={w.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                    {w.product.images?.[0]?.url ? (
                      <img
                        src={w.product.images[0].url}
                        alt={w.product.name}
                        className="h-10 w-10 rounded object-cover border shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center font-bold text-[9px] shrink-0">
                        IMG
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">{w.product.name}</div>
                      <div className="text-xs font-bold text-primary">{formatMoney(w.product.priceCents)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
