"use server";

import { prisma } from "@/lib/prisma";
import { withAccess } from "@/lib/middleware/withAccess";
import type { AuthContext } from "@/lib/auth/types";

export const getFavoriteZones = withAccess(
  async (user: AuthContext): Promise<string[]> => {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { favoriteZoneIds: true },
    });
    return dbUser?.favoriteZoneIds || [];
  }
);

export const addFavoriteZone = withAccess(
  async (user: AuthContext, zoneId: string) => {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { favoriteZoneIds: true },
    });

    const current = dbUser?.favoriteZoneIds || [];
    if (!current.includes(zoneId)) {
      await prisma.user.update({
        where: { id: user.userId },
        data: { favoriteZoneIds: [...current, zoneId] },
      });
    }

    return { success: true };
  }
);

export const removeFavoriteZone = withAccess(
  async (user: AuthContext, zoneId: string) => {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { favoriteZoneIds: true },
    });

    const current = dbUser?.favoriteZoneIds || [];
    await prisma.user.update({
      where: { id: user.userId },
      data: { favoriteZoneIds: current.filter((id) => id !== zoneId) },
    });

    return { success: true };
  }
);
