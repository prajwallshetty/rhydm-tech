import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { PublishStatus } from "@/lib/generated/prisma/enums";
import { calculateTotals } from "@/lib/store/totals";
import { createPayPalOrder } from "@/lib/services/paypal";

const createOrderSchema = z.object({
  delivery: z.enum(["standard", "express"]),
  lines: z.array(
    z.object({
      slug: z.string().min(1),
      quantity: z.number().int().min(1).max(99),
      variantId: z.string().optional().nullable(),
      tradeIn: z.object({
        deviceType: z.string(),
        brand: z.string(),
        model: z.string(),
        customModel: z.boolean(),
        configRam: z.string(),
        configStorage: z.string(),
        configCpu: z.string(),
        configGpu: z.string().optional().nullable(),
        configGeneration: z.string().optional().nullable(),
        serialNumber: z.string().optional().nullable(),
        serviceTag: z.string().optional().nullable(),
        purchaseYear: z.number(),
        condition: z.string(),
        checklist: z.any(),
        images: z.array(z.string()),
        description: z.string().optional().nullable(),
        estimatedValueCents: z.number(),
      }).optional().nullable(),
    })
  ).min(1),
});

function generateOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RH-${stamp}-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid cart payload." },
        { status: 400 }
      );
    }

    const { delivery, lines } = parsed.data;

    // Fetch the products from the database (never trust frontend prices)
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
      return NextResponse.json(
        { error: "None of the items in your cart are available." },
        { status: 400 }
      );
    }

    const productIds = products.map((p) => p.id);
    const variants = await db.productVariant.findMany({
      where: {
        productId: { in: productIds },
        status: PublishStatus.PUBLISHED,
      },
      include: {
        optionValues: {
          include: {
            optionValue: {
              include: {
                option: true,
              },
            },
          },
        },
      },
    });

    const mappedVariants = variants.map((v) => {
      const selectedOptions: Record<string, string> = {};
      v.optionValues.forEach((ov) => {
        selectedOptions[ov.optionValue.option.name] = ov.optionValue.value;
      });
      return {
        ...v,
        selectedOptions,
      };
    });

    // Validate quantities and stock levels
    const items: Array<{ productId: string; priceCents: number; quantity: number }> = [];
    for (const line of lines) {
      const product = products.find((p) => p.slug === line.slug);
      
      if (!product) {
        return NextResponse.json(
          { error: "An item in your cart is no longer available. Please review your cart." },
          { status: 400 }
        );
      }

      let priceCents = product.priceCents;
      let stock = product.stock;
      let name = product.name;

      if (line.variantId) {
        const variant = mappedVariants.find((v) => v.id === line.variantId && v.productId === product.id);
        if (variant) {
          priceCents = variant.priceCents ?? priceCents;
          stock = variant.stock;
          const optionsStr = Object.entries(variant.selectedOptions)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
          if (optionsStr) {
            name = `${product.name} (${optionsStr})`;
          }
        }
      }

      if (stock < line.quantity) {
        return NextResponse.json(
          { error: `Overselling prevented: Only ${stock} units of ${name} are available.` },
          { status: 400 }
        );
      }

      items.push({
        productId: product.id,
        priceCents,
        quantity: line.quantity,
      });
    }

    // Compute totals
    const subtotalCents = items.reduce(
      (total, item) => total + item.priceCents * item.quantity,
      0
    );
    const totals = calculateTotals({ subtotalCents, delivery });

    // Generate a unique order number that will be matched on capture
    const orderNumber = generateOrderNumber();

    // Trade-ins never discount an order: they are valued manually by the Rhydm
    // team after the device is inspected, so the customer is charged in full.
    const amountEUR = (totals.totalCents / 100).toFixed(2);
    const orderID = await createPayPalOrder(amountEUR, orderNumber);

    return NextResponse.json({ orderID });
  } catch (error: any) {
    console.error("PayPal Create Order Endpoint Failed:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong while initiating payment." },
      { status: 500 }
    );
  }
}
