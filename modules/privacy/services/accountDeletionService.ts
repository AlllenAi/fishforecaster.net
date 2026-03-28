import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { del } from "@vercel/blob";

export async function deleteUserAccount(userId: string) {
  // 1. Get user's subscription for Stripe cleanup
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
  });

  // 2. Delete Stripe customer if one exists
  if (subscription?.stripeCustomerId) {
    try {
      await stripe.customers.del(subscription.stripeCustomerId);
    } catch (err) {
      console.error("[Privacy] Failed to delete Stripe customer:", err);
      // Continue with account deletion even if Stripe fails
    }
  }

  // 3. Delete uploaded photos from Vercel Blob
  const catchReports = await prisma.catchReport.findMany({
    where: { userId },
    select: { photoUrl: true },
  });
  const photoUrls = catchReports
    .map((r) => r.photoUrl)
    .filter((url): url is string => !!url);

  if (photoUrls.length > 0) {
    try {
      await del(photoUrls);
    } catch (err) {
      console.error("[Privacy] Failed to delete photos from blob storage:", err);
    }
  }

  // 4. Anonymize audit logs (keep for legal records, remove identity)
  await prisma.auditLog.updateMany({
    where: { actorId: userId },
    data: { actorEmail: "deleted-user", actorId: "000000000000000000000000" },
  });

  // 5. Anonymize consent records (keep for compliance proof)
  await prisma.consent.updateMany({
    where: { userId },
    data: { userId: null },
  });

  // 6. Delete related records (MongoDB doesn't auto-cascade)
  await prisma.catchReport.deleteMany({ where: { userId } });
  await prisma.subscription.deleteMany({ where: { userId } });
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.account.deleteMany({ where: { userId } });

  // 7. Delete the user
  await prisma.user.delete({ where: { id: userId } });
}
