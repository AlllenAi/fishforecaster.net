"use server";

import { prisma } from "@/lib/prisma";
import { withAccess } from "@/lib/middleware/withAccess";
import { withPaidSubscription } from "@/lib/middleware/withPaidSubscription";
import type { AuthContext } from "@/lib/auth/types";
import { NotFoundError, PermissionError } from "@/lib/auth/types";
import { createCommentSchema } from "../types/community.schema";
import type { CommunityCommentWithUser } from "../types/community.schema";

// ─── Toggle Like (paid subscribers only) ────────────────────

export const toggleLike = withPaidSubscription(
  async (user: AuthContext, postId: string) => {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post || post.isDeleted || post.status !== "APPROVED") {
      throw new NotFoundError("Post not found");
    }

    const existing = await prisma.communityLike.findUnique({
      where: { postId_userId: { postId, userId: user.userId } },
    });

    if (existing) {
      await prisma.communityLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.communityLike.create({
        data: { postId, userId: user.userId },
      });
    }

    const likeCount = await prisma.communityLike.count({ where: { postId } });

    return { liked: !existing, likeCount };
  }
);

// ─── Add Comment (paid subscribers only) ────────────────────

export const addComment = withPaidSubscription(
  async (user: AuthContext, input: Record<string, unknown>) => {
    const validated = createCommentSchema.parse(input);

    const post = await prisma.communityPost.findUnique({
      where: { id: validated.postId },
    });

    if (!post || post.isDeleted || post.status !== "APPROVED") {
      throw new NotFoundError("Post not found");
    }

    const comment = await prisma.communityComment.create({
      data: {
        postId: validated.postId,
        userId: user.userId,
        text: validated.text,
      },
      include: {
        user: { select: { name: true, image: true } },
      },
    });

    return {
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      userName: comment.user.name || "Anonymous Angler",
      userImage: comment.user.image,
      isOwn: true,
    } satisfies CommunityCommentWithUser;
  }
);

// ─── Delete Comment (own comment or admin) ──────────────────

export const deleteComment = withAccess(
  async (user: AuthContext, commentId: string) => {
    const comment = await prisma.communityComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundError("Comment not found");

    const isAdmin = user.roles.includes("admin");
    if (comment.userId !== user.userId && !isAdmin) {
      throw new PermissionError("Not your comment");
    }

    await prisma.communityComment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });

    return { success: true };
  }
);

// ─── Get Comments for Post ──────────────────────────────────

export const getComments = withAccess(
  async (
    user: AuthContext,
    input: { postId: string; cursor?: string; limit?: number }
  ): Promise<{ comments: CommunityCommentWithUser[]; nextCursor: string | null }> => {
    const limit = input.limit || 20;

    const comments = await prisma.communityComment.findMany({
      where: { postId: input.postId, isDeleted: false },
      include: {
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
      take: limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });

    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, limit) : comments;

    return {
      comments: items.map((c) => ({
        id: c.id,
        text: c.text,
        createdAt: c.createdAt,
        userName: c.user.name || "Anonymous Angler",
        userImage: c.user.image,
        isOwn: c.userId === user.userId,
      })),
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }
);
