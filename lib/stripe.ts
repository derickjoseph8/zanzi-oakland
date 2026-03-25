import Stripe from "stripe";

// Initialize Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});

// Create a payment intent
export async function createPaymentIntent({
  amount,
  currency = "usd",
  customerId,
  metadata,
  description,
}: {
  amount: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  description?: string;
}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata,
      description,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      paymentIntent,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error: any) {
    console.error("Stripe payment intent error:", error);
    return {
      success: false,
      error: error.message || "Failed to create payment intent",
    };
  }
}

// Confirm a payment intent
export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      paymentIntent,
      status: paymentIntent.status,
    };
  } catch (error: any) {
    console.error("Failed to confirm payment:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Create a refund
export async function createRefund({
  paymentIntentId,
  amount,
  reason,
}: {
  paymentIntentId: string;
  amount?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason,
    });

    return {
      success: true,
      refund,
    };
  } catch (error: any) {
    console.error("Stripe refund error:", error);
    return {
      success: false,
      error: error.message || "Refund failed",
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
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
    });

    return customer;
  } catch (error) {
    console.error("Failed to create/get Stripe customer:", error);
    return null;
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    return event;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return null;
  }
}

// Get payment details
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error("Failed to get payment intent:", error);
    return null;
  }
}
