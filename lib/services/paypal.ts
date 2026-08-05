import crypto from "node:crypto";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENVIRONMENT = process.env.PAYPAL_ENVIRONMENT || "live";

const PAYPAL_BASE_URL = PAYPAL_ENVIRONMENT === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

let cachedToken: string | null = null;
let tokenExpiry: number | null = null; // unix timestamp in ms

/**
 * Retrieves the PayPal OAuth2 Access Token.
 * Implements in-memory caching to avoid redundant roundtrips.
 */
export async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET) are not configured.");
  }

  // Check cache (with a 60-second safety buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to retrieve PayPal Access Token: ${errorData.error_description || response.statusText}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
  
  return cachedToken!;
}

/**
 * Creates a PayPal Order.
 * 
 * @param amountEUR The total order amount in EUR, formatted as a string (e.g. "199.99").
 * @param orderNumber The unique Rhydm Tech order number.
 * @returns The PayPal Order ID.
 */
export async function createPayPalOrder(amountEUR: string, orderNumber: string): Promise<string> {
  const token = await getPayPalAccessToken();
  const requestId = crypto.randomUUID();

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": requestId,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderNumber,
          amount: {
            currency_code: "EUR",
            value: amountEUR,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("PayPal Create Order Error details:", errorData);
    throw new Error(`PayPal Order Creation Failed: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Captures a PayPal Order.
 * 
 * @param paypalOrderId The PayPal Order ID authorized by the customer.
 * @returns The PayPal capture API response.
 */
export async function capturePayPalOrder(paypalOrderId: string): Promise<any> {
  const token = await getPayPalAccessToken();
  const requestId = crypto.randomUUID();

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": requestId,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("PayPal Capture Order Error details:", errorData);
    throw new Error(`PayPal Order Capture Failed: ${errorData.message || response.statusText}`);
  }

  return response.json();
}
