import { auth } from "@/lib/auth/auth";
import { PricingPageClient } from "./PricingPageClient";
import type { SubscriptionTier } from "@prisma/client";

export default async function PricingPage() {
  const session = await auth();

  const currentTier = (session?.user?.subscriptionTier as SubscriptionTier) ?? null;

  return <PricingPageClient currentTier={currentTier} />;
}
