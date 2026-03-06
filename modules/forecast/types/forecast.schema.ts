// Zod schemas are like "validators" — they check that data has the right shape
// at runtime (when the app is actually running). TypeScript types only check
// at build time, but Zod catches bad data from APIs or user input.

import { z } from "zod";

// Schema for requesting a forecast
export const getForecastSchema = z.object({
  zoneId: z.string().min(1, "Zone ID is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format")
    .optional(),
});

export type GetForecastInput = z.infer<typeof getForecastSchema>;

// Schema for listing zones with optional filter
export const getZonesSchema = z.object({
  waterType: z.enum(["SALT", "FRESH"]).optional(),
});

export type GetZonesInput = z.infer<typeof getZonesSchema>;

// Schema for refreshing a forecast (admin only)
export const refreshForecastSchema = z.object({
  zoneId: z.string().min(1, "Zone ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
});

export type RefreshForecastInput = z.infer<typeof refreshForecastSchema>;
