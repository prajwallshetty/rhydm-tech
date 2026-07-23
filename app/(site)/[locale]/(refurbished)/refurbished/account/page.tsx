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

  return (
    <AccountClient
      user={{
        ...user,
        role: String(user.role),
      }}
      initialOrders={initialOrders}
      initialAddresses={initialAddresses}
    />
  );
}
