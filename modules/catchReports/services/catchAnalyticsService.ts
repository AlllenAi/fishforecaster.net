import { prisma } from "@/lib/prisma";

// ─── Score Accuracy Analysis ─────────────────────────────────
// Compare predicted bite scores to actual catch reports.

export async function calculateScoreAccuracy(
  zoneId: string,
  startDate: Date,
  endDate: Date
) {
  // Get forecasts for the date range
  const forecasts = await prisma.forecast.findMany({
    where: {
      zoneId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  });

  // Get catch reports for the same range
  const catches = await prisma.catchReport.findMany({
    where: {
      zoneId,
      isDeleted: false,
      caughtAt: { gte: startDate, lte: endDate },
    },
  });

  // Group catches by date
  const catchesByDate = new Map<string, number>();
  for (const c of catches) {
    const dateKey = c.caughtAt.toISOString().split("T")[0];
    catchesByDate.set(dateKey, (catchesByDate.get(dateKey) || 0) + 1);
  }

  // Calculate correlation between scores and catch counts
  const dataPoints = forecasts.map((f) => {
    const dateKey = f.date.toISOString().split("T")[0];
    return {
      date: dateKey,
      predictedScore: f.score,
      actualCatches: catchesByDate.get(dateKey) || 0,
    };
  });

  // Simple accuracy: do higher scores correlate with more catches?
  const highScoreDays = dataPoints.filter((d) => d.predictedScore >= 70);
  const lowScoreDays = dataPoints.filter((d) => d.predictedScore < 70);

  const avgCatchesHighScore =
    highScoreDays.length > 0
      ? highScoreDays.reduce((sum, d) => sum + d.actualCatches, 0) / highScoreDays.length
      : 0;

  const avgCatchesLowScore =
    lowScoreDays.length > 0
      ? lowScoreDays.reduce((sum, d) => sum + d.actualCatches, 0) / lowScoreDays.length
      : 0;

  return {
    zoneId,
    dateRange: { start: startDate, end: endDate },
    totalForecasts: forecasts.length,
    totalCatches: catches.length,
    dataPoints,
    accuracy: {
      avgCatchesOnHighScoreDays: Math.round(avgCatchesHighScore * 100) / 100,
      avgCatchesOnLowScoreDays: Math.round(avgCatchesLowScore * 100) / 100,
      correlationPositive: avgCatchesHighScore > avgCatchesLowScore,
    },
  };
}

// ─── Species Activity Patterns ───────────────────────────────

export async function getSpeciesActivityPatterns(species: string) {
  const catches = await prisma.catchReport.findMany({
    where: {
      species,
      isDeleted: false,
    },
    select: {
      caughtAt: true,
      weight: true,
      location: true,
    },
    orderBy: { caughtAt: "desc" },
    take: 500,
  });

  // Group by hour of day
  const hourCounts = new Array(24).fill(0);
  for (const c of catches) {
    const hour = c.caughtAt.getHours();
    hourCounts[hour]++;
  }

  // Find peak hours
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

  return {
    species,
    totalCatches: catches.length,
    hourlyDistribution: hourCounts,
    peakHour,
    averageWeight:
      catches.filter((c) => c.weight).length > 0
        ? catches.reduce((sum, c) => sum + (c.weight || 0), 0) /
          catches.filter((c) => c.weight).length
        : null,
  };
}
