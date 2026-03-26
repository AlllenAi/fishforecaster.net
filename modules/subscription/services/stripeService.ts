// ─── Stripe Service ─────────────────────────────────────────
// Thin wrappers around the Stripe API. Uses the shared client
// from lib/stripe.ts (single instance, no duplication).

import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export { stripe };

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
