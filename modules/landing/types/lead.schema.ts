import { z } from "zod";

export const leadCaptureSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fishingType: z.enum(["salt", "fresh", "both"]).default("both"),
});

export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;
