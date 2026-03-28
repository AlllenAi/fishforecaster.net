import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock Prisma (vi.hoisted so vi.mock factory can reference it) ───
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    subscription: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import {
  activateSubscription,
  checkAndExpireSubscription,
} from "@/modules/subscription/services/subscriptionService";

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── activateSubscription ───────────────────────────────────

describe("activateSubscription", () => {
  it("upserts a subscription with ACTIVE status and 3-month period", async () => {
    mockPrisma.subscription.upsert.mockResolvedValue({});
    mockPrisma.user.update.mockResolvedValue({});

    await activateSubscription("user1", "FRESHWATER", "pi_123", "cus_123");

    const call = mockPrisma.subscription.upsert.mock.calls[0][0];
    expect(call.where).toEqual({ userId: "user1" });
    expect(call.create.plan).toBe("FRESHWATER");
    expect(call.create.status).toBe("ACTIVE");
    expect(call.create.stripeCustomerId).toBe("cus_123");
    expect(call.create.stripePaymentId).toBe("pi_123");

    // Verify the end date is ~3 months from now
    const start = new Date(call.create.currentPeriodStart);
    const end = new Date(call.create.currentPeriodEnd);
    const monthsDiff =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    expect(monthsDiff).toBe(3);
  });

  it("updates user tier to match the plan", async () => {
    mockPrisma.subscription.upsert.mockResolvedValue({});
    mockPrisma.user.update.mockResolvedValue({});

    await activateSubscription("user1", "ALL_ACCESS", "pi_456", "cus_456");

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user1" },
      data: { subscriptionTier: "ALL_ACCESS" },
    });
  });

  it("maps SALTWATER plan to SALTWATER tier", async () => {
    mockPrisma.subscription.upsert.mockResolvedValue({});
    mockPrisma.user.update.mockResolvedValue({});

    await activateSubscription("user1", "SALTWATER", "pi_789", "cus_789");

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user1" },
      data: { subscriptionTier: "SALTWATER" },
    });
  });
});

// ─── checkAndExpireSubscription ─────────────────────────────

describe("checkAndExpireSubscription", () => {
  it("returns FREE when no subscription exists", async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue(null);

    const tier = await checkAndExpireSubscription("user1");
    expect(tier).toBe("FREE");
  });

  it("expires an active subscription past its end date", async () => {
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);

    mockPrisma.subscription.findUnique.mockResolvedValue({
      status: "ACTIVE",
      currentPeriodEnd: pastDate,
      plan: "FRESHWATER",
    });
    mockPrisma.subscription.update.mockResolvedValue({});
    mockPrisma.user.update.mockResolvedValue({});

    const tier = await checkAndExpireSubscription("user1");

    expect(tier).toBe("FREE");
    expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
      where: { userId: "user1" },
      data: { status: "EXPIRED" },
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user1" },
      data: { subscriptionTier: "FREE" },
    });
  });

  it("returns correct tier for active subscription not yet expired", async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);

    mockPrisma.subscription.findUnique.mockResolvedValue({
      status: "ACTIVE",
      currentPeriodEnd: futureDate,
      plan: "ALL_ACCESS",
    });

    const tier = await checkAndExpireSubscription("user1");
    expect(tier).toBe("ALL_ACCESS");
    expect(mockPrisma.subscription.update).not.toHaveBeenCalled();
  });

  it("returns FREE for already expired subscription", async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue({
      status: "EXPIRED",
      currentPeriodEnd: new Date(),
      plan: "FRESHWATER",
    });

    const tier = await checkAndExpireSubscription("user1");
    expect(tier).toBe("FREE");
  });

  it("returns FREE for canceled subscription", async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue({
      status: "CANCELED",
      currentPeriodEnd: new Date(),
      plan: "SALTWATER",
    });

    const tier = await checkAndExpireSubscription("user1");
    expect(tier).toBe("FREE");
  });
});
