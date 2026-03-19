"use client";

import { useCatchReports } from "../hooks/useCatchReports";
import { CatchReportCard } from "./CatchReportCard";

interface CatchReportFeedProps {
  zoneId?: string;
  species?: string;
  days?: number;
}

export function CatchReportFeed({ zoneId, species, days }: CatchReportFeedProps) {
  const { data, isLoading } = useCatchReports({ zoneId, species, days });

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

  if (!data?.reports.length) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No catch reports yet. Be the first to report a catch!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.reports.map((report) => (
        <CatchReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}
