"use server";

import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/middleware/withPermission";
import type { AuthContext } from "@/lib/auth/types";
import { signBlobUrls } from "@/lib/blob";
import { logAction } from "@/modules/admin/services/auditService";
import {
  adminCommunityQuerySchema,
} from "../types/community.schema";
import type { AdminCommunityQuery } from "../types/community.schema";

// ─── Get Community Posts (admin) ────────────────────────────

export const getAdminCommunityPosts = withPermission("admin")(
  async (_user: AuthContext, query: AdminCommunityQuery) => {
    const { status, page, limit } = adminCommunityQuerySchema.parse(query);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        select: {
          id: true,
          title: true,
          story: true,
          photoUrls: true,
          status: true,
          rejectionReason: true,
          createdAt: true,
          user: { select: { id: true, email: true, name: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.communityPost.count({ where }),
    ]);

    const signedPosts = await Promise.all(
      posts.map(async (p) => ({
        ...p,
        photoUrls: await signBlobUrls(p.photoUrls),
      }))
    );

    return { data: signedPosts, total, page, totalPages: Math.ceil(total / limit) };
  }
);

// ─── Approve Post ───────────────────────────────────────────

export const approvePost = withPermission("admin")(
  async (admin: AuthContext, postId: string) => {
    await prisma.communityPost.update({
      where: { id: postId },
      data: { status: "APPROVED" },
    });

    await logAction(admin, {
      action: "community.post.approve",
      targetType: "communityPost",
      targetId: postId,
    });

    return { success: true };
  }
);

// ─── Reject Post ────────────────────────────────────────────

export const rejectPost = withPermission("admin")(
  async (admin: AuthContext, postId: string, reason?: string) => {
    await prisma.communityPost.update({
      where: { id: postId },
      data: { status: "REJECTED", rejectionReason: reason || null },
    });

    await logAction(admin, {
      action: "community.post.reject",
      targetType: "communityPost",
      targetId: postId,
      details: { reason },
    });

    return { success: true };
  }
);

// ─── Delete Community Post (admin) ──────────────────────────

export const adminDeletePost = withPermission("admin")(
  async (admin: AuthContext, postId: string) => {
    await prisma.communityPost.update({
      where: { id: postId },
      data: { isDeleted: true },
    });

    await logAction(admin, {
      action: "community.post.delete",
      targetType: "communityPost",
      targetId: postId,
    });

    return { success: true };
  }
);

// ─── Restore Community Post (admin) ─────────────────────────

export const adminRestorePost = withPermission("admin")(
  async (admin: AuthContext, postId: string) => {
    await prisma.communityPost.update({
      where: { id: postId },
      data: { isDeleted: false },
    });

    await logAction(admin, {
      action: "community.post.restore",
      targetType: "communityPost",
      targetId: postId,
    });

    return { success: true };
  }
);

// ═══════════════════════════════════════════════════════════
// EVENT MODERATION
// ═══════════════════════════════════════════════════════════

// ─── Get Community Events (admin) ──────────────────────────

export const getAdminCommunityEvents = withPermission("admin")(
  async (_user: AuthContext, query: AdminCommunityQuery) => {
    const { status, page, limit } = adminCommunityQuerySchema.parse(query);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    const [events, total] = await Promise.all([
      prisma.communityEvent.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          eventDate: true,
          status: true,
          rejectionReason: true,
          createdAt: true,
          user: { select: { id: true, email: true, name: true } },
          _count: { select: { rsvps: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.communityEvent.count({ where }),
    ]);

    return { data: events, total, page, totalPages: Math.ceil(total / limit) };
  }
);

// ─── Approve Event ──────────────────────────────────────────

export const approveEvent = withPermission("admin")(
  async (admin: AuthContext, eventId: string) => {
    await prisma.communityEvent.update({
      where: { id: eventId },
      data: { status: "APPROVED" },
    });

    await logAction(admin, {
      action: "community.event.approve",
      targetType: "communityEvent",
      targetId: eventId,
    });

    return { success: true };
  }
);

// ─── Reject Event ───────────────────────────────────────────

export const rejectEvent = withPermission("admin")(
  async (admin: AuthContext, eventId: string, reason?: string) => {
    await prisma.communityEvent.update({
      where: { id: eventId },
      data: { status: "REJECTED", rejectionReason: reason || null },
    });

    await logAction(admin, {
      action: "community.event.reject",
      targetType: "communityEvent",
      targetId: eventId,
      details: { reason },
    });

    return { success: true };
  }
);

// ─── Delete Community Event (admin) ─────────────────────────

export const adminDeleteEvent = withPermission("admin")(
  async (admin: AuthContext, eventId: string) => {
    await prisma.communityEvent.update({
      where: { id: eventId },
      data: { isDeleted: true },
    });

    await logAction(admin, {
      action: "community.event.delete",
      targetType: "communityEvent",
      targetId: eventId,
    });

    return { success: true };
  }
);
