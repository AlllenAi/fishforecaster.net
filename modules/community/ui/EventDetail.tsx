"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useEventDetail } from "../hooks/useEventDetail";
import { useToggleRSVP } from "../hooks/useRSVP";
import {
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle,
  Star,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EventDetailProps {
  eventId: string;
}

export function EventDetail({ eventId }: EventDetailProps) {
  const { data: event, isLoading } = useEventDetail(eventId);
  const { mutate: toggleRSVP, isPending } = useToggleRSVP();
  const [optimisticRsvp, setOptimisticRsvp] = useState<
    "GOING" | "INTERESTED" | null
  >(null);
  const [initialized, setInitialized] = useState(false);

  // Sync optimistic state once data loads
  if (event && !initialized) {
    setOptimisticRsvp(event.userRsvp);
    setInitialized(true);
  }

  const handleRSVP = (status: "GOING" | "INTERESTED") => {
    const wasActive = optimisticRsvp === status;
    setOptimisticRsvp(wasActive ? null : status);

    toggleRSVP(
      { eventId, status },
      {
        onError: () => {
          setOptimisticRsvp(event?.userRsvp || null);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-80 rounded-xl bg-muted" />
        <div className="h-6 w-64 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        Event not found or not yet approved.
      </div>
    );
  }

  const eventDate = new Date(event.eventDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const isPast = eventDate < new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/dashboard/community">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Community
        </Button>
      </Link>

      {/* Cover photo */}
      {event.photoUrl && (
        <div className="overflow-hidden rounded-xl">
          <Image
            src={event.photoUrl}
            alt={event.title}
            width={800}
            height={400}
            className="h-80 w-full object-cover"
          />
        </div>
      )}

      {/* Title + meta */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
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
            {event.userName}
          </div>
        </div>
      </div>

      {/* Date & Location info */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-medium">{formatDate(eventDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-primary" />
          <span>
            {formatTime(eventDate)}
            {endDate && ` – ${formatTime(endDate)}`}
            {endDate &&
              eventDate.toDateString() !== endDate.toDateString() &&
              ` (${formatDate(endDate)})`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {event.goingCount} going &middot; {event.interestedCount} interested
          </span>
        </div>
      </div>

      {/* RSVP buttons */}
      {!isPast && (
        <div className="flex gap-3">
          <Button
            variant={optimisticRsvp === "GOING" ? "default" : "outline"}
            onClick={() => handleRSVP("GOING")}
            disabled={isPending}
            className={cn(
              "flex-1",
              optimisticRsvp === "GOING" &&
                "bg-green-600 hover:bg-green-700 text-white"
            )}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {optimisticRsvp === "GOING" ? "Going!" : "Going"}
          </Button>
          <Button
            variant={optimisticRsvp === "INTERESTED" ? "default" : "outline"}
            onClick={() => handleRSVP("INTERESTED")}
            disabled={isPending}
            className={cn(
              "flex-1",
              optimisticRsvp === "INTERESTED" &&
                "bg-amber-600 hover:bg-amber-700 text-white"
            )}
          >
            <Star className="mr-2 h-4 w-4" />
            {optimisticRsvp === "INTERESTED" ? "Interested!" : "Interested"}
          </Button>
        </div>
      )}

      {isPast && (
        <div className="rounded-lg border border-muted bg-muted/30 p-3 text-center text-sm text-muted-foreground">
          This event has already passed.
        </div>
      )}

      {/* Description */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {event.description.split("\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
