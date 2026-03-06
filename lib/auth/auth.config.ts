import type { NextAuthConfig } from "next-auth";
import type { SubscriptionTier } from "@prisma/client";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isAuthRoute =
        nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      if (isOnDashboard && !isLoggedIn) {
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.roles = (user as Record<string, unknown>).roles as string[];
        token.subscriptionTier = (user as Record<string, unknown>)
          .subscriptionTier as SubscriptionTier;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.roles = token.roles as string[];
        session.user.subscriptionTier =
          token.subscriptionTier as SubscriptionTier;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
