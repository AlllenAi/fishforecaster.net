"use client";

import { useState } from "react";
import {
  useAdminCommunityPosts,
  useApprovePost,
  useRejectPost,
  useAdminDeletePost,
  useAdminRestorePost,
} from "../hooks/useAdminCommunityData";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminCommunityPost } from "@/modules/community/types/community.schema";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  APPROVED: "bg-green-500/15 text-green-600 dark:text-green-400",
  REJECTED: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function AdminCommunityTable() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("PENDING");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useAdminCommunityPosts({
    page,
    limit: 20,
    status: status as "ALL" | "DRAFT" | "PENDING" | "APPROVED" | "REJECTED",
  });

  const { mutate: approve, isPending: isApproving } = useApprovePost();
  const { mutate: reject, isPending: isRejecting } = useRejectPost();
  const { mutate: remove, isPending: isDeleting } = useAdminDeletePost();
  const { mutate: restore, isPending: isRestoring } = useAdminRestorePost();

  const isBusy = isApproving || isRejecting || isDeleting || isRestoring;

  const handleReject = (postId: string) => {
    reject(
      { postId, reason: rejectReason || undefined },
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
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Engagement</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : !data?.data?.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No posts found
                </td>
              </tr>
            ) : (
              data.data.map((post: AdminCommunityPost) => (
                <tr key={post.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium max-w-[200px] truncate">{post.title}</p>
                      <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {post.story}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs">{post.user.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{post.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {post._count.likes} likes, {post._count.comments} comments
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        statusStyles[post.status] || ""
                      )}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {post.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isBusy}
                            onClick={() => approve(post.id)}
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          {rejectingId === post.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Reason (optional)"
                                className="w-32 rounded border bg-background px-2 py-1 text-xs"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isBusy}
                                onClick={() => handleReject(post.id)}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isBusy}
                              onClick={() => setRejectingId(post.id)}
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
                        onClick={() => remove(post.id)}
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
            Page {data.page} of {data.totalPages} ({data.total} posts)
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
