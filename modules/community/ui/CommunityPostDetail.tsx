"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePostDetail } from "../hooks/usePostDetail";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";
import { MapPin, Fish, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityPostDetailProps {
  postId: string;
}

export function CommunityPostDetail({ postId }: CommunityPostDetailProps) {
  const { data: post, isLoading } = usePostDetail(postId);
  const [photoIndex, setPhotoIndex] = useState(0);

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

  if (!post) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        Post not found or not yet approved.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/dashboard/community">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Community
        </Button>
      </Link>

      {/* Photo gallery */}
      {post.photoUrls.length > 0 && (
        <div className="relative overflow-hidden rounded-xl">
          <Image
            src={post.photoUrls[photoIndex]}
            alt={post.title}
            width={800}
            height={400}
            className="h-80 w-full object-cover"
          />
          {post.photoUrls.length > 1 && (
            <>
              <button
                onClick={() =>
                  setPhotoIndex((i) =>
                    i === 0 ? post.photoUrls.length - 1 : i - 1
                  )
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  setPhotoIndex((i) =>
                    i === post.photoUrls.length - 1 ? 0 : i + 1
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                {post.photoUrls.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      i === photoIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Title + meta */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{post.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
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
            {post.userName}
          </div>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tags */}
      {(post.species.length > 0 || post.location) && (
        <div className="flex flex-wrap gap-1.5">
          {post.location && (
            <span className="flex items-center gap-0.5 rounded-full bg-muted px-2.5 py-1 text-xs">
              <MapPin className="h-3 w-3" />
              {post.location}
            </span>
          )}
          {post.species.map((s) => (
            <span
              key={s}
              className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
            >
              <Fish className="h-3 w-3" />
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Story */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {post.story.split("\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {/* Like */}
      <LikeButton
        postId={post.id}
        initialLiked={post.hasLiked}
        initialCount={post.likeCount}
      />

      {/* Comments */}
      <div className="border-t pt-6">
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
