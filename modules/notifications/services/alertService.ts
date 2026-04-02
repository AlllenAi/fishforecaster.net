import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { generateForecast } from "@/modules/forecast/services/forecastOrchestrator";
import { sendBatchEmails } from "@/modules/email/services/emailService";
import {
  sendBatchPushNotifications,
  type PushPayload,
} from "./pushService";
import { renderHighScoreAlertEmail } from "../templates/HighScoreAlertEmail";
import { renderBiteWindowAlertEmail } from "../templates/BiteWindowAlertEmail";
import type { ForecastResult } from "@/modules/forecast/types/scoring.types";
import type {
  HighScoreAlert,
  BiteWindowAlert,
} from "../types/notification.schema";
import type webpush from "web-push";

const BASE_URL = process.env.AUTH_URL || "http://localhost:3000";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ─── Core: Check forecasts and send alerts ──────────────

export async function processAlerts(): Promise<{
  highScoreSent: number;
  biteWindowSent: number;
  pushSent: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Get all active zones
  const zones = await prisma.zone.findMany({ where: { isActive: true } });

  // 2. Generate or fetch today's forecasts
  const forecasts: Array<{
    forecast: ForecastResult;
    zoneSlug: string;
    waterType: "SALT" | "FRESH";
  }> = [];

  for (const zone of zones) {
    const existing = await prisma.forecast.findUnique({
      where: { zoneId_date: { zoneId: zone.id, date: today } },
    });

    if (existing) {
      forecasts.push({
        forecast: {
          zoneId: zone.id,
          zoneName: zone.name,
          date: today.toISOString().split("T")[0],
          score: existing.score,
          label: existing.label,
          confidence: existing.confidence,
          biteWindows:
            existing.biteWindows as ForecastResult["biteWindows"],
          conditions: existing.conditions as ForecastResult["conditions"],
          captainCall: existing.captainCall ?? "",
          speciesScores:
            existing.speciesScores as ForecastResult["speciesScores"],
        },
        zoneSlug: zone.slug,
        waterType: zone.waterType,
      });
    } else {
      try {
        const forecast = await generateForecast(zone, today);
        // Cache it
        await prisma.forecast.create({
          data: {
            zoneId: zone.id,
            date: today,
            score: forecast.score,
            label: forecast.label,
            confidence: forecast.confidence,
            biteWindows: forecast.biteWindows as any[],
            conditions: forecast.conditions as any,
            captainCall: forecast.captainCall,
            speciesScores: forecast.speciesScores as any[],
          },
        });
        forecasts.push({
          forecast,
          zoneSlug: zone.slug,
          waterType: zone.waterType,
        });
      } catch (err) {
        console.error(
          `[Alerts] Failed to generate forecast for ${zone.name}:`,
          err
        );
      }
    }
  }

  // 3. Get users who want alerts and have favorite zones
  const alertUsers = await prisma.user.findMany({
    where: {
      OR: [{ notifyHighScore: true }, { notifyBiteWindow: true }],
      favoriteZoneIds: { isEmpty: false },
    },
    select: {
      id: true,
      email: true,
      name: true,
      favoriteZoneIds: true,
      notifyHighScore: true,
      notifyBiteWindow: true,
      highScoreThreshold: true,
      unsubscribeToken: true,
      subscriptionTier: true,
      pushSubscription: true,
    },
  });

  const highScoreBatch: Array<{
    to: string;
    subject: string;
    html: string;
  }> = [];
  const biteWindowBatch: Array<{
    to: string;
    subject: string;
    html: string;
  }> = [];
  const pushBatch: Array<{
    subscription: webpush.PushSubscription;
    payload: PushPayload;
  }> = [];

  for (const user of alertUsers) {
    // Find forecasts matching user's favorite zones
    const userForecasts = forecasts.filter((f) =>
      user.favoriteZoneIds.includes(f.forecast.zoneId)
    );

    if (userForecasts.length === 0) continue;

    // Ensure unsubscribe token exists
    let token = user.unsubscribeToken;
    if (!token) {
      token = generateToken();
      await prisma.user.update({
        where: { id: user.id },
        data: { unsubscribeToken: token },
      });
    }
    const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${token}&type=user`;

    // HIGH SCORE ALERTS
    if (user.notifyHighScore) {
      const threshold = user.highScoreThreshold;
      const highScoreAlerts: HighScoreAlert[] = userForecasts
        .filter((f) => f.forecast.score >= threshold)
        .map((f) => ({
          zoneName: f.forecast.zoneName,
          zoneSlug: f.zoneSlug,
          score: f.forecast.score,
          label: f.forecast.label,
          topSpecies:
            f.forecast.speciesScores[0]?.species || "Mixed species",
          bestWindow: f.forecast.biteWindows[0]
            ? `${f.forecast.biteWindows[0].start} — ${f.forecast.biteWindows[0].end}`
            : "Check dashboard",
          captainCall: f.forecast.captainCall,
          waterType: f.waterType,
        }));

      if (highScoreAlerts.length > 0) {
        const html = await renderHighScoreAlertEmail({
          alerts: highScoreAlerts,
          threshold,
          baseUrl: BASE_URL,
          unsubscribeUrl,
        });

        highScoreBatch.push({
          to: user.email,
          subject: `🔥 ${highScoreAlerts.length} zone${highScoreAlerts.length > 1 ? "s" : ""} scored above ${threshold} today!`,
          html,
        });
      }
    }

    // BITE WINDOW ALERTS
    if (user.notifyBiteWindow) {
      const windowAlerts: BiteWindowAlert[] = userForecasts
        .filter(
          (f) =>
            f.forecast.biteWindows.length > 0 &&
            f.forecast.biteWindows.some((w) => w.strength === "STRONG")
        )
        .map((f) => ({
          zoneName: f.forecast.zoneName,
          zoneSlug: f.zoneSlug,
          score: f.forecast.score,
          label: f.forecast.label,
          windows: f.forecast.biteWindows
            .filter((w) => w.strength === "STRONG" || w.strength === "MODERATE")
            .map((w) => ({
              start: w.start,
              end: w.end,
              strength: w.strength,
              factors: w.factors,
            })),
          waterType: f.waterType,
        }));

      if (windowAlerts.length > 0) {
        const html = await renderBiteWindowAlertEmail({
          alerts: windowAlerts,
          baseUrl: BASE_URL,
          unsubscribeUrl,
        });

        biteWindowBatch.push({
          to: user.email,
          subject: `🎯 Strong bite windows in ${windowAlerts.length} zone${windowAlerts.length > 1 ? "s" : ""} today`,
          html,
        });
      }
    }

    // PUSH NOTIFICATIONS (in addition to email)
    if (user.pushSubscription) {
      const sub = user.pushSubscription as unknown as webpush.PushSubscription;
      const matchedForecasts = forecasts.filter((f) =>
        user.favoriteZoneIds.includes(f.forecast.zoneId)
      );
      const topForecast = matchedForecasts.sort(
        (a, b) => b.forecast.score - a.forecast.score
      )[0];

      if (topForecast && topForecast.forecast.score >= user.highScoreThreshold) {
        pushBatch.push({
          subscription: sub,
          payload: {
            title: `${topForecast.forecast.zoneName}: ${topForecast.forecast.score}/100`,
            body: `${topForecast.forecast.label} conditions — ${topForecast.forecast.captainCall.slice(0, 100)}`,
            url: `/dashboard/zone/${topForecast.zoneSlug}`,
          },
        });
      }
    }
  }

  // 4. Send all alerts
  if (highScoreBatch.length > 0) {
    console.warn(
      `[Alerts] Sending high-score alerts to ${highScoreBatch.length} users`
    );
    await sendBatchEmails(highScoreBatch);
  }

  if (biteWindowBatch.length > 0) {
    console.warn(
      `[Alerts] Sending bite-window alerts to ${biteWindowBatch.length} users`
    );
    await sendBatchEmails(biteWindowBatch);
  }

  // 5. Send push notifications
  let pushSent = 0;
  if (pushBatch.length > 0) {
    console.warn(
      `[Alerts] Sending push notifications to ${pushBatch.length} users`
    );
    try {
      pushSent = await sendBatchPushNotifications(pushBatch);
    } catch (err) {
      console.error("[Alerts] Push notifications failed:", err);
    }
  }

  return {
    highScoreSent: highScoreBatch.length,
    biteWindowSent: biteWindowBatch.length,
    pushSent,
  };
}
