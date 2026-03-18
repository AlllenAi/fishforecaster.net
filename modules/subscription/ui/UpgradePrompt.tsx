"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckout } from "../hooks/useCheckout";
import type { Plan } from "../types/subscription.schema";

interface UpgradePromptProps {
  waterType: "SALT" | "FRESH";
  zoneName?: string;
}

export function UpgradePrompt({ waterType, zoneName }: UpgradePromptProps) {
  const { mutate: checkout, isPending } = useCheckout();

  const plan: Plan = waterType === "FRESH" ? "FRESHWATER" : "SALTWATER";
  const planLabel = waterType === "FRESH" ? "Freshwater" : "Saltwater";

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center">
      <div className="rounded-full bg-muted p-3">
        <Lock className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold">
          {zoneName ? `${zoneName} is locked` : "Forecast locked"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Upgrade to the {planLabel} or All Access plan to unlock full forecast details.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => checkout(plan)}
        >
          {isPending ? "Loading..." : `Get ${planLabel} — $9/mo`}
        </Button>
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => checkout("ALL_ACCESS")}
        >
          {isPending ? "Loading..." : "All Access — $12/mo"}
        </Button>
      </div>
    </div>
  );
}
