import { Client, Environment } from "square";

// Initialize Square client
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox,
});

export const paymentsApi = squareClient.paymentsApi;
export const customersApi = squareClient.customersApi;
export const ordersApi = squareClient.ordersApi;

// Create a payment
export async function createPayment({
  sourceId,
  amount,
  currency = "USD",
  customerId,
  note,
  referenceId,
}: {
  sourceId: string;
  amount: number;
  currency?: string;
  customerId?: string;
  note?: string;
  referenceId?: string;
}) {
  try {
    const { result } = await paymentsApi.createPayment({
      sourceId,
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)), // Convert to cents
        currency,
      },
      idempotencyKey: crypto.randomUUID(),
      locationId: process.env.SQUARE_LOCATION_ID!,
      customerId,
      note,
      referenceId,
    });

    return {
      success: true,
      payment: result.payment,
      paymentId: result.payment?.id,
    };
  } catch (error: any) {
    console.error("Square payment error:", error);
    return {
      success: false,
      error: error.errors?.[0]?.detail || "Payment failed",
    };
  }
}

// Get payment details
export async function getPayment(paymentId: string) {
  try {
    const { result } = await paymentsApi.getPayment(paymentId);
    return result.payment;
  } catch (error) {
    console.error("Failed to get payment:", error);
    return null;
  }
}

// Refund a payment
export async function refundPayment({
  paymentId,
  amount,
  reason,
}: {
  paymentId: string;
  amount?: number;
  reason?: string;
}) {
  try {
    const payment = await getPayment(paymentId);
    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    const refundAmount = amount
      ? BigInt(Math.round(amount * 100))
      : payment.amountMoney?.amount;

    const { result } = await squareClient.refundsApi.refundPayment({
      idempotencyKey: crypto.randomUUID(),
      paymentId,
      amountMoney: {
        amount: refundAmount,
        currency: payment.amountMoney?.currency || "USD",
      },
      reason,
    });

    return {
      success: true,
      refund: result.refund,
    };
  } catch (error: any) {
    console.error("Square refund error:", error);
    return {
      success: false,
      error: error.errors?.[0]?.detail || "Refund failed",
    };
  }
}

// Create or get customer
export async function createOrGetCustomer({
  email,
  name,
  phone,
}: {
  email: string;
  name: string;
  phone?: string;
}) {
  try {
    // Search for existing customer
    const { result: searchResult } = await customersApi.searchCustomers({
      query: {
        filter: {
          emailAddress: { exact: email },
        },
      },
    });

    if (searchResult.customers && searchResult.customers.length > 0) {
      return searchResult.customers[0];
    }

    // Create new customer
    const nameParts = name.split(" ");
    const { result: createResult } = await customersApi.createCustomer({
      idempotencyKey: crypto.randomUUID(),
      emailAddress: email,
      givenName: nameParts[0],
      familyName: nameParts.slice(1).join(" ") || undefined,
      phoneNumber: phone,
    });

    return createResult.customer;
  } catch (error) {
    console.error("Failed to create/get customer:", error);
    return null;
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  signature: string,
  body: string,
  signatureKey: string,
  url: string
): boolean {
  const crypto = require("crypto");

  const hmac = crypto.createHmac("sha256", signatureKey);
  hmac.update(url + body);
  const expectedSignature = hmac.digest("base64");

  return signature === expectedSignature;
}
