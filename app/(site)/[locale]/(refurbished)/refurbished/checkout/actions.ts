"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { PublishStatus } from "@/lib/generated/prisma/enums";
import { calculateTotals } from "@/lib/store/totals";
import { checkoutSchema } from "@/lib/validation/checkout";

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; totalCents: number }
  | { ok: false; error: string };

function generateOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RH-${stamp}-${random}`;
}

export async function getCheckoutUserDataAction() {
  const session = await getSession();
  if (!session) return null;

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
      addresses: {
        where: { isDefault: true },
        take: 1,
      },
    },
  });

  if (!user) return null;

  const defaultAddr = user.addresses[0];

  return {
    email: user.email,
    phone: user.phone || "",
    company: user.company || "",
    shipping: defaultAddr
      ? {
          fullName: defaultAddr.fullName,
          line1: defaultAddr.line1,
          line2: defaultAddr.line2 || "",
          city: defaultAddr.city,
          region: defaultAddr.region,
          postalCode: defaultAddr.postalCode,
          country: defaultAddr.country || "US",
        }
      : {
          fullName: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          line1: "",
          line2: "",
          city: "",
          region: "",
          postalCode: "",
          country: "US",
        },
  };
}

/**
 * Creates an order.
 *
 * No payment is taken — the order is recorded as PENDING and the UI explains
 * that payment integration is not live yet.
 *
 * Prices, stock and totals are all recomputed here from the database. The
 * client submits only slugs and quantities, so a tampered payload cannot
 * change what an order costs.
 */
export async function placeOrder(values: unknown): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, error: "Please check your details and try again." };
  }

  const { email, phone, company, shipping, delivery, notes, lines } =
    parsed.data;

  try {
    const session = await getSession();
    let userId = session?.id;

    if (!userId) {
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    const products = await db.product.findMany({
      where: {
        slug: { in: lines.map((line) => line.slug) },
        status: PublishStatus.PUBLISHED,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        sku: true,
        priceCents: true,
        stock: true,
      },
    });

    if (products.length === 0) {
      return { ok: false, error: "None of the items in your cart are available." };
    }

    const items = [];
    for (const line of lines) {
      const product = products.find((p) => p.slug === line.slug);
      if (!product) {
        return {
          ok: false,
          error: "An item in your cart is no longer available. Please review your cart.",
        };
      }
      if (product.stock < line.quantity) {
        return {
          ok: false,
          error: `Only ${product.stock} of ${product.name} remain in stock.`,
        };
      }

      items.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        priceCents: product.priceCents,
        quantity: line.quantity,
      });
    }

    const subtotalCents = items.reduce(
      (total, item) => total + item.priceCents * item.quantity,
      0,
    );
    const totals = calculateTotals({ subtotalCents, delivery });

    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: userId || null,
        email,
        status: "PENDING",
        subtotalCents: totals.subtotalCents,
        shippingCents: totals.shippingCents,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
        shippingAddress: { ...shipping, phone: phone || null, company: company || null },
        notes: notes || null,
        items: { create: items },
      },
      select: { orderNumber: true, totalCents: true },
    });

    // Update user phone & company if empty
    if (userId) {
      try {
        await db.user.update({
          where: { id: userId },
          data: {
            ...(phone ? { phone } : {}),
            ...(company ? { company } : {}),
          },
        });
      } catch {
        // Ignore if fail
      }
    }

    return {
      ok: true,
      orderNumber: order.orderNumber,
      totalCents: order.totalCents,
    };
  } catch (error) {
    console.error("placeOrder failed:", error);
    return {
      ok: false,
      error: "Something went wrong placing your order. Please try again.",
    };
  }
}

