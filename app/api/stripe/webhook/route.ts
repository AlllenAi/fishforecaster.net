// ─── Stripe Webhook Handler ─────────────────────────────
//
// This is the ONE exception to the "no API routes" rule.
// Stripe sends POST requests with a raw body that needs signature
// verification, which Server Actions can't handle.

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { activateSubscription } from "@/modules/subscription/services/subscriptionService";
import type { SubscriptionPlan } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as SubscriptionPlan | undefined;
    const stripeCustomerId =
      typeof session.customer === "string" ? session.customer : "";
    const stripePaymentId =
      typeof session.payment_intent === "string" ? session.payment_intent : "";

    if (!userId || !plan) {
      console.error("Webhook missing userId or plan in metadata");
      return NextResponse.json(
        { error: "Missing metadata" },
        { status: 400 }
      );
    }

    try {
      await activateSubscription(userId, plan, stripePaymentId, stripeCustomerId);
      console.log(`Subscription activated: ${plan} for user ${userId}`);
    } catch (err) {
      console.error("Failed to activate subscription:", err);
      return NextResponse.json(
        { error: "Activation failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
