"use client";

import { useState } from "react";
import { useAuditLogs } from "../hooks/useAdminData";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  "user.role.update": { label: "Role Updated", color: "text-blue-600 dark:text-blue-400" },
  "report.verify": { label: "Report Verified", color: "text-green-600 dark:text-green-400" },
  "report.delete": { label: "Report Deleted", color: "text-red-600 dark:text-red-400" },
  "report.restore": { label: "Report Restored", color: "text-orange-600 dark:text-orange-400" },
};

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminAuditLog() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLogs({ page, limit: 25 });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="rounded-xl border p-8 text-center text-muted-foreground">
        No audit log entries yet. Actions will appear here as admins make
        changes.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Time
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Admin
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Action
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((log: { id: string; actorEmail: string; action: string; targetType: string; targetId: string; details: unknown; createdAt: Date }) => {
              const meta = ACTION_LABELS[log.action] ?? {
                label: log.action,
                color: "text-foreground",
              };
              const details = log.details as Record<string, unknown> | null;

              return (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-xs">{log.actorEmail}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${meta.color}`}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {log.action === "user.role.update" && details?.email ? (
                      <span>
                        {String(details.email)} &rarr;{" "}
                        {Array.isArray(details.newRoles) ? details.newRoles.join(", ") : ""}
                      </span>
                    ) : (
                      <span className="font-mono">
                        {log.targetType}:{log.targetId.slice(-6)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {data.page} of {data.totalPages} ({data.total} entries)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded border p-1 hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className="rounded border p-1 hover:bg-muted disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
