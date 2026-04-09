"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToggleLike } from "../hooks/useInteractions";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const { mutate: toggleLike, isPending } = useToggleLike();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const handleClick = () => {
    setLiked(!liked);
    setCount((c) => (liked ? c - 1 : c + 1));
    toggleLike(postId, {
      onError: () => {
        setLiked(initialLiked);
        setCount(initialCount);
      },
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
        liked
          ? "border-red-500/30 bg-red-500/5 text-red-500"
          : "text-muted-foreground hover:border-red-500/30 hover:text-red-500"
      )}
    >
      <Heart
        className={cn("h-4 w-4", liked && "fill-red-500")}
      />
      {count} {count === 1 ? "Like" : "Likes"}
    </button>
  );
}
