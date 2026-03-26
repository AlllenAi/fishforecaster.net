"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscriptionGateProps {
  message?: string;
}

export function SubscriptionGate({ message }: SubscriptionGateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/5 p-12 text-center">
      <Lock className="mb-4 h-10 w-10 text-primary" />
      <h3 className="text-lg font-semibold">Upgrade to Access Forecasts</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {message ||
          "Subscribe to unlock detailed fishing forecasts, bite windows, and species scores."}
      </p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-2xl font-bold">Starting at $7</span>
        <span className="text-muted-foreground">/ 3 months</span>
      </div>
      <Button asChild className="mt-6">
        <Link href="/dashboard/account">View Plans</Link>
      </Button>
    </div>
  );
}
