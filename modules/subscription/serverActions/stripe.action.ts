"use server";

import { prisma } from "@/lib/prisma";
import { withAccess } from "@/lib/middleware/withAccess";
import type { AuthContext } from "@/lib/auth/types";
import { createCheckoutSchema } from "../types/subscription.schema";
import {
  createCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  getPriceId,
} from "../services/stripeService";

// ─── Create Checkout Session ─────────────────────────────────
// Validates the user, creates a Stripe customer if needed,
// and returns a Stripe Checkout URL for the selected plan.

export const createCheckout = withAccess(
  async (user: AuthContext, input: { plan: string }): Promise<{ url: string }> => {
    const validated = createCheckoutSchema.parse(input);
    const priceId = getPriceId(validated.plan);

    // Check if user already has a subscription record with a Stripe customer ID
    let subscription = await prisma.subscription.findUnique({
      where: { userId: user.userId },
    });

    let customerId = subscription?.stripeCustomerId;

    // Create Stripe customer if we don't have one
    if (!customerId) {
      const customer = await createCustomer(user.email, user.name, user.userId);
      customerId = customer.id;

      // Upsert the subscription record to store the customer ID
      if (subscription) {
        await prisma.subscription.update({
          where: { userId: user.userId },
          data: { stripeCustomerId: customerId },
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId: user.userId,
            stripeCustomerId: customerId,
            plan: validated.plan,
            status: "ACTIVE",
          },
        });
      }
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const session = await createCheckoutSession(
      customerId,
      priceId,
      `${baseUrl}/dashboard?checkout=success`,
      `${baseUrl}/pricing?checkout=canceled`
    );

    if (!session.url) {
      throw new Error("Failed to create checkout session");
    }

    return { url: session.url };
  }
);

// ─── Create Portal Session ───────────────────────────────────
// Returns a Stripe Billing Portal URL so the user can manage
// their subscription (change plan, update payment, cancel).

export const createPortalSession = withAccess(
  async (user: AuthContext): Promise<{ url: string }> => {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.userId },
    });

    if (!subscription?.stripeCustomerId) {
      throw new Error("No active subscription found");
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const session = await createBillingPortalSession(
      subscription.stripeCustomerId,
      `${baseUrl}/dashboard/account`
    );

    return { url: session.url };
  }
);
