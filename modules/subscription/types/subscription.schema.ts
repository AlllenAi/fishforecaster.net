import { z } from "zod";
import type { SubscriptionPlan } from "@prisma/client";

// ─── Zod Schemas ─────────────────────────────────────────

export const checkoutInputSchema = z.object({
  plan: z.enum(["FRESHWATER", "SALTWATER", "ALL_ACCESS"]),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

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

// ─── Subscription Status Types ───────────────────────────

export interface SubscriptionStatusResponse {
  plan: SubscriptionPlan;
  status: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  daysRemaining: number;
}
