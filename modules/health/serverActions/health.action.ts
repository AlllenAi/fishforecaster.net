"use server";

import { prisma } from "@/lib/prisma";

interface HealthCheckResult {
  status: "pass" | "fail";
  message: string;
  durationMs: number;
}

interface DbHealthReport {
  connected: boolean;
  create: HealthCheckResult | null;
  read: HealthCheckResult | null;
  delete: HealthCheckResult | null;
  error?: string;
}

export async function checkDbHealth(): Promise<DbHealthReport> {
  const report: DbHealthReport = {
    connected: false,
    create: null,
    read: null,
    delete: null,
  };

  const testEmail = `healthcheck-${Date.now()}@test.internal`;

  try {
    // CREATE
    const createStart = performance.now();
    const created = await prisma.lead.create({
      data: { email: testEmail, source: "health_check" },
    });
    report.create = {
      status: "pass",
      message: `Created lead ${created.id}`,
      durationMs: Math.round(performance.now() - createStart),
    };
    report.connected = true;

    // READ
    const readStart = performance.now();
    const found = await prisma.lead.findUnique({
      where: { email: testEmail },
    });
    report.read = {
      status: found ? "pass" : "fail",
      message: found ? `Read lead ${found.id}` : "Lead not found",
      durationMs: Math.round(performance.now() - readStart),
    };

    // DELETE
    const deleteStart = performance.now();
    await prisma.lead.delete({ where: { id: created.id } });
    report.delete = {
      status: "pass",
      message: `Deleted lead ${created.id}`,
      durationMs: Math.round(performance.now() - deleteStart),
    };
  } catch (err) {
    report.error = err instanceof Error ? err.message : "Unknown error";
  }

  return report;
}
