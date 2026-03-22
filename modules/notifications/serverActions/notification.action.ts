"use server";

import { withAccess } from "@/lib/middleware/withAccess";
import type { AuthContext } from "@/lib/auth/types";
import { prisma } from "@/lib/prisma";
import {
  notificationPreferencesSchema,
  type NotificationPreferences,
} from "../types/notification.schema";

// ─── Get Notification Preferences ───────────────────────

export const getNotificationPreferences = withAccess(
  async (user: AuthContext): Promise<NotificationPreferences> => {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        notifyHighScore: true,
        notifyBiteWindow: true,
        highScoreThreshold: true,
      },
    });

    return {
      notifyHighScore: dbUser?.notifyHighScore ?? true,
      notifyBiteWindow: dbUser?.notifyBiteWindow ?? true,
      highScoreThreshold: dbUser?.highScoreThreshold ?? 80,
    };
  }
);

// ─── Update Notification Preferences ────────────────────

export const updateNotificationPreferences = withAccess(
  async (user: AuthContext, input: NotificationPreferences) => {
    const validated = notificationPreferencesSchema.parse(input);

    await prisma.user.update({
      where: { id: user.userId },
      data: {
        notifyHighScore: validated.notifyHighScore,
        notifyBiteWindow: validated.notifyBiteWindow,
        highScoreThreshold: validated.highScoreThreshold,
      },
    });

    return { success: true };
  }
);
