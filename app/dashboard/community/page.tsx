import Link from "next/link";
import { CommunityFeed } from "@/modules/community/ui/CommunityFeed";
import { CommunityTabs } from "@/modules/community/ui/CommunityTabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Community - The Fish Forecaster",
};

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground">
            Fishing photos, stories, and events from fellow anglers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/community/mine">
            <Button variant="outline" size="sm">
              My Posts
            </Button>
          </Link>
          <Link href="/dashboard/community/new">
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Share Story
            </Button>
          </Link>
        </div>
      </div>

      <CommunityTabs />

      <CommunityFeed />
    </div>
  );
}
