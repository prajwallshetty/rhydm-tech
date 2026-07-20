"use server";

import { db } from "@/lib/db";
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
      // Silently skipping would let someone order a delisted product, so this
      // fails loudly instead.
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
