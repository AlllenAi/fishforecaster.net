// ─── Zone Server Actions ────────────────────────────────────
//
// These let the frontend get the list of fishing zones and
// individual zone details. Wrapped with withAccess() so
// only logged-in users can access them.

"use server";

import { prisma } from "@/lib/prisma";
import { withAccess } from "@/lib/middleware/withAccess";
import type { AuthContext } from "@/lib/auth/types";
import { NotFoundError } from "@/lib/auth/types";
import type { Zone } from "@prisma/client";
import { getZonesSchema } from "../types/forecast.schema";

// ─── Get All Zones ──────────────────────────────────────────
// Returns all active zones, optionally filtered by water type.

export const getZones = withAccess(
  async (_user: AuthContext, input?: { waterType?: "SALT" | "FRESH" }): Promise<Zone[]> => {
    const validated = getZonesSchema.parse(input ?? {});

    const zones = await prisma.zone.findMany({
      where: {
        isActive: true,
        ...(validated.waterType ? { waterType: validated.waterType } : {}),
      },
      orderBy: { name: "asc" },
    });

    return zones;
  }
);

// ─── Get Single Zone ────────────────────────────────────────
// Returns a single zone by its slug (URL-friendly name).

export const getZone = withAccess(
  async (_user: AuthContext, slug: string): Promise<Zone> => {
    const zone = await prisma.zone.findUnique({
      where: { slug },
    });

    if (!zone) throw new NotFoundError("Zone not found");

    return zone;
  }
);
