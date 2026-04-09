"use client";

import { useState } from "react";
import {
  useAdminCommunityEvents,
  useApproveEvent,
  useRejectEvent,
  useAdminDeleteEvent,
} from "../hooks/useAdminEventData";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminCommunityEvent } from "@/modules/community/types/community.schema";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  APPROVED: "bg-green-500/15 text-green-600 dark:text-green-400",
  REJECTED: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function AdminEventTable() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("PENDING");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useAdminCommunityEvents({
    page,
    limit: 20,
    status: status as "ALL" | "DRAFT" | "PENDING" | "APPROVED" | "REJECTED",
  });

  const { mutate: approve, isPending: isApproving } = useApproveEvent();
  const { mutate: reject, isPending: isRejecting } = useRejectEvent();
  const { mutate: remove, isPending: isDeleting } = useAdminDeleteEvent();

  const isBusy = isApproving || isRejecting || isDeleting;

  const handleReject = (eventId: string) => {
    reject(
      { eventId, reason: rejectReason || undefined },
      {
        onSuccess: () => {
          setRejectingId(null);
          setRejectReason("");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="flex gap-2">
        {["PENDING", "APPROVED", "REJECTED", "DRAFT", "ALL"].map((s) => (
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
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Location</th>
              <th className="px-4 py-3 text-left font-medium">Event Date</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">RSVPs</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            ) : !data?.data?.length ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No events found
                </td>
              </tr>
            ) : (
              data.data.map((event: AdminCommunityEvent) => (
                <tr key={event.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="max-w-[200px] truncate font-medium">
                      {event.title}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {event.location}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs">{event.user.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.user.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {event._count.rsvps} RSVPs
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        statusStyles[event.status] || ""
                      )}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {event.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isBusy}
                            onClick={() => approve(event.id)}
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          {rejectingId === event.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) =>
                                  setRejectReason(e.target.value)
                                }
                                placeholder="Reason (optional)"
                                className="w-32 rounded border bg-background px-2 py-1 text-xs"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isBusy}
                                onClick={() => handleReject(event.id)}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isBusy}
                              onClick={() => setRejectingId(event.id)}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isBusy}
                        onClick={() => remove(event.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
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
            Page {data.page} of {data.totalPages} ({data.total} events)
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
