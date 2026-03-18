"use server";

import { prisma } from "@/lib/prisma";
import { leadCaptureSchema } from "../types/lead.schema";
import { sendLeadMagnet } from "@/modules/email/serverActions/email.action";

export async function captureLead(input: { email: string }) {
  const validated = leadCaptureSchema.parse(input);

  // Upsert: create if new, update if exists (no error on duplicate)
  await prisma.lead.upsert({
    where: { email: validated.email },
    update: { subscribedToNewsletter: true },
    create: {
      email: validated.email,
      source: "landing_page",
      subscribedToNewsletter: true,
    },
  });

  // Send lead magnet cheat sheet email (fire and forget)
  sendLeadMagnet(validated.email).catch((err) =>
    console.error("[Lead] Failed to send lead magnet email:", err)
  );

  return { success: true };
}
