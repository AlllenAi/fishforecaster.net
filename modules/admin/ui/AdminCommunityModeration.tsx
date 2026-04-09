"use client";

import { useState } from "react";
import { AdminCommunityTable } from "./AdminCommunityTable";
import { AdminEventTable } from "./AdminEventTable";
import { cn } from "@/lib/utils";

export function AdminCommunityModeration() {
  const [tab, setTab] = useState<"posts" | "events">("posts");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        <button
          onClick={() => setTab("posts")}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            tab === "posts"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Posts
        </button>
        <button
          onClick={() => setTab("events")}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            tab === "events"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Events
        </button>
      </div>

      {tab === "posts" ? <AdminCommunityTable /> : <AdminEventTable />}
    </div>
  );
}
