"use server";

import { prisma } from "@/lib/prisma";
import { withAccess } from "@/lib/middleware/withAccess";
import { withPaidSubscription } from "@/lib/middleware/withPaidSubscription";
import type { AuthContext } from "@/lib/auth/types";
import { NotFoundError, PermissionError } from "@/lib/auth/types";
import { signBlobUrls } from "@/lib/blob";
import {
  createPostSchema,
  updatePostSchema,
  communityQuerySchema,
} from "../types/community.schema";
import type { CommunityPostWithUser } from "../types/community.schema";

// ─── Create Post (paid subscribers → PENDING, free → DRAFT) ──

export const createPost = withAccess(
  async (user: AuthContext, input: Record<string, unknown>) => {
    const validated = createPostSchema.parse(input);

    // Free users get DRAFT status (lead capture), paid get PENDING (for moderation)
    const status = user.subscriptionTier === "FREE" ? "DRAFT" : "PENDING";

    const post = await prisma.communityPost.create({
      data: {
        userId: user.userId,
        title: validated.title,
        story: validated.story,
        photoUrls: validated.photoUrls,
        location: validated.location,
        species: validated.species || [],
        status,
      },
    });

    return { success: true, id: post.id, status };
  }
);

// ─── Get Community Feed (approved posts only) ───────────────

export const getCommunityFeed = withAccess(
  async (
    user: AuthContext,
    input?: Record<string, unknown>
  ): Promise<{ posts: CommunityPostWithUser[]; nextCursor: string | null }> => {
    const { cursor, limit, species, search } = communityQuerySchema.parse(
      input || {}
    );

    const where: Record<string, unknown> = {
      status: "APPROVED",
      isDeleted: false,
    };

    if (species) {
      where.species = { has: species };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { story: { contains: search, mode: "insensitive" } },
      ];
    }

    const rawPosts = await prisma.communityPost.findMany({
      where,
      include: {
        user: { select: { name: true, image: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = rawPosts.length > limit;
    const items = hasMore ? rawPosts.slice(0, limit) : rawPosts;

    // Check which posts the current user has liked
    const likedPostIds = new Set(
      (
        await prisma.communityLike.findMany({
          where: {
            userId: user.userId,
            postId: { in: items.map((p) => p.id) },
          },
          select: { postId: true },
        })
      ).map((l) => l.postId)
    );

    const posts = await Promise.all(
      items.map(async (p) => ({
        id: p.id,
        title: p.title,
        story: p.story,
        photoUrls: await signBlobUrls(p.photoUrls),
        location: p.location,
        species: p.species,
        status: p.status,
        createdAt: p.createdAt,
        userName: p.user.name || "Anonymous Angler",
        userImage: p.user.image,
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        hasLiked: likedPostIds.has(p.id),
      }))
    );

    return {
      posts,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }
);

// ─── Get Post Detail ────────────────────────────────────────

export const getPostById = withAccess(
  async (
    user: AuthContext,
    postId: string
  ): Promise<CommunityPostWithUser | null> => {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        user: { select: { name: true, image: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post || post.isDeleted) return null;

    // Only show non-approved posts to the author
    if (post.status !== "APPROVED" && post.userId !== user.userId) {
      return null;
    }

    const liked = await prisma.communityLike.findUnique({
      where: { postId_userId: { postId, userId: user.userId } },
    });

    return {
      id: post.id,
      title: post.title,
      story: post.story,
      photoUrls: await signBlobUrls(post.photoUrls),
      location: post.location,
      species: post.species,
      status: post.status,
      createdAt: post.createdAt,
      userName: post.user.name || "Anonymous Angler",
      userImage: post.user.image,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      hasLiked: !!liked,
    };
  }
);

// ─── Get My Posts ───────────────────────────────────────────

export const getMyPosts = withAccess(
  async (user: AuthContext): Promise<CommunityPostWithUser[]> => {
    const posts = await prisma.communityPost.findMany({
      where: { userId: user.userId, isDeleted: false },
      include: {
        user: { select: { name: true, image: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Promise.all(
      posts.map(async (p) => ({
        id: p.id,
        title: p.title,
        story: p.story,
        photoUrls: await signBlobUrls(p.photoUrls),
        location: p.location,
        species: p.species,
        status: p.status,
        createdAt: p.createdAt,
        userName: p.user.name || "Anonymous Angler",
        userImage: p.user.image,
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        hasLiked: false,
      }))
    );
  }
);

// ─── Update Post (own DRAFT/PENDING posts only) ────────────

export const updatePost = withAccess(
  async (user: AuthContext, input: Record<string, unknown>) => {
    const validated = updatePostSchema.parse(input);

    const post = await prisma.communityPost.findUnique({
      where: { id: validated.id },
    });

    if (!post) throw new NotFoundError("Post not found");
    if (post.userId !== user.userId) throw new PermissionError("Not your post");
    if (post.status === "APPROVED")
      throw new PermissionError("Cannot edit an approved post");

    const { id, ...data } = validated;

    // Re-submit for moderation if it was rejected
    const updateData: Record<string, unknown> = { ...data };
    if (post.status === "REJECTED") {
      updateData.status = user.subscriptionTier === "FREE" ? "DRAFT" : "PENDING";
      updateData.rejectionReason = null;
    }

    await prisma.communityPost.update({
      where: { id },
      data: updateData,
    });

    return { success: true };
  }
);

// ─── Delete Post (soft delete, own posts only) ─────────────

export const deletePost = withAccess(
  async (user: AuthContext, postId: string) => {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) throw new NotFoundError("Post not found");
    if (post.userId !== user.userId) throw new PermissionError("Not your post");

    await prisma.communityPost.update({
      where: { id: postId },
      data: { isDeleted: true },
    });

    return { success: true };
  }
);

// ─── Publish Draft (upgrade a DRAFT to PENDING) ────────────

export const publishDraft = withPaidSubscription(
  async (user: AuthContext, postId: string) => {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) throw new NotFoundError("Post not found");
    if (post.userId !== user.userId) throw new PermissionError("Not your post");
    if (post.status !== "DRAFT")
      throw new PermissionError("Only draft posts can be published");

    await prisma.communityPost.update({
      where: { id: postId },
      data: { status: "PENDING" },
    });

    return { success: true };
  }
);
