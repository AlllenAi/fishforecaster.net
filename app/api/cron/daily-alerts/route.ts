// ─── Daily Alerts Cron Job ───────────────────────────────────
// Runs every day at 5:30 AM PT (before sunrise fishing).
// Checks today's forecasts against each user's favorite zones
// and notification preferences, then sends email alerts.
//
// Vercel cron config in vercel.json:
// { "crons": [{ "path": "/api/cron/daily-alerts", "schedule": "30 12 * * *" }] }
// (12:30 UTC = 5:30 AM PT)

import { NextRequest, NextResponse } from "next/server";
import { processAlerts } from "@/modules/notifications/services/alertService";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processAlerts();

    console.warn(
      `[Cron] Daily alerts: ${result.highScoreSent} high-score, ${result.biteWindowSent} bite-window emails, ${result.pushSent} push sent`
    );

    return NextResponse.json({
      success: true,
      highScoreSent: result.highScoreSent,
      biteWindowSent: result.biteWindowSent,
      pushSent: result.pushSent,
    });
  } catch (err) {
    console.error("[Cron] Daily alerts failed:", err);
    return NextResponse.json(
      { error: "Alert processing failed" },
      { status: 500 }
    );
  }
}
