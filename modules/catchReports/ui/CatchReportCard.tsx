"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MapPin, Clock, Fish, Weight, Anchor } from "lucide-react";
import type { CatchReportWithUser } from "../types/catchReport.schema";

function getRecencyColor(hoursAgo: number): string {
  if (hoursAgo <= 24) return "border-red-500/50 bg-red-500/5";
  if (hoursAgo <= 72) return "border-orange-500/50 bg-orange-500/5";
  return "border-muted";
}

export function CatchReportCard({ report }: { report: CatchReportWithUser }) {
  const [hoursAgo] = useState(
    () => Math.floor((Date.now() - new Date(report.caughtAt).getTime()) / (1000 * 60 * 60))
  );
  const timeLabel =
    hoursAgo < 1
      ? "Just now"
      : hoursAgo < 24
        ? `${hoursAgo}h ago`
        : `${Math.floor(hoursAgo / 24)}d ago`;

  return (
    <div className={cn("rounded-xl border p-4 transition-all", getRecencyColor(hoursAgo))}>
      {/* Photo */}
      {report.photoUrl && (
        <div className="mb-3 overflow-hidden rounded-lg">
          <Image
            src={report.photoUrl}
            alt={`${report.species} catch`}
            width={400}
            height={160}
            className="h-40 w-full object-contain bg-muted"
          />
        </div>
      )}

      {/* Species + Zone */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold flex items-center gap-1.5">
            <Fish className="h-4 w-4 text-primary" />
            {report.species}
          </h4>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {report.zoneName}
          </p>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeLabel}
        </span>
      </div>

      {/* Details */}
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {report.weight && (
          <span className="flex items-center gap-1">
            <Weight className="h-3 w-3" />
            {report.weight} lbs
          </span>
        )}
        {report.lure && (
          <span className="flex items-center gap-1">
            <Anchor className="h-3 w-3" />
            {report.lure}
          </span>
        )}
      </div>

      {report.notes && (
        <p className="mt-2 text-xs text-muted-foreground italic">
          &ldquo;{report.notes}&rdquo;
        </p>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{report.userName}</span>
        {report.isVerified && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-400">
            Verified
          </span>
        )}
      </div>
    </div>
  );
}
