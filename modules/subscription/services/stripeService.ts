// ─── Stripe Service ─────────────────────────────────────────
// Thin wrappers around the Stripe API. Uses the shared client
// from lib/stripe.ts (single instance, no duplication).

import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export { stripe };

// ─── Price ID Mapping ───────────────────────────────────
// Maps plan names to Stripe Price IDs from environment variables.

const PRICE_IDS: Record<string, string | undefined> = {
  FRESHWATER: process.env.STRIPE_PRICE_FRESHWATER,
  SALTWATER: process.env.STRIPE_PRICE_SALTWATER,
  ALL_ACCESS: process.env.STRIPE_PRICE_ALL_ACCESS,
};

export function getPriceId(plan: string): string {
  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    throw new Error(`No Stripe price configured for plan: ${plan}`);
  }
  return priceId;
}

// ─── Create Customer ────────────────────────────────────

export async function createCustomer(
  email: string,
  name: string | null | undefined,
  userId: string
): Promise<Stripe.Customer> {
  return stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });
}

// ─── Create Checkout Session ────────────────────────────

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

// ─── Create Billing Portal Session ───────────────────────
// Lets users view their payment history in Stripe's portal.

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
