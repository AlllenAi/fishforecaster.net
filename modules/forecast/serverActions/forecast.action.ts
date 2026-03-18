// ─── Forecast Server Actions ────────────────────────────────
//
// "Server Actions" are functions that run on the server (not in the browser).
// They're how Next.js lets you do backend work without building a separate API.
//
// These are wrapped with withAccess() so only logged-in users can call them.
// The withPermission() wrapper adds role-based checks (e.g., admin only).

"use server";

import { prisma } from "@/lib/prisma";
import { withAccess } from "@/lib/middleware/withAccess";
import { withPermission } from "@/lib/middleware/withPermission";
import type { AuthContext } from "@/lib/auth/types";
import { NotFoundError, PermissionError } from "@/lib/auth/types";
import { generateForecast } from "../services/forecastOrchestrator";
import { getForecastSchema, refreshForecastSchema } from "../types/forecast.schema";
import type { ForecastResult } from "../types/scoring.types";
import { checkTierAccess } from "@/modules/subscription/types/subscription.schema";

// ─── Get Forecast for a Single Zone ─────────────────────────
// Returns the forecast for a specific zone and date.
// If we already computed it today, returns the cached version from the DB.
// Otherwise, generates a fresh forecast.

export const getForecast = withAccess(
  async (user: AuthContext, input: { zoneId: string; date?: string }): Promise<ForecastResult> => {
    const validated = getForecastSchema.parse(input);

    // Find the zone
    const zone = await prisma.zone.findUnique({
      where: { id: validated.zoneId },
    });

    if (!zone) throw new NotFoundError("Zone not found");

    // Check subscription tier access
    if (!checkTierAccess(user.subscriptionTier, zone.waterType)) {
      const planNeeded = zone.waterType === "FRESH" ? "Freshwater" : "Saltwater";
      throw new PermissionError(
        `Upgrade to the ${planNeeded} or All Access plan to view this forecast`
      );
    }

    // Determine the date (default to today)
    const date = validated.date ? new Date(validated.date) : new Date();
    date.setHours(0, 0, 0, 0);

    // Check if we already have a cached forecast for this zone+date
    const existing = await prisma.forecast.findUnique({
      where: {
        zoneId_date: {
          zoneId: zone.id,
          date,
        },
      },
    });

    if (existing) {
      // Return the cached forecast
      return {
        zoneId: zone.id,
        zoneName: zone.name,
        date: validated.date ?? date.toISOString().split("T")[0],
        score: existing.score,
        label: existing.label,
        confidence: existing.confidence,
        biteWindows: existing.biteWindows as ForecastResult["biteWindows"],
        conditions: existing.conditions as ForecastResult["conditions"],
        captainCall: existing.captainCall ?? "",
        speciesScores: existing.speciesScores as ForecastResult["speciesScores"],
      };
    }

    // Generate a fresh forecast
    const forecast = await generateForecast(zone, date);

    // Save to database for caching
    await prisma.forecast.create({
      data: {
        zoneId: zone.id,
        date,
        score: forecast.score,
        label: forecast.label,
        confidence: forecast.confidence,
        biteWindows: forecast.biteWindows as any[],
        conditions: forecast.conditions as any,
        captainCall: forecast.captainCall,
        speciesScores: forecast.speciesScores as any[],
      },
    });

    return forecast;
  }
);

// ─── Get Forecasts for All Zones ────────────────────────────
// Returns forecasts for every active zone on a given date.
// Used for the main dashboard view.

export const getForecasts = withAccess(
  async (user: AuthContext, input?: { date?: string }): Promise<(ForecastResult & { locked?: boolean })[]> => {
    const date = input?.date ? new Date(input.date) : new Date();
    date.setHours(0, 0, 0, 0);

    // Get all active zones
    const zones = await prisma.zone.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    // Generate forecasts for all zones in parallel
    const forecasts = await Promise.all(
      zones.map(async (zone) => {
        const hasAccess = checkTierAccess(user.subscriptionTier, zone.waterType);

        // Check cache first
        const existing = await prisma.forecast.findUnique({
          where: {
            zoneId_date: {
              zoneId: zone.id,
              date,
            },
          },
        });

        if (existing) {
          const result = {
            zoneId: zone.id,
            zoneName: zone.name,
            date: date.toISOString().split("T")[0],
            score: hasAccess ? existing.score : 0,
            label: hasAccess ? existing.label : ("POOR" as const),
            confidence: existing.confidence,
            biteWindows: hasAccess ? (existing.biteWindows as ForecastResult["biteWindows"]) : [],
            conditions: hasAccess ? (existing.conditions as ForecastResult["conditions"]) : ({} as ForecastResult["conditions"]),
            captainCall: hasAccess ? (existing.captainCall ?? "") : "Upgrade to unlock this forecast",
            speciesScores: hasAccess ? (existing.speciesScores as ForecastResult["speciesScores"]) : [],
            locked: !hasAccess,
          };
          return result;
        }

        // Generate fresh
        const forecast = await generateForecast(zone, date);

        // Cache in DB
        await prisma.forecast.create({
          data: {
            zoneId: zone.id,
            date,
            score: forecast.score,
            label: forecast.label,
            confidence: forecast.confidence,
            biteWindows: forecast.biteWindows as any[],
            conditions: forecast.conditions as any,
            captainCall: forecast.captainCall,
            speciesScores: forecast.speciesScores as any[],
          },
        });

        // If locked, return teaser data
        if (!hasAccess) {
          return {
            ...forecast,
            score: 0,
            label: "POOR" as const,
            biteWindows: [],
            conditions: {} as ForecastResult["conditions"],
            captainCall: "Upgrade to unlock this forecast",
            speciesScores: [],
            locked: true,
          };
        }

        return { ...forecast, locked: false };
      })
    );

    return forecasts;
  }
);

// ─── Refresh Forecast (Admin Only) ──────────────────────────
// Force re-generate a forecast even if one is cached.
// Only admins can do this.

export const refreshForecast = withPermission("forecasts.refresh")(
  async (_user: AuthContext, input: { zoneId: string; date: string }): Promise<ForecastResult> => {
    const validated = refreshForecastSchema.parse(input);

    const zone = await prisma.zone.findUnique({
      where: { id: validated.zoneId },
    });

    if (!zone) throw new NotFoundError("Zone not found");

    const date = new Date(validated.date);
    date.setHours(0, 0, 0, 0);

    // Delete existing cached forecast
    await prisma.forecast.deleteMany({
      where: {
        zoneId: zone.id,
        date,
      },
    });

    // Generate fresh
    const forecast = await generateForecast(zone, date);

    // Save to DB
    await prisma.forecast.create({
      data: {
        zoneId: zone.id,
        date,
        score: forecast.score,
        label: forecast.label,
        confidence: forecast.confidence,
        biteWindows: forecast.biteWindows as any[],
        conditions: forecast.conditions as any,
        captainCall: forecast.captainCall,
        speciesScores: forecast.speciesScores as any[],
      },
    });

    return forecast;
  }
);
