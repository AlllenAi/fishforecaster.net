"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { withAccess } from "@/lib/middleware/withAccess";
import { withPermission } from "@/lib/middleware/withPermission";
import type { AuthContext } from "@/lib/auth/types";
import { sendEmail, sendBatchEmails } from "../services/emailService";
import { renderLeadMagnetEmail } from "../templates/LeadMagnetEmail";
import { renderWelcomeEmail } from "../templates/WelcomeEmail";
import { renderWeeklyDigestEmail } from "../templates/WeeklyDigestEmail";
import { emailPreferencesSchema } from "../types/email.schema";
import type { DigestDay } from "../types/email.schema";

const BASE_URL = process.env.AUTH_URL || "http://localhost:3000";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ─── Send Lead Magnet Email ──────────────────────────────────

export async function sendLeadMagnet(email: string) {
  // Get or create unsubscribe token for this lead
  const lead = await prisma.lead.findUnique({ where: { email } });
  let token = lead?.unsubscribeToken;

  if (!token) {
    token = generateToken();
    await prisma.lead.update({
      where: { email },
      data: { unsubscribeToken: token },
    });
  }

  const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${token}&type=lead`;

  const html = await renderLeadMagnetEmail({ baseUrl: BASE_URL, unsubscribeUrl });

  const result = await sendEmail(
    email,
    "Your SoCal Bite Window Cheat Sheet",
    html
  );

  if (!result.success) {
    console.error(`[Email] Failed to send lead magnet to ${email}`);
  }

  return result;
}

// ─── Send Welcome Email ──────────────────────────────────────

export async function sendWelcomeEmail(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false };

  const html = await renderWelcomeEmail({
    name: user.name || "Angler",
    baseUrl: BASE_URL,
  });

  const result = await sendEmail(
    user.email,
    "Welcome to The Fish Forecaster",
    html
  );

  if (!result.success) {
    console.error(`[Email] Failed to send welcome email to ${user.email}`);
  }

  return result;
}

// ─── Send Weekly Digest ──────────────────────────────────────
// This is called by the cron job endpoint.

export async function sendWeeklyDigest(topDays: DigestDay[], dateRange: string) {
  // Get all eligible recipients:
  // 1. Users who are subscribed to digest
  // 2. Leads who are subscribed to newsletter
  const [users, leads] = await Promise.all([
    prisma.user.findMany({
      where: { subscribedToDigest: true },
      select: { email: true, unsubscribeToken: true, id: true },
    }),
    prisma.lead.findMany({
      where: { subscribedToNewsletter: true },
      select: { email: true, unsubscribeToken: true, id: true },
    }),
  ]);

  // Ensure tokens exist
  const userEmails = new Set<string>();
  const emailBatch: Array<{ to: string; subject: string; html: string }> = [];

  for (const user of users) {
    let token = user.unsubscribeToken;
    if (!token) {
      token = generateToken();
      await prisma.user.update({
        where: { id: user.id },
        data: { unsubscribeToken: token },
      });
    }

    const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${token}&type=user`;
    const html = await renderWeeklyDigestEmail({
      dateRange,
      topDays,
      baseUrl: BASE_URL,
      unsubscribeUrl,
    });

    emailBatch.push({
      to: user.email,
      subject: `This Week's Hot Fishing Days — ${dateRange}`,
      html,
    });
    userEmails.add(user.email);
  }

  // Add leads (skip if they're also a user)
  for (const lead of leads) {
    if (userEmails.has(lead.email)) continue;

    let token = lead.unsubscribeToken;
    if (!token) {
      token = generateToken();
      await prisma.lead.update({
        where: { id: lead.id },
        data: { unsubscribeToken: token },
      });
    }

    const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${token}&type=lead`;
    const html = await renderWeeklyDigestEmail({
      dateRange,
      topDays,
      baseUrl: BASE_URL,
      unsubscribeUrl,
    });

    emailBatch.push({
      to: lead.email,
      subject: `This Week's Hot Fishing Days — ${dateRange}`,
      html,
    });
  }

  console.warn(`[Email] Sending weekly digest to ${emailBatch.length} recipients`);
  await sendBatchEmails(emailBatch);

  return { sent: emailBatch.length };
}

// ─── Update Email Preferences ────────────────────────────────

export const updateEmailPreferences = withAccess(
  async (
    user: AuthContext,
    input: { weeklyDigest: boolean; productUpdates: boolean }
  ) => {
    const validated = emailPreferencesSchema.parse(input);

    await prisma.user.update({
      where: { id: user.userId },
      data: {
        subscribedToDigest: validated.weeklyDigest,
        subscribedToUpdates: validated.productUpdates,
      },
    });

    return { success: true };
  }
);

// ─── Get Email Preferences ──────────────────────────────────

export const getEmailPreferences = withAccess(
  async (user: AuthContext) => {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { subscribedToDigest: true, subscribedToUpdates: true },
    });

    return {
      weeklyDigest: dbUser?.subscribedToDigest ?? true,
      productUpdates: dbUser?.subscribedToUpdates ?? true,
    };
  }
);

// ─── Unsubscribe ─────────────────────────────────────────────

export async function unsubscribe(token: string, type: "user" | "lead") {
  if (type === "user") {
    const user = await prisma.user.findUnique({
      where: { unsubscribeToken: token },
    });
    if (!user) return { success: false, message: "Invalid unsubscribe link" };

    await prisma.user.update({
      where: { id: user.id },
      data: { subscribedToDigest: false, subscribedToUpdates: false },
    });

    return { success: true, message: "You have been unsubscribed from all emails." };
  }

  if (type === "lead") {
    const lead = await prisma.lead.findUnique({
      where: { unsubscribeToken: token },
    });
    if (!lead) return { success: false, message: "Invalid unsubscribe link" };

    await prisma.lead.update({
      where: { id: lead.id },
      data: { subscribedToNewsletter: false },
    });

    return { success: true, message: "You have been unsubscribed from all emails." };
  }

  return { success: false, message: "Invalid request" };
}
