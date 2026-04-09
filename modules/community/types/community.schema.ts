import { z } from "zod";

// ─── Input Schemas ──────────────────────────────────────

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  story: z.string().min(10, "Story must be at least 10 characters").max(5000),
  photoUrls: z.array(z.string().url()).min(1, "At least one photo is required").max(5),
  location: z.string().max(100).optional(),
  species: z.array(z.string()).max(10).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().min(1),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const createCommentSchema = z.object({
  postId: z.string().min(1),
  text: z.string().min(1, "Comment cannot be empty").max(1000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const communityQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  species: z.string().optional(),
  search: z.string().optional(),
});

export type CommunityQuery = z.infer<typeof communityQuerySchema>;

export const adminCommunityQuerySchema = z.object({
  status: z.enum(["ALL", "DRAFT", "PENDING", "APPROVED", "REJECTED"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type AdminCommunityQuery = z.infer<typeof adminCommunityQuerySchema>;

// ─── Event Input Schemas ────────────────────────────────

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000),
  photoUrl: z.string().url().optional(),
  location: z.string().min(1, "Location is required").max(200),
  eventDate: z.string().min(1, "Event date is required"),
  endDate: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().min(1),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const eventQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  search: z.string().optional(),
  upcoming: z.boolean().optional(),
});

export type EventQuery = z.infer<typeof eventQuerySchema>;

export const rsvpSchema = z.object({
  eventId: z.string().min(1),
  status: z.enum(["GOING", "INTERESTED"]),
});

export type RSVPInput = z.infer<typeof rsvpSchema>;

// ─── Response Types ─────────────────────────────────────

export interface CommunityPostWithUser {
  id: string;
  title: string;
  story: string;
  photoUrls: string[];
  location: string | null;
  species: string[];
  status: string;
  createdAt: Date;
  userName: string;
  userImage: string | null;
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
}

export interface CommunityCommentWithUser {
  id: string;
  text: string;
  createdAt: Date;
  userName: string;
  userImage: string | null;
  isOwn: boolean;
}

export interface AdminCommunityPost {
  id: string;
  title: string;
  story: string;
  photoUrls: string[];
  status: string;
  rejectionReason: string | null;
  createdAt: Date;
  user: { id: string; email: string; name: string | null };
  _count: { likes: number; comments: number };
}

// ─── Event Response Types ───────────────────────────────

export interface CommunityEventWithUser {
  id: string;
  title: string;
  description: string;
  photoUrl: string | null;
  location: string;
  eventDate: Date;
  endDate: Date | null;
  status: string;
  createdAt: Date;
  userName: string;
  userImage: string | null;
  goingCount: number;
  interestedCount: number;
  userRsvp: "GOING" | "INTERESTED" | null;
}

export interface AdminCommunityEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: Date;
  status: string;
  rejectionReason: string | null;
  createdAt: Date;
  user: { id: string; email: string; name: string | null };
  _count: { rsvps: number };
}
