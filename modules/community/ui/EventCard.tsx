"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToggleRSVP } from "../hooks/useRSVP";
import type { CommunityEventWithUser } from "../types/community.schema";

export function EventCard({ event }: { event: CommunityEventWithUser }) {
  const { mutate: toggleRSVP, isPending } = useToggleRSVP();
  const [optimisticRsvp, setOptimisticRsvp] = useState(event.userRsvp);
  const [optimisticGoing, setOptimisticGoing] = useState(event.goingCount);
  const [optimisticInterested, setOptimisticInterested] = useState(
    event.interestedCount
  );

  const handleRSVP = (
    e: React.MouseEvent,
    status: "GOING" | "INTERESTED"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const wasActive = optimisticRsvp === status;
    const previousRsvp = optimisticRsvp;

    // Optimistic update
    if (wasActive) {
      setOptimisticRsvp(null);
      if (status === "GOING") setOptimisticGoing((c) => c - 1);
      else setOptimisticInterested((c) => c - 1);
    } else {
      // Remove old RSVP count
      if (previousRsvp === "GOING") setOptimisticGoing((c) => c - 1);
      if (previousRsvp === "INTERESTED")
        setOptimisticInterested((c) => c - 1);
      // Add new RSVP count
      setOptimisticRsvp(status);
      if (status === "GOING") setOptimisticGoing((c) => c + 1);
      else setOptimisticInterested((c) => c + 1);
    }

    toggleRSVP(
      { eventId: event.id, status },
      {
        onError: () => {
          setOptimisticRsvp(event.userRsvp);
          setOptimisticGoing(event.goingCount);
          setOptimisticInterested(event.interestedCount);
        },
      }
    );
  };

  const eventDate = new Date(event.eventDate);
  const isPast = eventDate < new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <Link href={`/dashboard/community/events/${event.id}`}>
      <div
        className={cn(
          "group rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm",
          isPast && "opacity-60"
        )}
      >
        {/* Photo */}
        {event.photoUrl && (
          <div className="mb-3 overflow-hidden rounded-lg">
            <Image
              src={event.photoUrl}
              alt={event.title}
              width={400}
              height={200}
              className="h-48 w-full object-cover transition-transform group-hover:scale-[1.02]"
            />
          </div>
        )}

        {/* Date badge */}
        <div className="mb-2 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
              isPast
                ? "bg-muted text-muted-foreground"
                : "bg-primary/10 text-primary"
            )}
          >
            <Calendar className="h-3 w-3" />
            {formatDate(eventDate)}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTime(eventDate)}
          </span>
          {isPast && (
            <span className="text-xs font-medium text-muted-foreground">
              Past Event
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold leading-tight">{event.title}</h3>

        {/* Description preview */}
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {event.description}
        </p>

        {/* Location */}
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {event.location}
        </div>

        {/* Footer: author + RSVP */}
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            {event.userImage ? (
              <Image
                src={event.userImage}
                alt={event.userName}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                {event.userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {event.userName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleRSVP(e, "GOING")}
              disabled={isPending || isPast}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors",
                optimisticRsvp === "GOING"
                  ? "bg-green-500/20 text-green-500"
                  : "text-muted-foreground hover:text-green-500"
              )}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {optimisticGoing}
            </button>
            <button
              onClick={(e) => handleRSVP(e, "INTERESTED")}
              disabled={isPending || isPast}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors",
                optimisticRsvp === "INTERESTED"
                  ? "bg-amber-500/20 text-amber-500"
                  : "text-muted-foreground hover:text-amber-500"
              )}
            >
              <Star className="h-3.5 w-3.5" />
              {optimisticInterested}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
