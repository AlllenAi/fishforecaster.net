"use client";

import { Users, CreditCard, Fish, Mail, TrendingUp } from "lucide-react";
import type { PlatformStats } from "../types/admin.schema";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  detail?: string;
}

function StatCard({ label, value, icon, detail }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <p className="mt-2 text-3xl font-bold">{value.toLocaleString()}</p>
      {detail && (
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      )}
    </div>
  );
}

export function AdminStatsCards({ stats }: { stats: PlatformStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Users"
        value={stats.totalUsers}
        icon={<Users className="h-5 w-5" />}
        detail={`+${stats.recentSignups} this week`}
      />
      <StatCard
        label="Active Subscriptions"
        value={stats.activeSubscriptions}
        icon={<CreditCard className="h-5 w-5" />}
        detail={`${stats.totalUsers > 0 ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) : 0}% conversion`}
      />
      <StatCard
        label="Catch Reports"
        value={stats.totalCatchReports}
        icon={<Fish className="h-5 w-5" />}
        detail={`+${stats.recentCatches} this week`}
      />
      <StatCard
        label="Email Leads"
        value={stats.totalLeads}
        icon={<Mail className="h-5 w-5" />}
      />
    </div>
  );
}

export function TierBreakdown({
  breakdown,
}: {
  breakdown: Record<string, number>;
}) {
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  const tiers = [
    { key: "FREE", label: "Free", color: "bg-muted-foreground/30" },
    { key: "FRESHWATER", label: "Freshwater", color: "bg-blue-500" },
    { key: "SALTWATER", label: "Saltwater", color: "bg-cyan-500" },
    { key: "ALL_ACCESS", label: "All Access", color: "bg-primary" },
  ];

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <TrendingUp className="h-4 w-4" />
        Subscription Tiers
      </div>
      <div className="mt-4 space-y-3">
        {tiers.map((tier) => {
          const count = breakdown[tier.key] ?? 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={tier.key}>
              <div className="flex items-center justify-between text-sm">
                <span>{tier.label}</span>
                <span className="font-medium">
                  {count} ({pct.toFixed(0)}%)
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${tier.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
