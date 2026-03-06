import type { SubscriptionTier } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: string[];
      subscriptionTier: SubscriptionTier;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    roles: string[];
    subscriptionTier: SubscriptionTier;
  }
}
