import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";
import type { SubscriptionTier } from "@prisma/client";
import { authConfig } from "./auth.config";
import { checkLoginLimit } from "@/lib/middleware/rateLimit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          await checkLoginLimit(credentials.email as string);

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password) return null;

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) return null;

          if (user.twoFactorEnabled) {
            if (!credentials.twoFactorCode) return null;

            const isTwoFactorValid = speakeasy.totp.verify({
              secret: user.twoFactorSecret || "",
              encoding: "base32",
              token: credentials.twoFactorCode as string,
              window: 1,
            });

            if (!isTwoFactorValid) return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
            subscriptionTier: user.subscriptionTier,
          };
        } catch (error) {
          console.error("[Auth] authorize error:", error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // On initial sign-in, populate token from user
      if (user) {
        token.userId = user.id;
        token.roles = (user as Record<string, unknown>).roles as string[];
        token.subscriptionTier = (user as Record<string, unknown>)
          .subscriptionTier as string;
      }

      // On subsequent requests, refresh the tier from the database
      // so the session stays current after a Stripe purchase or trial expiry
      if (token.userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId as string },
          select: { subscriptionTier: true, trialEndsAt: true, roles: true },
        });
        if (dbUser) {
          token.roles = dbUser.roles;
          // Auto-expire trial: if trial has ended and no paid subscription, downgrade to FREE
          if (
            dbUser.trialEndsAt &&
            dbUser.trialEndsAt < new Date() &&
            dbUser.subscriptionTier !== "FREE"
          ) {
            const hasPaidSubscription = await prisma.subscription.findUnique({
              where: { userId: token.userId as string },
              select: { status: true },
            });

            if (!hasPaidSubscription || hasPaidSubscription.status !== "ACTIVE") {
              await prisma.user.update({
                where: { id: token.userId as string },
                data: { subscriptionTier: "FREE", trialEndsAt: null },
              });
              token.subscriptionTier = "FREE";
            } else {
              token.subscriptionTier = dbUser.subscriptionTier;
            }
          } else {
            token.subscriptionTier = dbUser.subscriptionTier;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.roles = token.roles as string[];
        session.user.subscriptionTier = token.subscriptionTier as SubscriptionTier;
      }
      return session;
    },
  },
});
