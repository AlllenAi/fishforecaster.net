import { z } from "zod";
import type { SubscriptionPlan } from "@prisma/client";

// ─── Zod Schemas ─────────────────────────────────────────

export const subscriptionPlanSchema = z.enum([
  "FRESHWATER",
  "SALTWATER",
  "ALL_ACCESS",
]);

export type Plan = z.infer<typeof subscriptionPlanSchema>;

export const checkoutInputSchema = z.object({
  plan: subscriptionPlanSchema,
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

// Alias used by stripe.action.ts
export const createCheckoutSchema = checkoutInputSchema;
export type CreateCheckoutInput = CheckoutInput;

// ─── Price Constants (in cents) ──────────────────────────

export const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  FRESHWATER: 700,
  SALTWATER: 700,
  ALL_ACCESS: 1200,
};

export const PLAN_DISPLAY_NAMES: Record<SubscriptionPlan, string> = {
  FRESHWATER: "Freshwater",
  SALTWATER: "Saltwater",
  ALL_ACCESS: "All Access",
};

export const PLAN_DESCRIPTIONS: Record<SubscriptionPlan, string> = {
  FRESHWATER: "All freshwater zone forecasts",
  SALTWATER: "All saltwater zone forecasts",
  ALL_ACCESS: "All freshwater & saltwater zone forecasts",
};

// 3 months of access per purchase
export const ACCESS_PERIOD_MONTHS = 3;

// ─── Plan Config ─────────────────────────────────────────
export const PLAN_CONFIG = {
  FRESHWATER: {
    name: "Freshwater",
    price: "$7",
    period: "/3 months",
    description: "All freshwater zones",
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
    price: "$7",
    period: "/3 months",
    description: "All saltwater zones",
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
    period: "/3 months",
    description: "Everything, all zones",
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

// ─── Tier Access Logic ───────────────────────────────────

export function checkTierAccess(
  tier: "FREE" | "FRESHWATER" | "SALTWATER" | "ALL_ACCESS",
  waterType: "SALT" | "FRESH"
): boolean {
  if (tier === "ALL_ACCESS") return true;
  if (tier === "FRESHWATER" && waterType === "FRESH") return true;
  if (tier === "SALTWATER" && waterType === "SALT") return true;
  return false;
}

// ─── Subscription Status Types ───────────────────────────

export interface SubscriptionStatusResponse {
  plan: SubscriptionPlan;
  status: string;
  tier: "FREE" | "FRESHWATER" | "SALTWATER" | "ALL_ACCESS";
  startDate: string;
  endDate: string;
  isActive: boolean;
  daysRemaining: number;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}
