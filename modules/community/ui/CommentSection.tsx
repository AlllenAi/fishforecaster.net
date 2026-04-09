"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useComments, useAddComment, useDeleteComment } from "../hooks/useInteractions";
import { Send, Trash2 } from "lucide-react";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data, isLoading } = useComments(postId);
  const { mutate: addComment, isPending: isAdding } = useAddComment();
  const { mutate: removeComment } = useDeleteComment();
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    addComment(
      { postId, text: text.trim() },
      { onSuccess: () => setText("") }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Comments</h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          maxLength={1000}
          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isAdding || !text.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-1">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : !data?.comments.length ? (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="space-y-3">
          {data.comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              {comment.userImage ? (
                <Image
                  src={comment.userImage}
                  alt={comment.userName}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                  {comment.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{comment.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                  {comment.isOwn && (
                    <button
                      onClick={() => removeComment(comment.id)}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
