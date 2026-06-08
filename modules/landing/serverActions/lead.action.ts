"use server";

import { prisma } from "@/lib/prisma";
import { leadCaptureSchema } from "../types/lead.schema";
import { sendLeadMagnet } from "@/modules/email/serverActions/email.action";

export async function captureLead(input: { email: string; fishingType?: string }) {
  const validated = leadCaptureSchema.parse(input);

  await prisma.lead.upsert({
    where: { email: validated.email },
    update: { subscribedToNewsletter: true, fishingType: validated.fishingType },
    create: {
      email: validated.email,
      source: "landing_page",
      subscribedToNewsletter: true,
      fishingType: validated.fishingType,
    },
  });

  sendLeadMagnet(validated.email, validated.fishingType).catch((err) =>
    console.error("[Lead] Failed to send lead magnet email:", err)
  );

  return { success: true };
}
