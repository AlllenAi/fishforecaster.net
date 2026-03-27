"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPlatformStats,
  getAdminUsers,
  getAdminReports,
  getAdminLeads,
  getAdminAuditLogs,
  updateUserRole,
  verifyCatchReport,
  deleteCatchReport,
  restoreCatchReport,
} from "../serverActions/admin.actions";
import type { AdminUserQuery, AdminReportQuery } from "../types/admin.schema";

// ─── Stats ──────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => getPlatformStats(),
  });
}

// ─── Users ──────────────────────────────────────────────

export function useAdminUsers(query: AdminUserQuery) {
  return useQuery({
    queryKey: ["admin", "users", query],
    queryFn: () => getAdminUsers(query),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roles }: { userId: string; roles: string[] }) =>
      updateUserRole(userId, roles),
    onSuccess: () => {
      toast.success("User role updated");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

// ─── Reports ────────────────────────────────────────────

export function useAdminReports(query: AdminReportQuery) {
  return useQuery({
    queryKey: ["admin", "reports", query],
    queryFn: () => getAdminReports(query),
  });
}

export function useVerifyReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => verifyCatchReport(reportId),
    onSuccess: () => {
      toast.success("Report verified");
      qc.invalidateQueries({ queryKey: ["admin", "reports"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => deleteCatchReport(reportId),
    onSuccess: () => {
      toast.success("Report deleted");
      qc.invalidateQueries({ queryKey: ["admin", "reports"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useRestoreReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => restoreCatchReport(reportId),
    onSuccess: () => {
      toast.success("Report restored");
      qc.invalidateQueries({ queryKey: ["admin", "reports"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

// ─── Leads ──────────────────────────────────────────────

export function useAdminLeads(query: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin", "leads", query],
    queryFn: () => getAdminLeads(query),
  });
}

// ─── Audit Logs ─────────────────────────────────────────

export function useAuditLogs(query: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin", "audit-logs", query],
    queryFn: () => getAdminAuditLogs(query),
  });
}
