import { z } from "zod";

// ─── Admin Query Schemas ────────────────────────────────

export const adminUserQuerySchema = z.object({
  search: z.string().optional(),
  tier: z.enum(["ALL", "FREE", "FRESHWATER", "SALTWATER", "ALL_ACCESS"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type AdminUserQuery = z.infer<typeof adminUserQuerySchema>;

export const adminReportQuerySchema = z.object({
  status: z.enum(["ALL", "PENDING", "VERIFIED", "DELETED"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type AdminReportQuery = z.infer<typeof adminReportQuerySchema>;

// ─── Dashboard Stats ────────────────────────────────────

export interface PlatformStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalCatchReports: number;
  totalLeads: number;
  totalCommunityPosts: number;
  pendingCommunityPosts: number;
  tierBreakdown: Record<string, number>;
  recentSignups: number; // last 7 days
  recentCatches: number; // last 7 days
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  subscriptionTier: string;
  createdAt: Date;
  _count: { catchReports: number };
}

export interface AdminCatchReport {
  id: string;
  species: string;
  caughtAt: Date;
  isVerified: boolean;
  isDeleted: boolean;
  photoUrl: string | null;
  notes: string | null;
  createdAt: Date;
  user: { id: string; email: string; name: string | null };
  zone: { id: string; name: string };
}

export interface AdminLead {
  id: string;
  email: string;
  source: string;
  subscribedToNewsletter: boolean;
  createdAt: Date;
}
