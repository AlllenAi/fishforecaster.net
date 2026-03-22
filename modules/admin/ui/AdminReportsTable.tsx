"use client";

import { useState } from "react";
import {
  useAdminReports,
  useVerifyReport,
  useDeleteReport,
  useRestoreReport,
} from "../hooks/useAdminData";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminCatchReport } from "../types/admin.schema";

export function AdminReportsTable() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("PENDING");

  const { data, isLoading } = useAdminReports({
    page,
    limit: 20,
    status: status as "ALL" | "PENDING" | "VERIFIED" | "DELETED",
  });

  const { mutate: verify, isPending: isVerifying } = useVerifyReport();
  const { mutate: remove, isPending: isDeleting } = useDeleteReport();
  const { mutate: restore, isPending: isRestoring } = useRestoreReport();

  const isBusy = isVerifying || isDeleting || isRestoring;

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="flex gap-2">
        {["PENDING", "VERIFIED", "DELETED", "ALL"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "outline"}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Species</th>
              <th className="px-4 py-3 text-left font-medium">Zone</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Caught</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            ) : !data?.data?.length ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No reports found
                </td>
              </tr>
            ) : (
              data.data.map((report: AdminCatchReport) => (
                <tr key={report.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{report.species}</p>
                      {report.notes && (
                        <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                          {report.notes}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {report.zone.name}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      {report.user.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(report.caughtAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        report.isDeleted &&
                          "bg-red-500/15 text-red-600 dark:text-red-400",
                        report.isVerified &&
                          !report.isDeleted &&
                          "bg-green-500/15 text-green-600 dark:text-green-400",
                        !report.isVerified &&
                          !report.isDeleted &&
                          "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {report.isDeleted
                        ? "Deleted"
                        : report.isVerified
                          ? "Verified"
                          : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {!report.isVerified && !report.isDeleted && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isBusy}
                          onClick={() => verify(report.id)}
                          title="Verify"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      {!report.isDeleted && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isBusy}
                          onClick={() => remove(report.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                      {report.isDeleted && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isBusy}
                          onClick={() => restore(report.id)}
                          title="Restore"
                        >
                          <RotateCcw className="h-4 w-4 text-blue-500" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.totalPages} ({data.total} reports)
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
