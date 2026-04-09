"use client";

import { useCommunityFeed } from "../hooks/useCommunityFeed";
import { CommunityPostCard } from "./CommunityPostCard";
import { Button } from "@/components/ui/button";

interface CommunityFeedProps {
  species?: string;
  search?: string;
}

export function CommunityFeed({ species, search }: CommunityFeedProps) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCommunityFeed({ species, search });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border p-4">
            <div className="mb-3 h-48 rounded-lg bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="mt-2 h-3 w-full rounded bg-muted" />
            <div className="mt-2 h-3 w-2/3 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  if (allPosts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No community posts yet. Be the first to share your fishing story!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {allPosts.map((post) => (
          <CommunityPostCard key={post.id} post={post} />
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
