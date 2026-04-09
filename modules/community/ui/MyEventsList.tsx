"use client";

import Link from "next/link";
import { useMyEvents } from "../hooks/useMyEvents";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Eye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-500/10 text-gray-500",
  },
  PENDING: {
    label: "Pending Review",
    className: "bg-amber-500/10 text-amber-500",
  },
  APPROVED: {
    label: "Published",
    className: "bg-green-500/10 text-green-500",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-500",
  },
};

export function MyEventsList() {
  const { data: events, isLoading } = useMyEvents();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border p-4">
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="mt-2 h-3 w-32 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        You haven&apos;t created any events yet.
      </div>
    );
  }

  const hasDrafts = events.some((e) => e.status === "DRAFT");

  return (
    <div className="space-y-4">
      {hasDrafts && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
          <p className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
            You have draft events
          </p>
          <p className="mt-1 text-muted-foreground">
            Upgrade to a paid plan to submit your events for publication.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {events.map((event) => {
          const config =
            statusConfig[event.status as keyof typeof statusConfig];
          const eventDate = new Date(event.eventDate);

          return (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-xl border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-medium">{event.title}</h3>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                      config.className
                    )}
                  >
                    {config.label}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {eventDate.toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </span>
                </div>
              </div>

              {event.status === "APPROVED" && (
                <Link href={`/dashboard/community/events/${event.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    View
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
