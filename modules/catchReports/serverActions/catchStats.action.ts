"use server";

import { prisma } from "@/lib/prisma";
import { withAccess } from "@/lib/middleware/withAccess";
import type { AuthContext } from "@/lib/auth/types";
import type { CatchStatsResult } from "../types/catchReport.schema";
import { calculateScoreAccuracy } from "../services/catchAnalyticsService";

// ─── Get Catch Stats ─────────────────────────────────────────

export const getCatchStats = withAccess(
  async (_user: AuthContext, input?: { days?: number }): Promise<CatchStatsResult> => {
    const days = input?.days || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const recentCatches = await prisma.catchReport.findMany({
      where: {
        isDeleted: false,
        caughtAt: { gte: since },
      },
      include: {
        zone: { select: { name: true } },
      },
    });

    const totalCount = await prisma.catchReport.count({
      where: { isDeleted: false },
    });

    // Top species by count
    const speciesMap = new Map<string, number>();
    for (const c of recentCatches) {
      speciesMap.set(c.species, (speciesMap.get(c.species) || 0) + 1);
    }
    const topSpecies = Array.from(speciesMap.entries())
      .map(([species, count]) => ({ species, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Hot zones by catch count
    const zoneMap = new Map<string, { zoneName: string; zoneId: string; count: number }>();
    for (const c of recentCatches) {
      const existing = zoneMap.get(c.zoneId);
      if (existing) {
        existing.count++;
      } else {
        zoneMap.set(c.zoneId, { zoneName: c.zone.name, zoneId: c.zoneId, count: 1 });
      }
    }
    const hotZones = Array.from(zoneMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      topSpecies,
      hotZones,
      recentCount: recentCatches.length,
      totalCount,
    };
  }
);

// ─── Get Zone Catch Count ────────────────────────────────────

export const getZoneCatchCount = withAccess(
  async (_user: AuthContext, zoneId: string): Promise<number> => {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    return prisma.catchReport.count({
      where: {
        zoneId,
        isDeleted: false,
        caughtAt: { gte: since },
      },
    });
  }
);

// ─── Get Forecast Accuracy for a Zone ───────────────────────

export const getForecastAccuracy = withAccess(
  async (_user: AuthContext, input: { zoneId: string; days?: number }) => {
    const days = input.days || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return calculateScoreAccuracy(input.zoneId, startDate, endDate);
  }
);
