"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { withAccess } from "@/lib/middleware/withAccess";
import type { AuthContext } from "@/lib/auth/types";
import {
  checkoutInputSchema,
  PLAN_PRICES,
  PLAN_DISPLAY_NAMES,
  ACCESS_PERIOD_MONTHS,
} from "../types/subscription.schema";
import type { CheckoutInput, SubscriptionStatusResponse } from "../types/subscription.schema";
import { checkAndExpireSubscription } from "../services/subscriptionService";

// ─── Create Checkout Session ────────────────────────────
// Creates a Stripe Checkout session for a one-time payment.
// Returns the checkout URL so the client can redirect.

export const createCheckoutSession = withAccess(
  async (user: AuthContext, input: CheckoutInput): Promise<{ url: string }> => {
    const validated = checkoutInputSchema.parse(input);
    const priceInCents = PLAN_PRICES[validated.plan];
    const planName = PLAN_DISPLAY_NAMES[validated.plan];

    // Check if user already has a Stripe customer ID
    const existingSub = await prisma.subscription.findUnique({
      where: { userId: user.userId },
    });

    let customerId = existingSub?.stripeCustomerId;

    // Create a Stripe customer if they don't have one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.userId },
      });
      customerId = customer.id;
    }

    // Create the checkout session (one-time payment, NOT subscription)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `The Fish Forecaster — ${planName}`,
              description: `${ACCESS_PERIOD_MONTHS} months of ${planName.toLowerCase()} zone forecasts`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.userId,
        plan: validated.plan,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/account?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/account?payment=canceled`,
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session");
    }

    return { url: session.url };
  }
);

// ─── Get Subscription Status ────────────────────────────
// Returns the user's current subscription details.
// Also checks for expiration and updates accordingly.

export const getSubscriptionStatus = withAccess(
  async (user: AuthContext): Promise<SubscriptionStatusResponse | null> => {
    // Check and expire if needed
    await checkAndExpireSubscription(user.userId);

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.userId },
    });

    if (!subscription) return null;

    const now = new Date();
    const endDate = subscription.currentPeriodEnd ?? now;
    const daysRemaining = Math.max(
      0,
      Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.currentPeriodStart?.toISOString() ?? "",
      endDate: endDate.toISOString(),
      isActive: subscription.status === "ACTIVE",
      daysRemaining,
    };
  }
);
