"use client";

import Image from "next/image";
import Link from "next/link";
import { useMyPosts } from "../hooks/useMyPosts";
import { usePublishDraft } from "../hooks/usePublishDraft";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, Send, AlertCircle } from "lucide-react";
import type { CommunityPostWithUser } from "../types/community.schema";

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
  },
  PENDING: {
    label: "Pending Review",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  APPROVED: {
    label: "Published",
    className: "bg-green-500/15 text-green-600 dark:text-green-400",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-500/15 text-red-600 dark:text-red-400",
  },
};

function PostRow({ post }: { post: CommunityPostWithUser }) {
  const { mutate: publish, isPending } = usePublishDraft();
  const config = statusConfig[post.status] || statusConfig.DRAFT;

  return (
    <div className="flex items-center gap-4 rounded-xl border p-4">
      {post.photoUrls[0] && (
        <Image
          src={post.photoUrls[0]}
          alt={post.title}
          width={80}
          height={60}
          className="h-16 w-20 rounded-lg object-cover"
        />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{post.title}</h3>
        <p className="text-xs text-muted-foreground truncate">{post.story}</p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              config.className
            )}
          >
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {post.status === "DRAFT" && (
          <Button
            size="sm"
            onClick={() => publish(post.id)}
            disabled={isPending}
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Publish
          </Button>
        )}
        {post.status === "APPROVED" && (
          <Link href={`/dashboard/community/${post.id}`}>
            <Button size="sm" variant="outline">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              View
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export function MyPostsList() {
  const { data: posts, isLoading } = useMyPosts();

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

  if (!posts?.length) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        You haven&apos;t created any posts yet.
      </div>
    );
  }

  const drafts = posts.filter((p) => p.status === "DRAFT");
  const rejected = posts.filter((p) => p.status === "REJECTED");

  return (
    <div className="space-y-6">
      {drafts.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
          <p className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            You have {drafts.length} draft{drafts.length > 1 ? "s" : ""} waiting
            to be published
          </p>
          <p className="mt-1 text-muted-foreground">
            Upgrade to a paid plan to share your posts with the community!
          </p>
        </div>
      )}

      {rejected.length > 0 && rejected.map((post) => (
        <div key={post.id} className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm">
          <p className="font-medium text-red-600 dark:text-red-400">
            &ldquo;{post.title}&rdquo; was not approved
          </p>
        </div>
      ))}

      <div className="space-y-3">
        {posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
