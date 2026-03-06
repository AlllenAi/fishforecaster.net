import { z } from "zod";

export const leadCaptureSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;
