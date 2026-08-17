import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { OrderStatus, PublishStatus } from "@/lib/generated/prisma/enums";
import { calculateTotals } from "@/lib/store/totals";
import { capturePayPalOrder } from "@/lib/services/paypal";
import { addressSchema } from "@/lib/validation/checkout";

const captureOrderSchema = z.object({
  orderID: z.string().min(1),
  checkoutDetails: z.object({
    email: z.email(),
    phone: z.string().trim().optional(),
    company: z.string().trim().optional(),
    shipping: addressSchema,
    delivery: z.enum(["standard", "express"]),
    notes: z.string().trim().optional(),
    lines: z.array(
      z.object({
        slug: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
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
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = captureOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout or order details payload." },
        { status: 400 }
      );
    }

    const { orderID, checkoutDetails } = parsed.data;
    const { email, phone, company, shipping, delivery, notes, lines } = checkoutDetails;

    // 1. Pre-capture inventory validation to avoid capturing funds when stock is gone
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

    const items: Array<{ productId: string; name: string; sku: string; priceCents: number; quantity: number }> = [];
    for (const line of lines) {
      const product = products.find((p) => p.slug === line.slug);
      
      if (!product) {
        return NextResponse.json(
          { error: "An item in your cart is no longer available. Please review your cart." },
          { status: 400 }
        );
      }

      if (product.stock < line.quantity) {
        return NextResponse.json(
          { error: `Overselling prevented: Only ${product.stock} units of ${product.name} are available.` },
          { status: 400 }
        );
      }

      items.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        priceCents: product.priceCents,
        quantity: line.quantity,
      });
    }

    // 2. Call PayPal to Capture funds
    const captureResult = await capturePayPalOrder(orderID);

    if (captureResult.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `PayPal payment capture failed with status: ${captureResult.status}` },
        { status: 400 }
      );
    }

    // Extract PayPal details
    const captureObj = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    const captureID = captureObj?.id;
    const referenceOrderNumber = captureResult.purchase_units?.[0]?.reference_id;
    
    if (!captureID) {
      return NextResponse.json(
        { error: "Failed to extract transaction capture ID from PayPal response." },
        { status: 500 }
      );
    }

    const payerEmail = captureResult.payment_source?.paypal?.email_address || null;
    const givenName = captureResult.payment_source?.paypal?.name?.given_name || "";
    const surname = captureResult.payment_source?.paypal?.name?.surname || "";
    const payerName = `${givenName} ${surname}`.trim() || null;

    // Resolve user account context
    const session = await getSession();
    let userId = session?.id;

    if (!userId) {
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    // Compute totals
    const subtotalCents = items.reduce(
      (total, item) => total + item.priceCents * item.quantity,
      0
    );
    const totals = calculateTotals({ subtotalCents, delivery });

    // 3. Database transaction: create Order, create Payment, reduce inventory, and log StockMovement
    const orderNumber = referenceOrderNumber && referenceOrderNumber !== "RH-TEMP"
      ? referenceOrderNumber
      : `RH-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const order = await db.$transaction(async (tx) => {
      // Re-verify inventory inside the transaction for locking safety (prevent overselling)
      for (const item of items) {
        const prod = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true },
        });

        if (!prod || prod.stock < item.quantity) {
          throw new Error(`Inventory depleted for ${item.name} during capture process.`);
        }
      }

      // Trade-ins are valued by hand after inspection, so they never reduce
      // what is charged. Device details riding along on a legacy cart line are
      // still recorded as an exchange request for the team to follow up on.
      let exchangeRequestId: string | null = null;
      const exchangeCreditCents = 0;
      const firstLineWithTradeIn = lines.find((l) => l.tradeIn);

      if (firstLineWithTradeIn?.tradeIn) {
        const ti = firstLineWithTradeIn.tradeIn;
        const matchedProduct = products.find((p) => p.slug === firstLineWithTradeIn.slug);
        const referenceNumber = `EXCH-${Math.floor(100000 + Math.random() * 900000)}`;
        
        const exchangeRequest = await tx.exchangeRequest.create({
          data: {
            referenceNumber,
            userId: userId || null,
            productId: matchedProduct?.id || null,
            deviceType: ti.deviceType,
            brand: ti.brand,
            model: ti.model,
            customModel: ti.customModel,
            configRam: ti.configRam,
            configStorage: ti.configStorage,
            configCpu: ti.configCpu,
            configGpu: ti.configGpu || null,
            configGeneration: ti.configGeneration || null,
            serialNumber: ti.serialNumber || null,
            serviceTag: ti.serviceTag || null,
            purchaseYear: ti.purchaseYear || null,
            condition: ti.condition,
            checklist: ti.checklist,
            images: ti.images,
            description: ti.description || null,
            contactName: shipping.fullName,
            contactEmail: email,
            contactPhone: phone || null,
            // No automatic valuation — an admin prices this by hand.
            estimatedValueCents: 0,
            status: "PENDING",
          },
        });

        await tx.exchangeActivity.create({
          data: {
            exchangeRequestId: exchangeRequest.id,
            userId: userId || null,
            action: "REQUEST_CREATED",
            toStatus: "PENDING",
            details: "Exchange request submitted via checkout.",
          },
        });

        exchangeRequestId = exchangeRequest.id;

        // Mock notify admin
        const { notifyAdminNewRequest } = await import("@/lib/services/notifications");
        await notifyAdminNewRequest(referenceNumber, `${ti.brand} ${ti.model}`);
      }

      const finalTotalCents = totals.totalCents;

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: userId || null,
          email,
          status: OrderStatus.CONFIRMED, // Marked as Paid / Confirmed
          subtotalCents: totals.subtotalCents,
          shippingCents: totals.shippingCents,
          taxCents: totals.taxCents,
          totalCents: finalTotalCents,
          exchangeCreditCents,
          exchangeRequestId,
          shippingAddress: { ...shipping, phone: phone || null, company: company || null },
          notes: notes || null,
          paymentMethod: "PayPal",
          paymentStatus: "COMPLETED",
          paypalOrderId: orderID,
          paypalTransactionId: captureID,
          paidAt: new Date(),
          currency: "EUR",
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              name: item.name,
              sku: item.sku,
              priceCents: item.priceCents,
              quantity: item.quantity,
            })),
          },
        },
      });

      // Create Payment log
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          paypalOrderId: orderID,
          paypalCaptureId: captureID,
          paypalTransactionId: captureID,
          payerEmail,
          payerName,
          amountCents: finalTotalCents,
          currency: "EUR",
          paymentMethod: "PayPal",
          status: "COMPLETED",
        },
      });

      // Reduce stock and create movements
      for (const item of items) {
        const prod = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });

        const newStock = (prod?.stock ?? 0) - item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            delta: -item.quantity,
            balance: newStock,
            reason: "Customer Purchase",
            note: `Order ${orderNumber}`,
          },
        });
      }

      return newOrder;
    });

    // Update user contact info if empty
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
        // Ignore user update fail
      }
    }

    // Generate secure invoice download token using the PayPal client secret as salt
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "default-secret";
    const hmacToken = crypto
      .createHmac("sha256", clientSecret)
      .update(orderNumber)
      .digest("hex");

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      totalCents: order.totalCents,
      transactionId: captureID,
      token: hmacToken,
    });
  } catch (error: any) {
    console.error("PayPal Capture Order Endpoint Failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to capture and record the payment transaction." },
      { status: 500 }
    );
  }
}
