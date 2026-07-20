import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, MapPin, Package, Clock, Save, FileText, CheckCircle } from "lucide-react";
import { getAdminOrderById } from "@/lib/repositories/admin";
import { updateOrderStatusAction, updateOrderNotesAction } from "@/app/(admin)/admin/actions";
import { formatMoney } from "@/lib/format";
import { OrderStatus } from "@/lib/generated/prisma/enums";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  const shippingAddr = order.shippingAddress as any;
  const billingAddr = (order.billingAddress as any) || shippingAddr;

  const statuses = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">{order.orderNumber}</h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
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
          </div>
          <p className="text-xs text-muted-foreground mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        {/* Status Update Form */}
        <form
          action={async (formData: FormData) => {
            "use server";
            const newStatus = formData.get("status") as OrderStatus;
            if (newStatus) {
              await updateOrderStatusAction(order.id, newStatus);
            }
          }}
          className="flex items-center gap-2 rounded-xl border border-border/80 bg-card p-2 shadow-sm"
        >
          <label className="text-xs font-semibold text-muted-foreground pl-2">Status:</label>
          <select
            name="status"
            defaultValue={order.status}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold outline-none focus:border-primary"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all cursor-pointer"
          >
            Update
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Order Items & Pricing */}
        <div className="space-y-6 md:col-span-2">
          {/* Order Items Table */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span>Order Items ({order.items.length})</span>
            </h2>

            <div className="divide-y divide-border/40">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {item.product?.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.name}
                        className="h-12 w-12 rounded-lg object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted font-bold text-muted-foreground text-xs shrink-0">
                        IMG
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-foreground text-xs">{item.name}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">SKU: {item.sku}</div>
                      {item.product?.slug && (
                        <Link
                          href={`/refurbished/products/${item.product.slug}`}
                          target="_blank"
                          className="text-[10px] text-primary hover:underline"
                        >
                          View Store Listing →
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-foreground text-xs">
                      {formatMoney(item.priceCents * item.quantity)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {item.quantity} × {formatMoney(item.priceCents)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="border-t border-border/60 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{formatMoney(order.shippingCents)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>{formatMoney(order.taxCents)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground border-t border-border/40 pt-2">
                <span>Total</span>
                <span>{formatMoney(order.totalCents)}</span>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-500" />
              <span>Admin Notes</span>
            </h2>

            <form
              action={async (formData: FormData) => {
                "use server";
                const notes = formData.get("notes")?.toString() || "";
                await updateOrderNotesAction(order.id, notes);
              }}
              className="space-y-3"
            >
              <textarea
                name="notes"
                rows={3}
                defaultValue={order.notes || ""}
                placeholder="Add special instructions, tracking numbers, or internal notes..."
                className="w-full rounded-lg border border-input bg-background/50 p-3 text-xs outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 transition-all cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" /> Save Notes
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Customer Details & Addresses */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              <span>Customer Information</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Name</span>
                <span className="font-semibold text-foreground">{order.user?.name || "Guest User"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Email</span>
                <span className="font-mono text-foreground">{order.email}</span>
              </div>
              {order.user?.phone && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Phone</span>
                  <span className="text-foreground">{order.user.phone}</span>
                </div>
              )}
              {order.user?.company && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Company</span>
                  <span className="font-semibold text-primary">{order.user.company}</span>
                </div>
              )}
              {order.user?.id && (
                <div className="pt-2 border-t border-border/40">
                  <Link
                    href={`/admin/customers/${order.user.id}`}
                    className="text-primary hover:underline font-semibold text-[11px]"
                  >
                    View Customer Profile →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-500" />
              <span>Shipping Address</span>
            </h2>

            {shippingAddr ? (
              <div className="text-xs space-y-1 text-foreground">
                <div className="font-semibold">{shippingAddr.fullName}</div>
                <div>{shippingAddr.line1}</div>
                {shippingAddr.line2 && <div>{shippingAddr.line2}</div>}
                <div>
                  {shippingAddr.city}, {shippingAddr.region} {shippingAddr.postalCode}
                </div>
                <div className="font-medium text-muted-foreground uppercase">{shippingAddr.country}</div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No address snapshotted.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
