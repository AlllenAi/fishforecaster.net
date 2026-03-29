import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

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
          stripeCustomerId: true,
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

  // Fetch Stripe payment history if customer exists
  let stripePayments: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    description: string | null;
    created: number;
  }[] = [];

  if (subscription?.stripeCustomerId) {
    try {
      const charges = await stripe.charges.list({
        customer: subscription.stripeCustomerId,
        limit: 100,
      });
      stripePayments = charges.data.map((charge) => ({
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        description: charge.description,
        created: charge.created,
      }));
    } catch {
      // If Stripe is unreachable, still export local data
    }
  }

  return {
    exportDate: new Date().toISOString(),
    user,
    catchReports,
    subscription,
    consents,
    auditLogs,
    stripePayments,
  };
}
