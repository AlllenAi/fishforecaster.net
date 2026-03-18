import { z } from "zod";

// ─── Plan Enum ───────────────────────────────────────────────
export const subscriptionPlanSchema = z.enum([
  "FRESHWATER",
  "SALTWATER",
  "ALL_ACCESS",
]);

export type Plan = z.infer<typeof subscriptionPlanSchema>;

// ─── Checkout Input ──────────────────────────────────────────
export const createCheckoutSchema = z.object({
  plan: subscriptionPlanSchema,
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

// ─── Subscription Status Response ────────────────────────────
export interface SubscriptionInfo {
  plan: Plan | null;
  status: "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING" | null;
  tier: "FREE" | "FRESHWATER" | "SALTWATER" | "ALL_ACCESS";
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
}

// ─── Plan Config ─────────────────────────────────────────────
// Maps plan names to Stripe price IDs and display info
export const PLAN_CONFIG = {
  FRESHWATER: {
    name: "Freshwater",
    price: "$9",
    period: "/month",
    description: "All freshwater zones",
    envKey: "STRIPE_FRESHWATER_PRICE_ID",
    features: [
      "5 freshwater zone forecasts",
      "Daily bite scores",
      "Bite window predictions",
      "Species-specific scores",
      "Captain's Call recommendations",
      "Map dashboard",
    ],
  },
  SALTWATER: {
    name: "Saltwater",
    price: "$9",
    period: "/month",
    description: "All saltwater zones",
    envKey: "STRIPE_SALTWATER_PRICE_ID",
    features: [
      "8 saltwater zone forecasts",
      "Daily bite scores",
      "Bite window predictions",
      "Species-specific scores",
      "Captain's Call recommendations",
      "Map dashboard",
    ],
  },
  ALL_ACCESS: {
    name: "All Access",
    price: "$12",
    period: "/month",
    description: "Everything, all zones",
    envKey: "STRIPE_ALL_ACCESS_PRICE_ID",
    badge: "Best Value",
    features: [
      "All 13 zone forecasts",
      "Saltwater + freshwater",
      "Daily bite scores",
      "Bite window predictions",
      "Species-specific scores",
      "Captain's Call recommendations",
      "Map dashboard",
      "Priority support",
    ],
  },
} as const;

// ─── Tier Access Logic ───────────────────────────────────────
// Determines if a subscription tier can access a given water type
export function checkTierAccess(
  tier: "FREE" | "FRESHWATER" | "SALTWATER" | "ALL_ACCESS",
  waterType: "SALT" | "FRESH"
): boolean {
  if (tier === "ALL_ACCESS") return true;
  if (tier === "FRESHWATER" && waterType === "FRESH") return true;
  if (tier === "SALTWATER" && waterType === "SALT") return true;
  return false;
}
