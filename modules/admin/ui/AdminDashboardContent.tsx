"use client";

import { useAdminStats } from "../hooks/useAdminData";
import { AdminStatsCards, TierBreakdown } from "./AdminStatsCards";
import Link from "next/link";
import { Users, FileText, Mail, ArrowRight } from "lucide-react";

function QuickLink({
  href,
  icon,
  label,
  count,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:border-primary/30"
    >
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="font-medium">{label}</p>
          {count !== undefined && (
            <p className="text-xs text-muted-foreground">
              {count} total
            </p>
          )}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

export function AdminDashboardContent() {
  const { data, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading admin dashboard...
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex items-center justify-center py-20 text-red-500">
        Failed to load admin data. Make sure you have admin permissions.
      </div>
    );
  }

  const stats = data.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      <AdminStatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TierBreakdown breakdown={stats.tierBreakdown} />

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <QuickLink
              href="/dashboard/admin/users"
              icon={<Users className="h-5 w-5" />}
              label="Manage Users"
              count={stats.totalUsers}
            />
            <QuickLink
              href="/dashboard/admin/reports"
              icon={<FileText className="h-5 w-5" />}
              label="Moderate Reports"
              count={stats.totalCatchReports}
            />
            <QuickLink
              href="/dashboard/admin/leads"
              icon={<Mail className="h-5 w-5" />}
              label="View Leads"
              count={stats.totalLeads}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
