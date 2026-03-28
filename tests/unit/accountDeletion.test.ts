import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks ──────────────────────────────────────────
const { mockPrisma, mockStripeCustomersDel, mockDel } = vi.hoisted(() => ({
  mockPrisma: {
    subscription: {
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
    catchReport: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    auditLog: {
      updateMany: vi.fn(),
    },
    consent: {
      updateMany: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
    },
    account: {
      deleteMany: vi.fn(),
    },
    user: {
      delete: vi.fn(),
    },
  },
  mockStripeCustomersDel: vi.fn(),
  mockDel: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    customers: {
      del: mockStripeCustomersDel,
    },
  },
}));

vi.mock("@vercel/blob", () => ({
  del: mockDel,
}));

import { deleteUserAccount } from "@/modules/privacy/services/accountDeletionService";

beforeEach(() => {
  vi.clearAllMocks();

  // Default mocks for the happy path
  mockPrisma.subscription.findFirst.mockResolvedValue({
    stripeCustomerId: "cus_123",
  });
  mockPrisma.catchReport.findMany.mockResolvedValue([]);
  mockPrisma.auditLog.updateMany.mockResolvedValue({});
  mockPrisma.consent.updateMany.mockResolvedValue({});
  mockPrisma.catchReport.deleteMany.mockResolvedValue({});
  mockPrisma.subscription.deleteMany.mockResolvedValue({});
  mockPrisma.session.deleteMany.mockResolvedValue({});
  mockPrisma.account.deleteMany.mockResolvedValue({});
  mockPrisma.user.delete.mockResolvedValue({});
  mockStripeCustomersDel.mockResolvedValue({});
  mockDel.mockResolvedValue(undefined);
});

describe("deleteUserAccount", () => {
  it("deletes Stripe customer when subscription has stripeCustomerId", async () => {
    await deleteUserAccount("user1");

    expect(mockStripeCustomersDel).toHaveBeenCalledWith("cus_123");
  });

  it("skips Stripe deletion when no subscription exists", async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue(null);

    await deleteUserAccount("user1");

    expect(mockStripeCustomersDel).not.toHaveBeenCalled();
  });

  it("continues deletion even if Stripe cleanup fails", async () => {
    mockStripeCustomersDel.mockRejectedValue(new Error("Stripe error"));

    await deleteUserAccount("user1");

    expect(mockPrisma.user.delete).toHaveBeenCalledWith({
      where: { id: "user1" },
    });
  });

  it("deletes photos from Vercel Blob storage", async () => {
    mockPrisma.catchReport.findMany.mockResolvedValue([
      { photoUrl: "https://blob.vercel.com/photo1.jpg" },
      { photoUrl: "https://blob.vercel.com/photo2.jpg" },
      { photoUrl: null },
    ]);

    await deleteUserAccount("user1");

    expect(mockDel).toHaveBeenCalledWith([
      "https://blob.vercel.com/photo1.jpg",
      "https://blob.vercel.com/photo2.jpg",
    ]);
  });

  it("skips blob deletion when no photos exist", async () => {
    mockPrisma.catchReport.findMany.mockResolvedValue([]);

    await deleteUserAccount("user1");

    expect(mockDel).not.toHaveBeenCalled();
  });

  it("continues deletion even if blob cleanup fails", async () => {
    mockPrisma.catchReport.findMany.mockResolvedValue([
      { photoUrl: "https://blob.vercel.com/photo1.jpg" },
    ]);
    mockDel.mockRejectedValue(new Error("Blob error"));

    await deleteUserAccount("user1");

    expect(mockPrisma.user.delete).toHaveBeenCalledWith({
      where: { id: "user1" },
    });
  });

  it("anonymizes audit logs instead of deleting them", async () => {
    await deleteUserAccount("user1");

    expect(mockPrisma.auditLog.updateMany).toHaveBeenCalledWith({
      where: { actorId: "user1" },
      data: {
        actorEmail: "deleted-user",
        actorId: "000000000000000000000000",
      },
    });
  });

  it("anonymizes consent records instead of deleting them", async () => {
    await deleteUserAccount("user1");

    expect(mockPrisma.consent.updateMany).toHaveBeenCalledWith({
      where: { userId: "user1" },
      data: { userId: null },
    });
  });

  it("deletes all related records and user last", async () => {
    const callOrder: string[] = [];
    mockPrisma.catchReport.deleteMany.mockImplementation(() => {
      callOrder.push("catchReports");
      return Promise.resolve({});
    });
    mockPrisma.subscription.deleteMany.mockImplementation(() => {
      callOrder.push("subscriptions");
      return Promise.resolve({});
    });
    mockPrisma.session.deleteMany.mockImplementation(() => {
      callOrder.push("sessions");
      return Promise.resolve({});
    });
    mockPrisma.account.deleteMany.mockImplementation(() => {
      callOrder.push("accounts");
      return Promise.resolve({});
    });
    mockPrisma.user.delete.mockImplementation(() => {
      callOrder.push("user");
      return Promise.resolve({});
    });

    await deleteUserAccount("user1");

    expect(callOrder[callOrder.length - 1]).toBe("user");
    expect(callOrder).toContain("catchReports");
    expect(callOrder).toContain("subscriptions");
    expect(callOrder).toContain("sessions");
    expect(callOrder).toContain("accounts");
  });
});
