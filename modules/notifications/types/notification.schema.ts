import { z } from "zod";

// ─── Notification Preferences ───────────────────────────

export const notificationPreferencesSchema = z.object({
  notifyHighScore: z.boolean(),
  notifyBiteWindow: z.boolean(),
  highScoreThreshold: z.number().int().min(50).max(100),
});

export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;

// ─── Alert Data ─────────────────────────────────────────

export interface HighScoreAlert {
  zoneName: string;
  zoneSlug: string;
  score: number;
  label: string;
  topSpecies: string;
  bestWindow: string;
  captainCall: string;
  waterType: "SALT" | "FRESH";
}

export interface BiteWindowAlert {
  zoneName: string;
  zoneSlug: string;
  score: number;
  label: string;
  windows: Array<{
    start: string;
    end: string;
    strength: string;
    factors: string[];
  }>;
  waterType: "SALT" | "FRESH";
}
