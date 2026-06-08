// ─── Stripe Webhook Handler ──────────────────────────────────
// This is the ONE exception to the "no API routes" rule.
// Stripe sends POST requests with a raw body that needs signature
// verification, which Server Actions can't handle.
//
// We use ONE-TIME PAYMENTS (not recurring subscriptions).
// The main event we care about is checkout.session.completed.

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { activateSubscription } from "@/modules/subscription/services/subscriptionService";
import { sendPaymentReceipt } from "@/modules/email/serverActions/email.action";
import type Stripe from "stripe";
import type { SubscriptionPlan } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe Webhook] Signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      // ─── Checkout Completed (One-Time Payment) ─────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as SubscriptionPlan | undefined;
        const stripeCustomerId =
          typeof session.customer === "string" ? session.customer : "";
        const stripePaymentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : "";

        if (!userId || !plan) {
          console.error("[Stripe Webhook] Missing userId or plan in metadata");
          return NextResponse.json(
            { error: "Missing metadata" },
            { status: 400 }
          );
        }

        await activateSubscription(
          userId,
          plan,
          stripePaymentId,
          stripeCustomerId
        );

        // Send receipt email (fire and forget)
        const amountTotal = session.amount_total
          ? `$${(session.amount_total / 100).toFixed(2)}`
          : "—";
        sendPaymentReceipt(userId, plan, amountTotal, stripePaymentId).catch(
          (err) => console.error("[Stripe Webhook] Failed to send receipt:", err)
        );

        console.log(
          `[Stripe Webhook] Subscription activated: ${plan} for user ${userId}`
        );
        break;
      }

      default:
        console.log(
          `[Stripe Webhook] Unhandled event type: ${event.type}`
        );
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Error processing ${event.type}:`, err);
    // Return 200 to prevent Stripe from retrying indefinitely
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
