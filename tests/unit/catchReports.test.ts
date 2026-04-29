import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks ──────────────────────────────────────────
const { mockPrisma, mockValidateSession } = vi.hoisted(() => ({
  mockPrisma: {
    catchReport: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  mockValidateSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth/validateSession", () => ({
  validateSession: mockValidateSession,
}));

import {
  submitCatchReport,
  getCatchReports,
  getMyCatchReports,
  updateCatchReport,
  deleteCatchReport,
} from "@/modules/catchReports/serverActions/catchReport.action";

const TEST_USER = {
  userId: "user_123",
  email: "angler@test.com",
  name: "Test Angler",
  roles: ["user"],
  subscriptionTier: "FREE" as const,
};

const VALID_REPORT_INPUT = {
  species: "Largemouth Bass",
  zoneId: "zone_1",
  location: { lat: 28.5, lon: -81.3 },
  caughtAt: new Date("2026-03-15"),
  lure: "Plastic worm",
  weight: 4.5,
  notes: "Caught near the dock",
};

function makeMockReport(overrides: Record<string, unknown> = {}) {
  return {
    id: "report_1",
    userId: "user_123",
    species: "Largemouth Bass",
    zoneId: "zone_1",
    location: { lat: 28.5, lon: -81.3 },
    caughtAt: new Date("2026-03-15"),
    lure: "Plastic worm",
    weight: 4.5,
    photoUrl: null,
    notes: "Caught near the dock",
    isVerified: false,
    isDeleted: false,
    createdAt: new Date(),
    user: { name: "Test Angler" },
    zone: { name: "Lake Eustis" },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockValidateSession.mockResolvedValue(TEST_USER);
});

// ─── submitCatchReport ─────────────────────────────────────

describe("submitCatchReport", () => {
  it("creates a catch report with validated input", async () => {
    mockPrisma.catchReport.create.mockResolvedValue({ id: "report_new" });

    const result = await submitCatchReport(VALID_REPORT_INPUT);

    expect(result).toEqual({ success: true, id: "report_new" });
    expect(mockPrisma.catchReport.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user_123",
        species: "Largemouth Bass",
        zoneId: "zone_1",
        isVerified: false,
      }),
    });
  });

  it("sets isVerified to false on new reports", async () => {
    mockPrisma.catchReport.create.mockResolvedValue({ id: "report_new" });

    await submitCatchReport(VALID_REPORT_INPUT);

    const createCall = mockPrisma.catchReport.create.mock.calls[0][0];
    expect(createCall.data.isVerified).toBe(false);
  });

  it("accepts input without optional fields", async () => {
    mockPrisma.catchReport.create.mockResolvedValue({ id: "report_min" });

    const minInput = {
      species: "Bluegill",
      zoneId: "zone_2",
      location: { lat: 29.0, lon: -82.0 },
      caughtAt: new Date("2026-03-20"),
    };

    const result = await submitCatchReport(minInput);
    expect(result.success).toBe(true);
  });
});

// ─── getCatchReports ───────────────────────────────────────

describe("getCatchReports", () => {
  it("returns paginated reports with nextCursor", async () => {
    const reports = Array.from({ length: 21 }, (_, i) =>
      makeMockReport({ id: `report_${i}` })
    );
    mockPrisma.catchReport.findMany.mockResolvedValue(reports);

    const result = await getCatchReports({});

    expect(result.reports).toHaveLength(20);
    expect(result.nextCursor).toBe("report_19");
  });

  it("returns null nextCursor when fewer results than limit", async () => {
    mockPrisma.catchReport.findMany.mockResolvedValue([
      makeMockReport({ id: "report_1" }),
    ]);

    const result = await getCatchReports({});

    expect(result.reports).toHaveLength(1);
    expect(result.nextCursor).toBeNull();
  });

  it("filters by zoneId when provided", async () => {
    mockPrisma.catchReport.findMany.mockResolvedValue([]);

    await getCatchReports({ zoneId: "zone_5" });

    const whereClause =
      mockPrisma.catchReport.findMany.mock.calls[0][0].where;
    expect(whereClause.zoneId).toBe("zone_5");
  });

  it("filters by species when provided", async () => {
    mockPrisma.catchReport.findMany.mockResolvedValue([]);

    await getCatchReports({ species: "Redfish" });

    const whereClause =
      mockPrisma.catchReport.findMany.mock.calls[0][0].where;
    expect(whereClause.species).toBe("Redfish");
  });

  it("excludes soft-deleted reports", async () => {
    mockPrisma.catchReport.findMany.mockResolvedValue([]);

    await getCatchReports({});

    const whereClause =
      mockPrisma.catchReport.findMany.mock.calls[0][0].where;
    expect(whereClause.isDeleted).toBe(false);
  });

  it("maps userName to Anonymous Angler when user name is null", async () => {
    mockPrisma.catchReport.findMany.mockResolvedValue([
      makeMockReport({ user: { name: null } }),
    ]);

    const result = await getCatchReports({});

    expect(result.reports[0].userName).toBe("Anonymous Angler");
  });
});

