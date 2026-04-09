"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema, passwordSchema, type RegisterInput } from "../types/auth.schema";
// Error types are handled via try-catch with error return pattern
import { sendWelcomeEmail } from "@/modules/email/serverActions/email.action";
import { sendEmail } from "@/modules/email/services/emailService";
import speakeasy from "speakeasy";
import {
  checkRegisterLimit,
  checkPasswordResetLimit,
  checkTwoFactorLimit,
} from "@/lib/middleware/rateLimit";
import {
  PRIVACY_POLICY_VERSION,
  TERMS_VERSION,
} from "@/modules/privacy/types/privacy.schema";

export async function register(input: RegisterInput): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { name, email, password } = parsed.data;

    await checkRegisterLimit(email);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "An account with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roles: ["user"],
        subscriptionTier: "ALL_ACCESS",
        trialEndsAt,
        unsubscribeToken: crypto.randomBytes(32).toString("hex"),
      },
    });

    // Record GDPR consent (terms + privacy policy acceptance)
    await prisma.consent.createMany({
      data: [
        { userId: user.id, type: "terms", version: TERMS_VERSION, granted: true },
        { userId: user.id, type: "privacy", version: PRIVACY_POLICY_VERSION, granted: true },
      ],
    });

    // Send welcome email (fire and forget)
    sendWelcomeEmail(user.id).catch((err) =>
      console.error("[Auth] Failed to send welcome email:", err)
    );

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("[Auth] Registration error:", error);
    const message = error instanceof Error ? error.message : "Registration failed";
    return { success: false, error: message };
  }
}

export async function setupTwoFactor(email: string) {
  if (!email) throw new Error("Email is required");

  await checkTwoFactorLimit(email);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const secret = speakeasy.generateSecret({ length: 20 });

  await prisma.user.update({
    where: { email },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret.base32,
    },
  });

  return {
    otpauthUrl: secret.otpauth_url,
    ascii: secret.ascii,
    base32: secret.base32,
  };
}

export async function verifyTwoFactorCode(email: string, code: string) {
  if (!email || !code) {
    return { success: false, message: "Email and 2FA code are required" };
  }

  await checkTwoFactorLimit(email);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return { success: false, message: "Two-factor not enabled for this account" };
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 1,
  });

  if (!verified) {
    return { success: false, message: "Invalid two-factor authentication code" };
  }

  return { success: true };
}

export async function sendPasswordResetRequest(email: string) {
  if (!email) {
    return { success: false, message: "Email is required" };
  }

  await checkPasswordResetLimit(email);

  const user = await prisma.user.findUnique({ where: { email } });
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/login/reset-password?token=${token}`;

  if (user) {
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: token,
        passwordResetExpiresAt: expiresAt,
      },
    });

    const html = `
      <p>Hello ${user.name || "Angler"},</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `;

    await sendEmail(user.email, "Password reset request", html);
  }

  return {
    success: true,
    message: "If that account exists, a password reset link has been sent.",
  };
}

export async function updateForgottenPassword(token: string, newPassword: string) {
  if (!token) {
    return { success: false, error: "Invalid token" };
  }

  const passwordResult = passwordSchema.safeParse(newPassword);
  if (!passwordResult.success) {
    return { success: false, error: passwordResult.error.issues[0].message };
  }

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    return { success: false, error: "Invalid or expired password reset token" };
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  return { success: true as const };
}

export async function checkTwoFactorRequired(email: string): Promise<boolean> {
  if (!email) return false;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { twoFactorEnabled: true },
  });

  return user?.twoFactorEnabled ?? false;
}

export async function disableTwoFactor(email: string) {
  if (!email) {
    throw new Error("Email is required");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  await prisma.user.update({
    where: { email },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  return { success: true };
}
