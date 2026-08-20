import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { Role } from "@/lib/generated/prisma/enums";
import { formatPriceExact } from "@/lib/format";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // Retrieve order from database
    const order = await db.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // 1. Authorization checks
    let authorized = false;

    // Check secure HMAC token (e.g. for guest checkout downloads from success page)
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "default-secret";
    const expectedToken = crypto
      .createHmac("sha256", clientSecret)
      .update(orderNumber)
      .digest("hex");

    if (token === expectedToken) {
      authorized = true;
    }

    // Check active session (customer ownership or administrator role)
    if (!authorized) {
      const session = await getSession();
      if (session) {
        if (session.role === Role.ADMIN || session.role === Role.SUPER_ADMIN) {
          authorized = true;
        } else if (order.userId === session.id || order.email === session.email) {
          authorized = true;
        }
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: "You are not authorized to view this invoice." },
        { status: 403 }
      );
    }

    // Parse addresses
    const shipping = order.shippingAddress as any;
    const billing = (order.billingAddress as any) || shipping;

    // Generate beautifully styled HTML invoice template
    const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${order.orderNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #f8fafc;
      margin: 0;
      padding: 40px 20px;
      line-height: 1.5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .logo-container h1 {
      margin: 0;
      color: #2e6f40;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .logo-container p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-meta h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
    }
    .invoice-meta p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #64748b;
    }
    .address-grid {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }
    .address-block h3 {
      margin: 0 0 10px 0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 700;
    }
    .address-block p {
      margin: 0;
      font-size: 14px;
      color: #334155;
      line-height: 1.6;
    }
    .address-block .name {
      font-weight: 700;
      color: #0f172a;
    }
    .table-container {
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      background-color: #f8fafc;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
      color: #64748b;
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
    }
    td {
      padding: 16px;
      font-size: 14px;
      color: #334155;
      border-bottom: 1px solid #f1f5f9;
    }
    .product-sku {
      font-family: monospace;
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
    .totals-grid {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    .totals-table {
      width: 300px;
    }
    .totals-table tr td {
      padding: 8px 16px;
      border: none;
    }
    .totals-table tr.total-row td {
      border-top: 2px solid #f1f5f9;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      padding-top: 16px;
    }
    .payment-badge {
      display: inline-flex;
      align-items: center;
      background-color: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      border-radius: 9999px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 30px;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      background-color: #059669;
      border-radius: 50%;
      margin-right: 8px;
    }
    .actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 40px;
      border-top: 1px solid #e2e8f0;
      padding-top: 24px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    .btn-primary {
      background-color: #2e6f40;
      color: #ffffff;
    }
    .btn-primary:hover {
      background-color: #255833;
    }
    .btn-outline {
      background-color: #ffffff;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .btn-outline:hover {
      background-color: #f8fafc;
      border-color: #94a3b8;
    }
    .footer-note {
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      margin-top: 40px;
    }
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .container {
        border: none;
        box-shadow: none;
        padding: 0;
      }
      .actions-bar {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-container">
        <h1>Rhydm Technologies</h1>
        <p>Premium Refurbished Business Hardware</p>
      </div>
      <div class="invoice-meta">
        <h2>INVOICE</h2>
        <p><strong>Order:</strong> ${order.orderNumber}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>

    <div class="payment-badge">
      <span class="badge-dot"></span>
      Paid via ${order.paymentMethod || "PayPal"} (Status: ${order.paymentStatus || "COMPLETED"})
    </div>

    <div class="address-grid">
      <div class="address-block">
        <h3>Vendor</h3>
        <p class="name">Rhydm Technologies GmbH</p>
        <p>Humboldtstraße 120</p>
        <p>22083 Hamburg, Germany</p>
        <p>Email: support@rhydm.tech</p>
        <p>VAT ID: DE 999 888 777</p>
      </div>
      <div class="address-block">
        <h3>Bill To / Ship To</h3>
        <p class="name">${shipping.fullName}</p>
        <p>${shipping.line1}</p>
        ${shipping.line2 ? `<p>${shipping.line2}</p>` : ""}
        <p>${shipping.city}, ${shipping.region} ${shipping.postalCode}</p>
        <p>${shipping.country}</p>
        ${shipping.phone ? `<p>Phone: ${shipping.phone}</p>` : ""}
        <p>Email: ${order.email}</p>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Product Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (item) => `
          <tr>
            <td>
              <div style="font-weight: 700;">${item.name}</div>
              <div class="product-sku">SKU: ${item.sku}</div>
            </td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${formatPriceExact(item.priceCents)}</td>
            <td style="text-align: right; font-weight: 600;">${formatPriceExact(
              item.priceCents * item.quantity
            )}</td>
          </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="totals-grid">
      <table class="totals-table">
        <tr>
          <td style="color: #64748b;">Subtotal:</td>
          <td style="text-align: right; font-weight: 600;">${formatPriceExact(order.subtotalCents)}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Shipping (${order.shippingCents === 0 ? "Free" : "Flat Rate"}):</td>
          <td style="text-align: right; font-weight: 600;">${formatPriceExact(order.shippingCents)}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Estimated Tax:</td>
          <td style="text-align: right; font-weight: 600;">${formatPriceExact(order.taxCents)}</td>
        </tr>
        <tr class="total-row">
          <td>Total Paid:</td>
          <td style="text-align: right;">${formatPriceExact(order.totalCents)}</td>
        </tr>
      </table>
    </div>

    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 13px; color: #64748b;">
      <p><strong>PayPal Transaction Details:</strong></p>
      <p style="margin: 4px 0;"><strong>PayPal Order ID:</strong> <span style="font-family: monospace;">${order.paypalOrderId || "N/A"}</span></p>
      <p style="margin: 4px 0;"><strong>Transaction ID:</strong> <span style="font-family: monospace;">${order.paypalTransactionId || "N/A"}</span></p>
      ${order.paidAt ? `<p style="margin: 4px 0;"><strong>Paid Date:</strong> ${new Date(order.paidAt).toLocaleString("en-US")}</p>` : ""}
    </div>

    <div class="actions-bar">
      <button onclick="window.print()" class="btn btn-outline">
        Print Invoice
      </button>
      <a href="/refurbished/shop" class="btn btn-primary">
        Continue Shopping
      </a>
    </div>

    <div class="footer-note">
      <p>Thank you for choosing Rhydm Technologies. For questions or support, contact support@rhydm.tech</p>
    </div>
  </div>
</body>
</html>
    `;

    return new Response(invoiceHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.html"`,
      },
    });
  } catch (error: any) {
    console.error("Invoice Generation API Failed:", error);
    return NextResponse.json(
      { error: "Failed to load and generate invoice." },
      { status: 500 }
    );
  }
}
