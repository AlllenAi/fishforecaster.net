"use server";

import { prisma } from "@/lib/prisma";
import { leadCaptureSchema } from "../types/lead.schema";

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

  return { success: true };
}
