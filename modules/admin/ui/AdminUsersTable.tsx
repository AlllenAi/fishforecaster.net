"use client";

import { useState } from "react";
import { useAdminUsers, useUpdateUserRole } from "../hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Shield, ShieldOff, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminUser } from "../types/admin.schema";

export function AdminUsersTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<string>("ALL");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useAdminUsers({
    page,
    limit: 20,
    search: search || undefined,
    tier: tier as "ALL" | "FREE" | "FRESHWATER" | "SALTWATER" | "ALL_ACCESS",
  });

  const { mutate: updateRole, isPending: isUpdating } = useUpdateUserRole();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function toggleAdmin(userId: string, currentRoles: string[]) {
    const isAdmin = currentRoles.includes("admin");
    const newRoles = isAdmin
      ? currentRoles.filter((r) => r !== "admin")
      : [...currentRoles, "admin"];
    updateRole({ userId, roles: newRoles });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9 rounded-md border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" size="sm" variant="outline">
            Search
          </Button>
        </form>

        <select
          value={tier}
          onChange={(e) => {
            setTier(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="ALL">All Tiers</option>
          <option value="FREE">Free</option>
          <option value="FRESHWATER">Freshwater</option>
          <option value="SALTWATER">Saltwater</option>
          <option value="ALL_ACCESS">All Access</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Tier</th>
              <th className="px-4 py-3 text-left font-medium">Roles</th>
              <th className="px-4 py-3 text-left font-medium">Catches</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : !data?.data?.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            ) : (
              data.data.map((user: AdminUser) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{user.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        user.subscriptionTier === "FREE" &&
                          "bg-muted text-muted-foreground",
                        user.subscriptionTier === "FRESHWATER" &&
                          "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                        user.subscriptionTier === "SALTWATER" &&
                          "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
                        user.subscriptionTier === "ALL_ACCESS" &&
                          "bg-primary/15 text-primary"
                      )}
                    >
                      {user.subscriptionTier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {user.roles.map((role: string) => (
                        <span
                          key={role}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs",
                            role === "admin"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user._count.catchReports}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isUpdating}
                      onClick={() => toggleAdmin(user.id, user.roles)}
                      title={
                        user.roles.includes("admin")
                          ? "Remove admin role"
                          : "Make admin"
                      }
                    >
                      {user.roles.includes("admin") ? (
                        <ShieldOff className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Shield className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.totalPages} ({data.total} users)
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
