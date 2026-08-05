import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID;

  if (!clientId) {
    console.error("PAYPAL_CLIENT_ID is not configured in backend environment.");
    return NextResponse.json(
      { error: "PayPal integration is not configured on the server." },
      { status: 500 }
    );
  }

  return NextResponse.json({ clientId });
}
