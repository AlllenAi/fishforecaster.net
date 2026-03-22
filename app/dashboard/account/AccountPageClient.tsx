"use client";

import { User, Mail, Bell } from "lucide-react";
import { SubscriptionStatus } from "@/modules/subscription/ui/SubscriptionStatus";
import { useEmailPreferences } from "@/modules/email/hooks/useEmailPreferences";
import { NotificationPreferences } from "@/modules/notifications/ui/NotificationPreferences";

interface AccountPageClientProps {
  name: string;
  email: string;
}

export function AccountPageClient({ name, email }: AccountPageClientProps) {
  const { preferences, isLoading, updatePreferences, isUpdating } =
    useEmailPreferences();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Account</h1>

      {/* Profile Info */}
      <div className="rounded-xl border p-6">
        <h3 className="font-semibold">Profile</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{email}</span>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <SubscriptionStatus />

      {/* Fishing Alerts */}
      <NotificationPreferences />

      {/* Email Preferences */}
      <div className="rounded-xl border p-6">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Email Notifications</h3>
        </div>

        {isLoading ? (
          <div className="mt-4 animate-pulse space-y-3">
            <div className="h-6 w-48 rounded bg-muted" />
            <div className="h-6 w-48 rounded bg-muted" />
          </div>
        ) : preferences ? (
          <div className="mt-4 space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Weekly Forecast Digest</p>
                <p className="text-xs text-muted-foreground">
                  Top fishing days for the upcoming week, every Monday
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.weeklyDigest}
                disabled={isUpdating}
                onClick={() =>
                  updatePreferences({
                    ...preferences,
                    weeklyDigest: !preferences.weeklyDigest,
                  })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  preferences.weeklyDigest ? "bg-primary" : "bg-muted"
                } ${isUpdating ? "opacity-50" : ""}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    preferences.weeklyDigest ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Product Updates</p>
                <p className="text-xs text-muted-foreground">
                  New features, zone additions, and improvements
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.productUpdates}
                disabled={isUpdating}
                onClick={() =>
                  updatePreferences({
                    ...preferences,
                    productUpdates: !preferences.productUpdates,
                  })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  preferences.productUpdates ? "bg-primary" : "bg-muted"
                } ${isUpdating ? "opacity-50" : ""}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    preferences.productUpdates ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}
