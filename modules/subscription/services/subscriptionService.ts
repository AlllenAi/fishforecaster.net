import { prisma } from "@/lib/prisma";
import type { SubscriptionPlan, SubscriptionTier, WaterType } from "@prisma/client";
import { ACCESS_PERIOD_MONTHS } from "../types/subscription.schema";

// ─── Activate Subscription ──────────────────────────────
// Called after a successful Stripe payment to give the user access.

export async function activateSubscription(
  userId: string,
  plan: SubscriptionPlan,
  stripePaymentId: string,
  stripeCustomerId: string
) {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + ACCESS_PERIOD_MONTHS);

  // Map the plan to the user's subscription tier
  const tierMap: Record<SubscriptionPlan, SubscriptionTier> = {
    FRESHWATER: "FRESHWATER",
    SALTWATER: "SALTWATER",
    ALL_ACCESS: "ALL_ACCESS",
  };

  // Upsert the subscription (create or replace)
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan,
      status: "ACTIVE",
      stripeCustomerId,
      stripePaymentId,
      currentPeriodStart: now,
      currentPeriodEnd: endDate,
    },
    update: {
      plan,
      status: "ACTIVE",
      stripeCustomerId,
      stripePaymentId,
      currentPeriodStart: now,
      currentPeriodEnd: endDate,
    },
  });

  // Update the user's tier so it shows up in their session
  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionTier: tierMap[plan] },
  });
}

// ─── Check & Expire Subscription ────────────────────────
// Checks if a user's subscription has expired and reverts them to FREE.
// Returns the user's current effective tier.

export async function checkAndExpireSubscription(
  userId: string
): Promise<SubscriptionTier> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) return "FREE";

  // If still active but past the end date, expire it
  if (
    subscription.status === "ACTIVE" &&
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd < new Date()
  ) {
    await prisma.subscription.update({
      where: { userId },
      data: { status: "EXPIRED" },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: "FREE" },
    });

    return "FREE";
  }

  if (subscription.status !== "ACTIVE") return "FREE";

  // Map plan to tier
  const tierMap: Record<SubscriptionPlan, SubscriptionTier> = {
    FRESHWATER: "FRESHWATER",
    SALTWATER: "SALTWATER",
    ALL_ACCESS: "ALL_ACCESS",
  };

  return tierMap[subscription.plan];
}

// ─── Tier Access Check ──────────────────────────────────
// Returns whether a given tier allows access to a water type.

export function tierAllowsWaterType(
  tier: SubscriptionTier,
  waterType: WaterType
): boolean {
  if (tier === "ALL_ACCESS") return true;
  if (tier === "FRESHWATER" && waterType === "FRESH") return true;
  if (tier === "SALTWATER" && waterType === "SALT") return true;
  return false;
}
