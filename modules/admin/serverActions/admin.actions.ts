"use server";

import { withPermission } from "@/lib/middleware/withPermission";
import { AuthContext } from "@/lib/auth/types";
import { prisma } from "@/lib/prisma";
import {
  adminUserQuerySchema,
  adminReportQuerySchema,
  type PlatformStats,
  type AdminUserQuery,
  type AdminReportQuery,
} from "../types/admin.schema";

// ─── Platform Stats ─────────────────────────────────────

export const getPlatformStats = withPermission("admin")(
  async (_user: AuthContext): Promise<{ data: PlatformStats }> => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      activeSubscriptions,
      totalCatchReports,
      totalLeads,
      recentSignups,
      recentCatches,
      freeUsers,
      freshwaterUsers,
      saltwaterUsers,
      allAccessUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.catchReport.count({ where: { isDeleted: false } }),
      prisma.lead.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.catchReport.count({
        where: { createdAt: { gte: sevenDaysAgo }, isDeleted: false },
      }),
      prisma.user.count({ where: { subscriptionTier: "FREE" } }),
      prisma.user.count({ where: { subscriptionTier: "FRESHWATER" } }),
      prisma.user.count({ where: { subscriptionTier: "SALTWATER" } }),
      prisma.user.count({ where: { subscriptionTier: "ALL_ACCESS" } }),
    ]);

    return {
      data: {
        totalUsers,
        activeSubscriptions,
        totalCatchReports,
        totalLeads,
        recentSignups,
        recentCatches,
        tierBreakdown: {
          FREE: freeUsers,
          FRESHWATER: freshwaterUsers,
          SALTWATER: saltwaterUsers,
          ALL_ACCESS: allAccessUsers,
        },
      },
    };
  }
);

// ─── User Management ────────────────────────────────────

export const getAdminUsers = withPermission("admin")(
  async (_user: AuthContext, query: AdminUserQuery) => {
    const { search, tier, page, limit } = adminUserQuerySchema.parse(query);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tier && tier !== "ALL") {
      where.subscriptionTier = tier;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          roles: true,
          subscriptionTier: true,
          createdAt: true,
          _count: { select: { catchReports: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { data: users, total, page, totalPages: Math.ceil(total / limit) };
  }
);

export const updateUserRole = withPermission("admin")(
  async (_user: AuthContext, userId: string, roles: string[]) => {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { roles },
      select: { id: true, email: true, roles: true },
    });
    return { data: user, success: true };
  }
);

// ─── Catch Report Moderation ────────────────────────────

export const getAdminReports = withPermission("admin")(
  async (_user: AuthContext, query: AdminReportQuery) => {
    const { status, page, limit } = adminReportQuerySchema.parse(query);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status === "PENDING") {
      where.isVerified = false;
      where.isDeleted = false;
    } else if (status === "VERIFIED") {
      where.isVerified = true;
      where.isDeleted = false;
    } else if (status === "DELETED") {
      where.isDeleted = true;
    } else {
      // ALL — no filter
    }

    const [reports, total] = await Promise.all([
      prisma.catchReport.findMany({
        where,
        select: {
          id: true,
          species: true,
          caughtAt: true,
          isVerified: true,
          isDeleted: true,
          photoUrl: true,
          notes: true,
          createdAt: true,
          user: { select: { id: true, email: true, name: true } },
          zone: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.catchReport.count({ where }),
    ]);

    return { data: reports, total, page, totalPages: Math.ceil(total / limit) };
  }
);

export const verifyCatchReport = withPermission("admin")(
  async (_user: AuthContext, reportId: string) => {
    await prisma.catchReport.update({
      where: { id: reportId },
      data: { isVerified: true },
    });
    return { success: true };
  }
);

export const deleteCatchReport = withPermission("admin")(
  async (_user: AuthContext, reportId: string) => {
    await prisma.catchReport.update({
      where: { id: reportId },
      data: { isDeleted: true },
    });
    return { success: true };
  }
);

export const restoreCatchReport = withPermission("admin")(
  async (_user: AuthContext, reportId: string) => {
    await prisma.catchReport.update({
      where: { id: reportId },
      data: { isDeleted: false },
    });
    return { success: true };
  }
);

// ─── Lead Management ────────────────────────────────────

export const getAdminLeads = withPermission("admin")(
  async (
    _user: AuthContext,
    query: { page?: number; limit?: number }
  ) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        select: {
          id: true,
          email: true,
          source: true,
          subscribedToNewsletter: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.lead.count(),
    ]);

    return { data: leads, total, page, totalPages: Math.ceil(total / limit) };
  }
);
