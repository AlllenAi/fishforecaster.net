"use server";

import { prisma } from "@/lib/prisma";
import { withAccess } from "@/lib/middleware/withAccess";
import type { AuthContext } from "@/lib/auth/types";
import type { SubscriptionInfo } from "../types/subscription.schema";

// ─── Get My Subscription ─────────────────────────────────────
// Returns full subscription details for the current user.

export const getMySubscription = withAccess(
  async (user: AuthContext): Promise<SubscriptionInfo> => {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.userId },
    });

    if (!subscription || subscription.status !== "ACTIVE") {
      return {
        plan: null,
        status: null,
        tier: user.subscriptionTier,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
      };
    }

    return {
      plan: subscription.plan,
      status: subscription.status,
      tier: user.subscriptionTier,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      stripeCustomerId: subscription.stripeCustomerId,
    };
  }
);

// ─── Get Subscription Status ─────────────────────────────────
// Lightweight check used for access gating — returns just the tier.

export const getSubscriptionStatus = withAccess(
  async (user: AuthContext): Promise<{ tier: string }> => {
    return { tier: user.subscriptionTier };
  }
);
