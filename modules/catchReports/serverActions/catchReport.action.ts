"use server";

import { prisma } from "@/lib/prisma";
import { withAccess } from "@/lib/middleware/withAccess";
import type { AuthContext } from "@/lib/auth/types";
import { NotFoundError, PermissionError } from "@/lib/auth/types";
import {
  catchReportSchema,
  updateCatchReportSchema,
} from "../types/catchReport.schema";
import type { CatchReportWithUser } from "../types/catchReport.schema";

// ─── Submit Catch Report ─────────────────────────────────────

export const submitCatchReport = withAccess(
  async (user: AuthContext, input: Record<string, unknown>) => {
    const validated = catchReportSchema.parse(input);

    const report = await prisma.catchReport.create({
      data: {
        userId: user.userId,
        zoneId: validated.zoneId,
        species: validated.species,
        location: validated.location,
        caughtAt: validated.caughtAt,
        lure: validated.lure,
        weight: validated.weight,
        photoUrl: validated.photoUrl,
        notes: validated.notes,
        isVerified: false,
      },
    });

    return { success: true, id: report.id };
  }
);

// ─── Get Catch Reports (public feed) ─────────────────────────

export const getCatchReports = withAccess(
  async (
    _user: AuthContext,
    input?: { zoneId?: string; species?: string; days?: number; cursor?: string; limit?: number }
  ): Promise<{ reports: CatchReportWithUser[]; nextCursor: string | null }> => {
    const limit = input?.limit || 20;
    const days = input?.days || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const reports = await prisma.catchReport.findMany({
      where: {
        isDeleted: false,
        caughtAt: { gte: since },
        ...(input?.zoneId ? { zoneId: input.zoneId } : {}),
        ...(input?.species ? { species: input.species } : {}),
      },
      include: {
        user: { select: { name: true } },
        zone: { select: { name: true } },
      },
      orderBy: { caughtAt: "desc" },
      take: limit + 1,
      ...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });

    const hasMore = reports.length > limit;
    const items = hasMore ? reports.slice(0, limit) : reports;

    return {
      reports: items.map((r) => ({
        id: r.id,
        species: r.species,
        zoneId: r.zoneId,
        zoneName: r.zone.name,
        location: r.location as { lat: number; lon: number },
        caughtAt: r.caughtAt,
        lure: r.lure,
        weight: r.weight,
        photoUrl: r.photoUrl,
        notes: r.notes,
        isVerified: r.isVerified,
        createdAt: r.createdAt,
        userName: r.user.name || "Anonymous Angler",
      })),
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }
);

// ─── Get My Catch Reports ────────────────────────────────────

export const getMyCatchReports = withAccess(
  async (user: AuthContext): Promise<CatchReportWithUser[]> => {
    const reports = await prisma.catchReport.findMany({
      where: {
        userId: user.userId,
        isDeleted: false,
      },
      include: {
        user: { select: { name: true } },
        zone: { select: { name: true } },
      },
      orderBy: { caughtAt: "desc" },
    });

    return reports.map((r) => ({
      id: r.id,
      species: r.species,
      zoneId: r.zoneId,
      zoneName: r.zone.name,
      location: r.location as { lat: number; lon: number },
      caughtAt: r.caughtAt,
      lure: r.lure,
      weight: r.weight,
      photoUrl: r.photoUrl,
      notes: r.notes,
      isVerified: r.isVerified,
      createdAt: r.createdAt,
      userName: r.user.name || "Anonymous Angler",
    }));
  }
);

// ─── Update Catch Report ─────────────────────────────────────

export const updateCatchReport = withAccess(
  async (user: AuthContext, input: Record<string, unknown>) => {
    const validated = updateCatchReportSchema.parse(input);

    const report = await prisma.catchReport.findUnique({
      where: { id: validated.id },
    });

    if (!report) throw new NotFoundError("Catch report not found");
    if (report.userId !== user.userId) throw new PermissionError("Not your report");
    if (report.isVerified) throw new PermissionError("Cannot edit a verified report");

    const { id, ...data } = validated;

    await prisma.catchReport.update({
      where: { id },
      data,
    });

    return { success: true };
  }
);

// ─── Delete Catch Report (soft delete) ───────────────────────

export const deleteCatchReport = withAccess(
  async (user: AuthContext, reportId: string) => {
    const report = await prisma.catchReport.findUnique({
      where: { id: reportId },
    });

    if (!report) throw new NotFoundError("Catch report not found");
    if (report.userId !== user.userId) throw new PermissionError("Not your report");

    await prisma.catchReport.update({
      where: { id: reportId },
      data: { isDeleted: true },
    });

    return { success: true };
  }
);

// ─── Get Catch Reports for Map ───────────────────────────────

export const getCatchMapData = withAccess(
  async (
    _user: AuthContext,
    input?: { days?: number; species?: string; waterType?: "SALT" | "FRESH" }
  ) => {
    const days = input?.days || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const reports = await prisma.catchReport.findMany({
      where: {
        isDeleted: false,
        caughtAt: { gte: since },
        ...(input?.species ? { species: input.species } : {}),
        ...(input?.waterType
          ? { zone: { waterType: input.waterType } }
          : {}),
      },
      include: {
        user: { select: { name: true } },
        zone: { select: { name: true, waterType: true } },
      },
      orderBy: { caughtAt: "desc" },
    });

    return reports.map((r) => ({
      id: r.id,
      species: r.species,
      zoneName: r.zone.name,
      location: r.location as { lat: number; lon: number },
      caughtAt: r.caughtAt,
      lure: r.lure,
      weight: r.weight,
      photoUrl: r.photoUrl,
      userName: r.user.name || "Anonymous Angler",
      waterType: r.zone.waterType,
    }));
  }
);
