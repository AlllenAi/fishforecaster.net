import Stripe from "stripe";

// ─── Stripe Client ───────────────────────────────────────────
// Single Stripe instance reused across all server-side calls.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export { stripe };

// ─── Price ID Resolver ───────────────────────────────────────
// Maps our plan enum to the Stripe price ID from env vars.

export function getPriceId(plan: "FRESHWATER" | "SALTWATER" | "ALL_ACCESS"): string {
  const map: Record<string, string | undefined> = {
    FRESHWATER: process.env.STRIPE_FRESHWATER_PRICE_ID,
    SALTWATER: process.env.STRIPE_SALTWATER_PRICE_ID,
    ALL_ACCESS: process.env.STRIPE_ALL_ACCESS_PRICE_ID,
  };

  const priceId = map[plan];
  if (!priceId) {
    throw new Error(`Missing Stripe price ID for plan: ${plan}`);
  }
  return priceId;
}

// ─── Create Customer ─────────────────────────────────────────

export async function createCustomer(
  email: string,
  name: string | undefined,
  userId: string
): Promise<Stripe.Customer> {
  return stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });
}

// ─── Create Checkout Session ─────────────────────────────────

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: { customerId },
    },
  });
}

// ─── Create Billing Portal Session ───────────────────────────

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// ─── Get Subscription ────────────────────────────────────────

export async function getStripeSubscription(
  stripeSubscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(stripeSubscriptionId);
}

// ─── Cancel Subscription ─────────────────────────────────────

export async function cancelSubscription(
  stripeSubscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
}

// ─── Construct Webhook Event ─────────────────────────────────

export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
