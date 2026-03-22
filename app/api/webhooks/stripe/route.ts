// ─── Stripe Webhook Handler ──────────────────────────────────
// This is the ONE exception to the "no API routes" rule.
// Stripe requires a webhook endpoint to notify us of subscription events.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { constructWebhookEvent } from "@/modules/subscription/services/stripeService";
import type Stripe from "stripe";

// Map Stripe price IDs back to our plan enum
function planFromPriceId(priceId: string): "FRESHWATER" | "SALTWATER" | "ALL_ACCESS" {
  if (priceId === process.env.STRIPE_FRESHWATER_PRICE_ID) return "FRESHWATER";
  if (priceId === process.env.STRIPE_SALTWATER_PRICE_ID) return "SALTWATER";
  if (priceId === process.env.STRIPE_ALL_ACCESS_PRICE_ID) return "ALL_ACCESS";
  return "ALL_ACCESS";
}

// Map plan to subscription tier
function tierFromPlan(plan: "FRESHWATER" | "SALTWATER" | "ALL_ACCESS") {
  return plan;
}

// Helper to get period dates from subscription items
function getPeriodDates(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  return {
    start: item ? new Date(item.current_period_start * 1000) : new Date(),
    end: item ? new Date(item.current_period_end * 1000) : new Date(),
  };
}

// Helper to extract subscription ID from an invoice
function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent as { subscription_details?: { subscription?: string } } | null;
  return parent?.subscription_details?.subscription ?? null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.warn(`[Stripe Webhook] Event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      // ─── Checkout Completed ──────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (sub) {
          const { stripe } = await import(
            "@/modules/subscription/services/stripeService"
          );
          const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = stripeSub.items.data[0]?.price.id ?? "";
          const plan = planFromPriceId(priceId);
          const period = getPeriodDates(stripeSub);

          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              stripeSubscriptionId: subscriptionId,
              plan,
              status: "ACTIVE",
              currentPeriodStart: period.start,
              currentPeriodEnd: period.end,
              cancelAtPeriodEnd: false,
            },
          });

          await prisma.user.update({
            where: { id: sub.userId },
            data: { subscriptionTier: tierFromPlan(plan) },
          });
        }
        break;
      }

      // ─── Subscription Updated ────────────────────────────
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubId = subscription.id;

        const sub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: stripeSubId },
        });

        if (sub) {
          const priceId = subscription.items.data[0]?.price.id ?? "";
          const plan = planFromPriceId(priceId);
          const period = getPeriodDates(subscription);
          const status = subscription.status === "active" ? "ACTIVE"
            : subscription.status === "past_due" ? "PAST_DUE"
            : subscription.status === "canceled" ? "CANCELED"
            : subscription.status === "trialing" ? "TRIALING"
            : "ACTIVE";

          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              plan,
              status,
              currentPeriodStart: period.start,
              currentPeriodEnd: period.end,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          });

          await prisma.user.update({
            where: { id: sub.userId },
            data: {
              subscriptionTier: status === "ACTIVE" || status === "TRIALING"
                ? tierFromPlan(plan)
                : "FREE",
            },
          });
        }
        break;
      }

      // ─── Subscription Deleted ────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubId = subscription.id;

        const sub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: stripeSubId },
        });

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: "CANCELED",
              cancelAtPeriodEnd: false,
            },
          });

          await prisma.user.update({
            where: { id: sub.userId },
            data: { subscriptionTier: "FREE" },
          });
        }
        break;
      }

      // ─── Invoice Payment Failed ──────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = getSubscriptionIdFromInvoice(invoice);

        if (subId) {
          const sub = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subId },
          });

          if (sub) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { status: "PAST_DUE" },
            });
          }
        }
        break;
      }

      // ─── Invoice Paid ────────────────────────────────────
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = getSubscriptionIdFromInvoice(invoice);

        if (subId) {
          const sub = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subId },
          });

          if (sub) {
            const { stripe } = await import(
              "@/modules/subscription/services/stripeService"
            );
            const stripeSub = await stripe.subscriptions.retrieve(subId);
            const period = getPeriodDates(stripeSub);

            await prisma.subscription.update({
              where: { id: sub.id },
              data: {
                status: "ACTIVE",
                currentPeriodEnd: period.end,
              },
            });

            const priceId = stripeSub.items.data[0]?.price.id ?? "";
            const plan = planFromPriceId(priceId);
            await prisma.user.update({
              where: { id: sub.userId },
              data: { subscriptionTier: tierFromPlan(plan) },
            });
          }
        }
        break;
      }

      default:
        console.warn(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Error processing ${event.type}:`, err);
    // Still return 200 so Stripe doesn't retry
  }

  return NextResponse.json({ received: true });
}
