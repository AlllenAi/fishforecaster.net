"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, MapPin, Clock, Fish } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToggleLike } from "../hooks/useInteractions";
import type { CommunityPostWithUser } from "../types/community.schema";

export function CommunityPostCard({ post }: { post: CommunityPostWithUser }) {
  const { mutate: toggleLike, isPending } = useToggleLike();
  const [optimisticLiked, setOptimisticLiked] = useState(post.hasLiked);
  const [optimisticCount, setOptimisticCount] = useState(post.likeCount);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOptimisticLiked(!optimisticLiked);
    setOptimisticCount((c) => (optimisticLiked ? c - 1 : c + 1));
    toggleLike(post.id, {
      onError: () => {
        setOptimisticLiked(post.hasLiked);
        setOptimisticCount(post.likeCount);
      },
    });
  };

  const [timeLabel] = useState(() => {
    const hoursAgo = Math.floor(
      (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60)
    );
    if (hoursAgo < 1) return "Just now";
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    return `${Math.floor(hoursAgo / 24)}d ago`;
  });

  return (
    <Link href={`/dashboard/community/${post.id}`}>
      <div className="group rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
        {/* Photo */}
        {post.photoUrls[0] && (
          <div className="mb-3 overflow-hidden rounded-lg">
            <Image
              src={post.photoUrls[0]}
              alt={post.title}
              width={400}
              height={200}
              className="h-48 w-full object-cover transition-transform group-hover:scale-[1.02]"
            />
            {post.photoUrls.length > 1 && (
              <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                +{post.photoUrls.length - 1}
              </div>
            )}
          </div>
        )}

        {/* Title + Time */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{post.title}</h3>
          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeLabel}
          </span>
        </div>

        {/* Story preview */}
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {post.story}
        </p>

        {/* Tags */}
        {(post.species.length > 0 || post.location) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.location && (
              <span className="flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                <MapPin className="h-3 w-3" />
                {post.location}
              </span>
            )}
            {post.species.map((s) => (
              <span
                key={s}
                className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
              >
                <Fish className="h-3 w-3" />
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Footer: author + interactions */}
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            {post.userImage ? (
              <Image
                src={post.userImage}
                alt={post.userName}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                {post.userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {post.userName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={isPending}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-red-500"
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  optimisticLiked && "fill-red-500 text-red-500"
                )}
              />
              {optimisticCount}
            </button>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              {post.commentCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