// ─── getMyCatchReports ─────────────────────────────────────

describe("getMyCatchReports", () => {
  it("returns only the authenticated user's reports", async () => {
    mockPrisma.catchReport.findMany.mockResolvedValue([
      makeMockReport({ id: "my_1" }),
    ]);

    await getMyCatchReports();

    const whereClause =
      mockPrisma.catchReport.findMany.mock.calls[0][0].where;
    expect(whereClause.userId).toBe("user_123");
    expect(whereClause.isDeleted).toBe(false);
  });

  it("orders results by caughtAt descending", async () => {
    mockPrisma.catchReport.findMany.mockResolvedValue([]);

    await getMyCatchReports();

    const query = mockPrisma.catchReport.findMany.mock.calls[0][0];
    expect(query.orderBy).toEqual({ caughtAt: "desc" });
  });
});

// ─── updateCatchReport ─────────────────────────────────────

describe("updateCatchReport", () => {
  it("updates a report owned by the user", async () => {
    mockPrisma.catchReport.findUnique.mockResolvedValue(
      makeMockReport({ userId: "user_123", isVerified: false })
    );
    mockPrisma.catchReport.update.mockResolvedValue({});

    const result = await updateCatchReport({
      id: "report_1",
      species: "Spotted Bass",
    });

    expect(result).toEqual({ success: true });
  });

  it("throws when report does not exist", async () => {
    mockPrisma.catchReport.findUnique.mockResolvedValue(null);

    await expect(
      updateCatchReport({ id: "nonexistent", species: "Bass" })
    ).rejects.toThrow("Catch report not found");
  });

  it("throws when report belongs to another user", async () => {
    mockPrisma.catchReport.findUnique.mockResolvedValue(
      makeMockReport({ userId: "other_user" })
    );

    await expect(
      updateCatchReport({ id: "report_1", species: "Bass" })
    ).rejects.toThrow("Not your report");
  });

  it("throws when report is verified", async () => {
    mockPrisma.catchReport.findUnique.mockResolvedValue(
      makeMockReport({ userId: "user_123", isVerified: true })
    );

    await expect(
      updateCatchReport({ id: "report_1", species: "Bass" })
    ).rejects.toThrow("Cannot edit a verified report");
  });
});

// ─── deleteCatchReport ─────────────────────────────────────

describe("deleteCatchReport", () => {
  it("soft-deletes a report owned by the user", async () => {
    mockPrisma.catchReport.findUnique.mockResolvedValue(
      makeMockReport({ userId: "user_123" })
    );
    mockPrisma.catchReport.update.mockResolvedValue({});

    const result = await deleteCatchReport("report_1");

    expect(result).toEqual({ success: true });
    expect(mockPrisma.catchReport.update).toHaveBeenCalledWith({
      where: { id: "report_1" },
      data: { isDeleted: true },
    });
  });

  it("throws when report does not exist", async () => {
    mockPrisma.catchReport.findUnique.mockResolvedValue(null);

    await expect(deleteCatchReport("nonexistent")).rejects.toThrow(
      "Catch report not found"
    );
  });

  it("throws when report belongs to another user", async () => {
    mockPrisma.catchReport.findUnique.mockResolvedValue(
      makeMockReport({ userId: "other_user" })
    );

    await expect(deleteCatchReport("report_1")).rejects.toThrow(
      "Not your report"
    );
  });
});
