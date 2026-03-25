import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

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
        if (!credentials?.email || !credentials?.password) return null;

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
      }
    }),
  ],
});
