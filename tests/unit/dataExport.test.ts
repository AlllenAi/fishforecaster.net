import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks ──────────────────────────────────────────
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findUnique: vi.fn(),
    },
    catchReport: {
      findMany: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
    },
    consent: {
      findMany: vi.fn(),
    },
    auditLog: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { gatherUserData } from "@/modules/privacy/services/dataExportService";

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Test Data ──────────────────────────────────────────────

const mockUser = {
  id: "user1",
  email: "test@example.com",
  name: "Test User",
  emailVerified: new Date(),
  image: null,
  roles: ["user"],
  subscriptionTier: "FRESHWATER",
  subscribedToDigest: true,
  subscribedToUpdates: false,
  favoriteZoneIds: ["zone1"],
  notifyHighScore: true,
  notifyBiteWindow: false,
  highScoreThreshold: 75,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCatchReports = [
  {
    id: "catch1",
    species: "Bass",
    location: "Lake A",
    caughtAt: new Date(),
    lure: "Worm",
    weight: 5.2,
    photoUrl: "https://example.com/photo.jpg",
    notes: "Big one",
    createdAt: new Date(),
  },
];

const mockSubscription = {
  plan: "FRESHWATER",
  status: "ACTIVE",
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(),
  createdAt: new Date(),
};

const mockConsents = [
  { type: "terms", version: "1.0", granted: true, createdAt: new Date() },
  { type: "privacy", version: "1.0", granted: true, createdAt: new Date() },
];

const mockAuditLogs = [
  {
    action: "catch.create",
    targetType: "catchReport",
    targetId: "catch1",
    details: null,
    createdAt: new Date(),
  },
];

// ─── Tests ──────────────────────────────────────────────────

describe("gatherUserData", () => {
  it("returns all required GDPR data sections", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.catchReport.findMany.mockResolvedValue(mockCatchReports);
    mockPrisma.subscription.findFirst.mockResolvedValue(mockSubscription);
    mockPrisma.consent.findMany.mockResolvedValue(mockConsents);
    mockPrisma.auditLog.findMany.mockResolvedValue(mockAuditLogs);

    const result = await gatherUserData("user1");

    expect(result).toHaveProperty("exportDate");
    expect(result).toHaveProperty("user");
    expect(result).toHaveProperty("catchReports");
    expect(result).toHaveProperty("subscription");
    expect(result).toHaveProperty("consents");
    expect(result).toHaveProperty("auditLogs");
  });

  it("includes exportDate as ISO string", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.catchReport.findMany.mockResolvedValue([]);
    mockPrisma.subscription.findFirst.mockResolvedValue(null);
    mockPrisma.consent.findMany.mockResolvedValue([]);
    mockPrisma.auditLog.findMany.mockResolvedValue([]);

    const result = await gatherUserData("user1");

    expect(() => new Date(result.exportDate)).not.toThrow();
    expect(result.exportDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("only fetches non-deleted catch reports", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.catchReport.findMany.mockResolvedValue(mockCatchReports);
    mockPrisma.subscription.findFirst.mockResolvedValue(null);
    mockPrisma.consent.findMany.mockResolvedValue([]);
    mockPrisma.auditLog.findMany.mockResolvedValue([]);

    await gatherUserData("user1");

    expect(mockPrisma.catchReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user1", isDeleted: false },
      })
    );
  });

  it("returns user profile with all required fields", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.catchReport.findMany.mockResolvedValue([]);
    mockPrisma.subscription.findFirst.mockResolvedValue(null);
    mockPrisma.consent.findMany.mockResolvedValue([]);
    mockPrisma.auditLog.findMany.mockResolvedValue([]);

    const result = await gatherUserData("user1");

    expect(result.user).toEqual(mockUser);
  });

  it("handles user with no subscription", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.catchReport.findMany.mockResolvedValue([]);
    mockPrisma.subscription.findFirst.mockResolvedValue(null);
    mockPrisma.consent.findMany.mockResolvedValue([]);
    mockPrisma.auditLog.findMany.mockResolvedValue([]);

    const result = await gatherUserData("user1");

    expect(result.subscription).toBeNull();
  });

  it("handles user with no catch reports", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.catchReport.findMany.mockResolvedValue([]);
    mockPrisma.subscription.findFirst.mockResolvedValue(mockSubscription);
    mockPrisma.consent.findMany.mockResolvedValue(mockConsents);
    mockPrisma.auditLog.findMany.mockResolvedValue([]);

    const result = await gatherUserData("user1");

    expect(result.catchReports).toEqual([]);
  });

  it("queries all data using the correct userId", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.catchReport.findMany.mockResolvedValue([]);
    mockPrisma.subscription.findFirst.mockResolvedValue(null);
    mockPrisma.consent.findMany.mockResolvedValue([]);
    mockPrisma.auditLog.findMany.mockResolvedValue([]);

    await gatherUserData("user1");

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user1" } })
    );
    expect(mockPrisma.consent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user1" } })
    );
    expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { actorId: "user1" } })
    );
  });
});
