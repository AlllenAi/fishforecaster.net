// ─── Audit Log Service ───────────────────────────────────────
// Records admin actions for accountability and debugging.
// Every write operation in the admin module should call logAction().

import { prisma } from "@/lib/prisma";
import type { AuthContext } from "@/lib/auth/types";

interface AuditEntry {
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, unknown>;
}

export async function logAction(actor: AuthContext, entry: AuditEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actor.userId,
        actorEmail: actor.email,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        details: (entry.details as object) ?? undefined,
      },
    });
  } catch (err) {
    // Never let audit logging break the primary action
    console.error("[Audit] Failed to log action:", err);
  }
}

export async function getAuditLogs(options: {
  page?: number;
  limit?: number;
}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 25;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count(),
  ]);

  return {
    data: logs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
