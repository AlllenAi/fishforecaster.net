"use client";

import { useMyReports, useDeleteReport } from "../hooks/useMyReports";
import { CatchReportCard } from "./CatchReportCard";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Link from "next/link";

export function MyReportsList() {
  const { data: reports, isLoading } = useMyReports();
  const { mutate: deleteReport, isPending: isDeleting } = useDeleteReport();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border p-4">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="mt-2 h-3 w-48 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (!reports?.length) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          You haven&apos;t submitted any catch reports yet.
        </p>
        <Link href="/dashboard/catches/new">
          <Button variant="outline" size="sm" className="mt-3">
            Report Your First Catch
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="relative">
          <CatchReportCard report={report} />
          {!report.isVerified && (
            <div className="absolute right-3 top-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                disabled={isDeleting}
                onClick={() => {
                  if (confirm("Delete this catch report?")) {
                    deleteReport(report.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
