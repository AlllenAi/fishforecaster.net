import { z } from "zod";

export const catchReportSchema = z.object({
  species: z.string().min(1, "Species is required"),
  zoneId: z.string().min(1, "Zone is required"),
  location: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  caughtAt: z.coerce.date(),
  lure: z.string().optional(),
  weight: z.number().positive().optional(),
  photoUrl: z.string().url().optional(),
  notes: z.string().max(500).optional(),
});

export type CatchReportInput = z.infer<typeof catchReportSchema>;

export const updateCatchReportSchema = catchReportSchema.partial().extend({
  id: z.string().min(1),
});

export type UpdateCatchReportInput = z.infer<typeof updateCatchReportSchema>;

export interface CatchReportWithUser {
  id: string;
  species: string;
  zoneId: string;
  zoneName: string;
  location: { lat: number; lon: number };
  caughtAt: Date;
  lure: string | null;
  weight: number | null;
  photoUrl: string | null;
  notes: string | null;
  isVerified: boolean;
  createdAt: Date;
  userName: string;
}

export interface CatchStatsResult {
  topSpecies: Array<{ species: string; count: number }>;
  hotZones: Array<{ zoneName: string; zoneId: string; count: number }>;
  recentCount: number;
  totalCount: number;
}
