// ─── Weekly Digest Cron Job ──────────────────────────────────
// Second exception to the "no API routes" rule.
// Cron jobs need HTTP endpoints. Runs every Monday at 6 AM.
//
// Vercel cron config in vercel.json:
// { "crons": [{ "path": "/api/cron/weekly-digest", "schedule": "0 6 * * 1" }] }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateForecast } from "@/modules/forecast/services/forecastOrchestrator";
import { sendWeeklyDigest } from "@/modules/email/serverActions/email.action";
import type { DigestDay } from "@/modules/email/types/email.schema";
import type { ForecastResult } from "@/modules/forecast/types/scoring.types";

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all active zones
    const zones = await prisma.zone.findMany({
      where: { isActive: true },
    });

    // Generate forecasts for the next 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allForecasts: Array<{
      forecast: ForecastResult;
      date: Date;
      waterType: "SALT" | "FRESH";
    }> = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);

      for (const zone of zones) {
        // Check cache first
        const existing = await prisma.forecast.findUnique({
          where: { zoneId_date: { zoneId: zone.id, date } },
        });

        if (existing) {
          allForecasts.push({
            forecast: {
              zoneId: zone.id,
              zoneName: zone.name,
              date: date.toISOString().split("T")[0],
              score: existing.score,
              label: existing.label,
              confidence: existing.confidence,
              biteWindows: existing.biteWindows as ForecastResult["biteWindows"],
              conditions: existing.conditions as ForecastResult["conditions"],
              captainCall: existing.captainCall ?? "",
              speciesScores: existing.speciesScores as ForecastResult["speciesScores"],
            },
            date,
            waterType: zone.waterType,
          });
        } else {
          try {
            const forecast = await generateForecast(zone, date);
            // Cache it
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
            allForecasts.push({ forecast, date, waterType: zone.waterType });
          } catch (err) {
            console.error(`[Cron] Failed to generate forecast for ${zone.name} on ${date.toISOString()}:`, err);
          }
        }
      }
    }

    // Pick top 3 days by highest score
    const sorted = allForecasts.sort((a, b) => b.forecast.score - a.forecast.score);
    const top3 = sorted.slice(0, 3);

    const topDays: DigestDay[] = top3.map((item) => {
      const dayName = item.date.toLocaleDateString("en-US", { weekday: "long" });
      const topSpecies = item.forecast.speciesScores[0]?.species || "Mixed species";
      const bestWindow = item.forecast.biteWindows[0]
        ? `${item.forecast.biteWindows[0].start} — ${item.forecast.biteWindows[0].end}`
        : "Check dashboard";

      return {
        date: item.forecast.date,
        dayName,
        zoneName: item.forecast.zoneName,
        score: item.forecast.score,
        label: item.forecast.label,
        topSpecies,
        bestWindow,
        waterType: item.waterType,
      };
    });

    // Calculate date range string
    const startDate = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endDate = new Date(today.getTime() + 6 * 86400000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const dateRange = `${startDate} — ${endDate}`;

    // Send the digest
    const result = await sendWeeklyDigest(topDays, dateRange);

    console.log(`[Cron] Weekly digest sent to ${result.sent} recipients`);

    return NextResponse.json({
      success: true,
      sent: result.sent,
      topDays: topDays.map((d) => `${d.dayName}: ${d.zoneName} (${d.score})`),
    });
  } catch (err) {
    console.error("[Cron] Weekly digest failed:", err);
    return NextResponse.json({ error: "Digest generation failed" }, { status: 500 });
  }
}
