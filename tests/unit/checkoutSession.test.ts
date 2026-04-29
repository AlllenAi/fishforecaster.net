import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks ──────────────────────────────────────────
const {
  mockPrisma,
  mockStripe,
  mockValidateSession,
  mockCheckAndExpireSubscription,
  mockCreateBillingPortalSession,
} = vi.hoisted(() => ({
  mockPrisma: {
    subscription: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
  },
  mockStripe: {
    customers: { create: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
  },
  mockValidateSession: vi.fn(),
  mockCheckAndExpireSubscription: vi.fn(),
  mockCreateBillingPortalSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/stripe", () => ({ stripe: mockStripe }));
vi.mock("@/lib/auth/validateSession", () => ({
  validateSession: mockValidateSession,
}));
vi.mock("@/modules/subscription/services/subscriptionService", () => ({
  checkAndExpireSubscription: mockCheckAndExpireSubscription,
}));
vi.mock("@/modules/subscription/services/stripeService", () => ({
  createBillingPortalSession: mockCreateBillingPortalSession,
}));

import {
  createCheckoutSession,
  getSubscriptionStatus,
  createPortalSession,
} from "@/modules/subscription/serverActions/subscription.action";

const TEST_USER = {
  userId: "user_123",
  email: "angler@test.com",
  name: "Test Angler",
  roles: ["user"],
  subscriptionTier: "FREE" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockValidateSession.mockResolvedValue(TEST_USER);
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
});

// ─── createCheckoutSession ─────────────────────────────────

describe("createCheckoutSession", () => {
  it("creates a new Stripe customer when user has no existing subscription", async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue(null);
    mockStripe.customers.create.mockResolvedValue({ id: "cus_new" });
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/session_123",
    });

    const result = await createCheckoutSession({ plan: "FRESHWATER" });

    expect(mockStripe.customers.create).toHaveBeenCalledWith({
      email: "angler@test.com",
      name: "Test Angler",
      metadata: { userId: "user_123" },
    });
    expect(result.url).toBe("https://checkout.stripe.com/session_123");
  });

  it("reuses existing Stripe customer ID when subscription exists", async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: "cus_existing",
    });
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/session_456",
    });

    await createCheckoutSession({ plan: "SALTWATER" });

    expect(mockStripe.customers.create).not.toHaveBeenCalled();
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: "cus_existing",
        mode: "payment",
      })
    );
  });

  it("sets correct price for FRESHWATER plan (700 cents)", async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: "cus_1",
    });
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/s",
    });

    await createCheckoutSession({ plan: "FRESHWATER" });

    const call = mockStripe.checkout.sessions.create.mock.calls[0][0];
    expect(call.line_items[0].price_data.unit_amount).toBe(700);
  });

  it("sets correct price for ALL_ACCESS plan (1200 cents)", async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: "cus_1",
    });
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/s",
    });

    await createCheckoutSession({ plan: "ALL_ACCESS" });

    const call = mockStripe.checkout.sessions.create.mock.calls[0][0];
    expect(call.line_items[0].price_data.unit_amount).toBe(1200);
  });

  it("includes userId and plan in session metadata", async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: "cus_1",
    });
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/s",
    });

    await createCheckoutSession({ plan: "SALTWATER" });

    const call = mockStripe.checkout.sessions.create.mock.calls[0][0];
    expect(call.metadata).toEqual({
      userId: "user_123",
      plan: "SALTWATER",
    });
  });

  it("throws when Stripe returns no session URL", async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: "cus_1",
    });
    mockStripe.checkout.sessions.create.mockResolvedValue({ url: null });

    await expect(
      createCheckoutSession({ plan: "FRESHWATER" })
    ).rejects.toThrow("Failed to create checkout session");
  });

  it("throws on invalid plan name", async () => {
    await expect(
      createCheckoutSession({ plan: "INVALID" as any })
    ).rejects.toThrow();
  });

  it("sets success and cancel URLs using NEXT_PUBLIC_APP_URL", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://fishforecaster.com";
    mockPrisma.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: "cus_1",
    });
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/s",
    });

    await createCheckoutSession({ plan: "FRESHWATER" });

    const call = mockStripe.checkout.sessions.create.mock.calls[0][0];
    expect(call.success_url).toBe(
      "https://fishforecaster.com/dashboard/account?payment=success"
    );
    expect(call.cancel_url).toBe(
      "https://fishforecaster.com/dashboard/account?payment=canceled"
    );
  });
});

// ─── getSubscriptionStatus ─────────────────────────────────

describe("getSubscriptionStatus", () => {
  it("returns null when user has no subscription", async () => {
    mockCheckAndExpireSubscription.mockResolvedValue("FREE");
    mockPrisma.subscription.findUnique.mockResolvedValue(null);

    const result = await getSubscriptionStatus();
    expect(result).toBeNull();
  });

  it("returns subscription details with days remaining", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);

    mockCheckAndExpireSubscription.mockResolvedValue("FRESHWATER");
    mockPrisma.subscription.findUnique.mockResolvedValue({
      plan: "FRESHWATER",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: futureDate,
      cancelAtPeriodEnd: false,
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      subscriptionTier: "FRESHWATER",
    });

    const result = await getSubscriptionStatus();

    expect(result).not.toBeNull();
    expect(result!.plan).toBe("FRESHWATER");
    expect(result!.isActive).toBe(true);
    expect(result!.daysRemaining).toBeGreaterThan(40);
    expect(result!.tier).toBe("FRESHWATER");
  });

  it("checks expiration before returning status", async () => {
    mockCheckAndExpireSubscription.mockResolvedValue("FREE");
    mockPrisma.subscription.findUnique.mockResolvedValue(null);

    await getSubscriptionStatus();

    expect(mockCheckAndExpireSubscription).toHaveBeenCalledWith("user_123");
  });

  it("defaults tier to FREE when user lookup returns null", async () => {
    mockCheckAndExpireSubscription.mockResolvedValue("FRESHWATER");
    mockPrisma.subscription.findUnique.mockResolvedValue({
      plan: "FRESHWATER",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
    });
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await getSubscriptionStatus();
    expect(result!.tier).toBe("FREE");
  });
});

// ─── createPortalSession ───────────────────────────────────

describe("createPortalSession", () => {
  it("returns portal URL for user with subscription", async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: "cus_portal",
    });
    mockCreateBillingPortalSession.mockResolvedValue({
      url: "https://billing.stripe.com/portal_123",
    });

    const result = await createPortalSession();

    expect(result.url).toBe("https://billing.stripe.com/portal_123");
    expect(mockCreateBillingPortalSession).toHaveBeenCalledWith(
      "cus_portal",
      "http://localhost:3000/dashboard/account"
    );
  });

  it("throws when user has no subscription", async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue(null);

    await expect(createPortalSession()).rejects.toThrow(
      "No subscription found"
    );
  });

  it("throws when subscription has no Stripe customer ID", async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: null,
    });

    await expect(createPortalSession()).rejects.toThrow(
      "No subscription found"
    );
  });
});
