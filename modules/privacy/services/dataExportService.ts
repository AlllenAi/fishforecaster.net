import { prisma } from "@/lib/prisma";

export async function gatherUserData(userId: string) {
  const [user, catchReports, subscription, consents, auditLogs] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          image: true,
          roles: true,
          subscriptionTier: true,
          subscribedToDigest: true,
          subscribedToUpdates: true,
          favoriteZoneIds: true,
          notifyHighScore: true,
          notifyBiteWindow: true,
          highScoreThreshold: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.catchReport.findMany({
        where: { userId, isDeleted: false },
        select: {
          id: true,
          species: true,
          location: true,
          caughtAt: true,
          lure: true,
          weight: true,
          photoUrl: true,
          notes: true,
          createdAt: true,
        },
      }),
      prisma.subscription.findFirst({
        where: { userId },
        select: {
          plan: true,
          status: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          createdAt: true,
        },
      }),
      prisma.consent.findMany({
        where: { userId },
        select: {
          type: true,
          version: true,
          granted: true,
          createdAt: true,
        },
      }),
      prisma.auditLog.findMany({
        where: { actorId: userId },
        select: {
          action: true,
          targetType: true,
          targetId: true,
          details: true,
          createdAt: true,
        },
      }),
    ]);

  return {
    exportDate: new Date().toISOString(),
    user,
    catchReports,
    subscription,
    consents,
    auditLogs,
  };
}
