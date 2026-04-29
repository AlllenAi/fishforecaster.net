"use server";

import { prisma } from "@/lib/prisma";
import { withAccess } from "@/lib/middleware/withAccess";
import { withPaidSubscription } from "@/lib/middleware/withPaidSubscription";
import type { AuthContext } from "@/lib/auth/types";
import { NotFoundError, PermissionError } from "@/lib/auth/types";
import { signBlobUrl } from "@/lib/blob";
import {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
  rsvpSchema,
} from "../types/community.schema";
import type { CommunityEventWithUser } from "../types/community.schema";

// ─── Create Event (paid → PENDING, free → DRAFT) ──────────

export const createEvent = withAccess(
  async (user: AuthContext, input: Record<string, unknown>) => {
    const validated = createEventSchema.parse(input);

    const status = user.subscriptionTier === "FREE" ? "DRAFT" : "PENDING";

    const event = await prisma.communityEvent.create({
      data: {
        userId: user.userId,
        title: validated.title,
        description: validated.description,
        photoUrl: validated.photoUrl,
        location: validated.location,
        eventDate: new Date(validated.eventDate),
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        status,
      },
    });

    return { success: true, id: event.id, status };
  }
);

// ─── Get Events Feed (approved, upcoming first) ───────────

export const getEventsFeed = withAccess(
  async (
    user: AuthContext,
    input?: Record<string, unknown>
  ): Promise<{ events: CommunityEventWithUser[]; nextCursor: string | null }> => {
    const { cursor, limit, search, upcoming } = eventQuerySchema.parse(
      input || {}
    );

    const where: Record<string, unknown> = {
      status: "APPROVED",
      isDeleted: false,
    };

    if (upcoming) {
      where.eventDate = { gte: new Date() };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const rawEvents = await prisma.communityEvent.findMany({
      where,
      include: {
        user: { select: { name: true, image: true } },
        _count: { select: { rsvps: true } },
      },
      orderBy: { eventDate: "asc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = rawEvents.length > limit;
    const items = hasMore ? rawEvents.slice(0, limit) : rawEvents;

    // Get RSVP counts broken down by status, and user's RSVP
    const eventIds = items.map((e) => e.id);

    const [rsvpCounts, userRsvps] = await Promise.all([
      prisma.eventRSVP.groupBy({
        by: ["eventId", "status"],
        where: { eventId: { in: eventIds } },
        _count: true,
      }),
      prisma.eventRSVP.findMany({
        where: { userId: user.userId, eventId: { in: eventIds } },
        select: { eventId: true, status: true },
      }),
    ]);

    const countsMap = new Map<string, { going: number; interested: number }>();
    for (const r of rsvpCounts) {
      const existing = countsMap.get(r.eventId) || {
        going: 0,
        interested: 0,
      };
      if (r.status === "GOING") existing.going = r._count;
      if (r.status === "INTERESTED") existing.interested = r._count;
      countsMap.set(r.eventId, existing);
    }

    const userRsvpMap = new Map(
      userRsvps.map((r) => [r.eventId, r.status as "GOING" | "INTERESTED"])
    );

    const events = await Promise.all(
      items.map(async (e) => {
        const counts = countsMap.get(e.id) || { going: 0, interested: 0 };
        return {
          id: e.id,
          title: e.title,
          description: e.description,
          photoUrl: e.photoUrl ? await signBlobUrl(e.photoUrl) : null,
          location: e.location,
          eventDate: e.eventDate,
          endDate: e.endDate,
          status: e.status,
          createdAt: e.createdAt,
          userName: e.user.name || "Anonymous Angler",
          userImage: e.user.image,
          goingCount: counts.going,
          interestedCount: counts.interested,
          userRsvp: userRsvpMap.get(e.id) || null,
        };
      })
    );

    return {
      events,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }
);

// ─── Get Event Detail ──────────────────────────────────────

export const getEventById = withAccess(
  async (
    user: AuthContext,
    eventId: string
  ): Promise<CommunityEventWithUser | null> => {
    const event = await prisma.communityEvent.findUnique({
      where: { id: eventId },
      include: {
        user: { select: { name: true, image: true } },
        _count: { select: { rsvps: true } },
      },
    });

    if (!event || event.isDeleted) return null;

    if (event.status !== "APPROVED" && event.userId !== user.userId) {
      return null;
    }

    const [rsvpCounts, userRsvp] = await Promise.all([
      prisma.eventRSVP.groupBy({
        by: ["status"],
        where: { eventId },
        _count: true,
      }),
      prisma.eventRSVP.findUnique({
        where: { eventId_userId: { eventId, userId: user.userId } },
      }),
    ]);

    let goingCount = 0;
    let interestedCount = 0;
    for (const r of rsvpCounts) {
      if (r.status === "GOING") goingCount = r._count;
      if (r.status === "INTERESTED") interestedCount = r._count;
    }

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      photoUrl: event.photoUrl ? await signBlobUrl(event.photoUrl) : null,
      location: event.location,
      eventDate: event.eventDate,
      endDate: event.endDate,
      status: event.status,
      createdAt: event.createdAt,
      userName: event.user.name || "Anonymous Angler",
      userImage: event.user.image,
      goingCount,
      interestedCount,
      userRsvp: userRsvp
        ? (userRsvp.status as "GOING" | "INTERESTED")
        : null,
    };
  }
);

// ─── Get My Events ─────────────────────────────────────────

export const getMyEvents = withAccess(
  async (user: AuthContext): Promise<CommunityEventWithUser[]> => {
    const events = await prisma.communityEvent.findMany({
      where: { userId: user.userId, isDeleted: false },
      include: {
        user: { select: { name: true, image: true } },
        _count: { select: { rsvps: true } },
      },
      orderBy: { eventDate: "desc" },
    });

    return Promise.all(
      events.map(async (e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        photoUrl: e.photoUrl ? await signBlobUrl(e.photoUrl) : null,
        location: e.location,
        eventDate: e.eventDate,
        endDate: e.endDate,
        status: e.status,
        createdAt: e.createdAt,
        userName: e.user.name || "Anonymous Angler",
        userImage: e.user.image,
        goingCount: e._count.rsvps,
        interestedCount: 0,
        userRsvp: null,
      }))
    );
  }
);

// ─── Toggle RSVP ───────────────────────────────────────────

export const toggleRSVP = withPaidSubscription(
  async (user: AuthContext, input: Record<string, unknown>) => {
    const { eventId, status } = rsvpSchema.parse(input);

    const event = await prisma.communityEvent.findUnique({
      where: { id: eventId },
    });

    if (!event || event.isDeleted || event.status !== "APPROVED") {
      throw new NotFoundError("Event not found");
    }

    const existing = await prisma.eventRSVP.findUnique({
      where: { eventId_userId: { eventId, userId: user.userId } },
    });

    if (existing && existing.status === status) {
      // Same status = remove RSVP (toggle off)
      await prisma.eventRSVP.delete({
        where: { id: existing.id },
      });
      return { success: true, rsvp: null };
    }

    // Upsert the RSVP
    const rsvp = await prisma.eventRSVP.upsert({
      where: { eventId_userId: { eventId, userId: user.userId } },
      update: { status },
      create: { eventId, userId: user.userId, status },
    });

    return { success: true, rsvp: rsvp.status };
  }
);

// ─── Update Event (own DRAFT/PENDING only) ─────────────────

export const updateEvent = withAccess(
  async (user: AuthContext, input: Record<string, unknown>) => {
    const validated = updateEventSchema.parse(input);

    const event = await prisma.communityEvent.findUnique({
      where: { id: validated.id },
    });

    if (!event) throw new NotFoundError("Event not found");
    if (event.userId !== user.userId)
      throw new PermissionError("Not your event");
    if (event.status === "APPROVED")
      throw new PermissionError("Cannot edit an approved event");

    const { id, ...data } = validated;

    const updateData: Record<string, unknown> = { ...data };
    if (data.eventDate) updateData.eventDate = new Date(data.eventDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    if (event.status === "REJECTED") {
      updateData.status =
        user.subscriptionTier === "FREE" ? "DRAFT" : "PENDING";
      updateData.rejectionReason = null;
    }

    await prisma.communityEvent.update({
      where: { id },
      data: updateData,
    });

    return { success: true };
  }
);

// ─── Delete Event (soft delete, own events only) ───────────

export const deleteEvent = withAccess(
  async (user: AuthContext, eventId: string) => {
    const event = await prisma.communityEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new NotFoundError("Event not found");
    if (event.userId !== user.userId)
      throw new PermissionError("Not your event");

    await prisma.communityEvent.update({
      where: { id: eventId },
      data: { isDeleted: true },
    });

    return { success: true };
  }
);

// ─── Publish Draft Event ───────────────────────────────────

export const publishDraftEvent = withPaidSubscription(
  async (user: AuthContext, eventId: string) => {
    const event = await prisma.communityEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new NotFoundError("Event not found");
    if (event.userId !== user.userId)
      throw new PermissionError("Not your event");
    if (event.status !== "DRAFT")
      throw new PermissionError("Only draft events can be published");

    await prisma.communityEvent.update({
      where: { id: eventId },
      data: { status: "PENDING" },
    });

    return { success: true };
  }
);
