"use client";

import { useEventsFeed } from "../hooks/useEventsFeed";
import { EventCard } from "./EventCard";
import { Button } from "@/components/ui/button";

interface EventFeedProps {
  search?: string;
}

export function EventFeed({ search }: EventFeedProps) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useEventsFeed({ search, upcoming: true });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border p-4">
            <div className="mb-3 h-48 rounded-lg bg-muted" />
            <div className="mb-2 h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="mt-2 h-3 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  const allEvents = data?.pages.flatMap((page) => page.events) || [];

  if (allEvents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No upcoming events yet. Be the first to create a fishing event!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {allEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
