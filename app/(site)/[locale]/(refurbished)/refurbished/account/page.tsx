import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AccountClient, SerializedOrder, SerializedAddress } from "./account-client";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const locale = await getLocale();
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const dbOrders = await db.order.findMany({
    where: {
      OR: [
        { userId: user.id },
        { email: user.email },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: {
              slug: true,
              warrantyMonths: true,
              category: { select: { slug: true } },
              images: {
                orderBy: { position: "asc" },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
  });

  const dbAddresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });

  const initialOrders: SerializedOrder[] = dbOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    createdAtStr: new Date(o.createdAt).toLocaleDateString(locale, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    status: o.status,
    totalCents: o.totalCents,
    paymentStatus: o.paymentStatus,
    paypalTransactionId: o.paypalTransactionId,
    paymentMethod: o.paymentMethod,
    currency: o.currency,
    paidAt: o.paidAt ? o.paidAt.toISOString() : null,
    items: o.items.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      priceCents: item.priceCents,
      quantity: item.quantity,
      slug: item.product?.slug || "",
      categorySlug: item.product?.category?.slug || "laptops",
      // Real warranty term from the product; null when the product was
      // deleted — the UI must not invent a warranty claim in that case.
      warrantyMonths: item.product?.warrantyMonths ?? null,
      imageUrl: item.product?.images?.[0]?.url || null,
    })),
  }));

  const initialAddresses: SerializedAddress[] = dbAddresses.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    region: a.region,
    postalCode: a.postalCode,
    country: a.country,
    isDefault: a.isDefault,
  }));

  const dbExchanges = await db.exchangeRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      activities: {
        orderBy: { createdAt: "asc" },
      },
      product: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  const initialExchanges = dbExchanges.map((ex) => ({
    id: ex.id,
    referenceNumber: ex.referenceNumber,
    createdAtStr: new Date(ex.createdAt).toLocaleDateString(locale, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    status: ex.status,
    deviceType: ex.deviceType,
    brand: ex.brand,
    model: ex.model,
    customModel: ex.customModel,
    condition: ex.condition,
    // Deliberately omitted: `estimatedValueCents` (legacy automatic figure)
    // and `notes` (internal admin notes) never leave the server.
    finalValueCents: ex.finalValueCents,
    offerSentAt: ex.offerSentAt ? new Date(ex.offerSentAt).toLocaleDateString(locale) : null,
    images: ex.images,
    description: ex.description,
    serialNumber: ex.serialNumber,
    serviceTag: ex.serviceTag,
    purchaseYear: ex.purchaseYear,
    pickupOption: ex.pickupOption,
    pickupSchedule: ex.pickupSchedule,
    checklist: ex.checklist,
    linkedProduct: ex.product ? { name: ex.product.name, slug: ex.product.slug } : null,
    activities: ex.activities.map((act) => ({
      id: act.id,
      createdAtStr: new Date(act.createdAt).toLocaleString(locale, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      action: act.action,
      fromStatus: act.fromStatus,
      toStatus: act.toStatus,
      details: act.details,
    })),
  }));

  return (
    <AccountClient
      user={{
        ...user,
        role: String(user.role),
      }}
      initialOrders={initialOrders}
      initialAddresses={initialAddresses}
      initialExchanges={initialExchanges}
    />
  );
}
