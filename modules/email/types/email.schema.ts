import { z } from "zod";

export const emailPreferencesSchema = z.object({
  weeklyDigest: z.boolean(),
  productUpdates: z.boolean(),
});

export type EmailPreferences = z.infer<typeof emailPreferencesSchema>;

export interface DigestDay {
  date: string;
  dayName: string;
  zoneName: string;
  score: number;
  label: string;
  topSpecies: string;
  bestWindow: string;
  waterType: "SALT" | "FRESH";
}
