"use client";

import { User, Mail } from "lucide-react";
import { SubscriptionStatus } from "@/modules/subscription/ui/SubscriptionStatus";

interface AccountPageClientProps {
  name: string;
  email: string;
}

export function AccountPageClient({ name, email }: AccountPageClientProps) {
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
    </div>
  );
}
