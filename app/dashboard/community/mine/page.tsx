import Link from "next/link";
import { MyPostsList } from "@/modules/community/ui/MyPostsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata = {
  title: "My Posts - The Fish Forecaster",
};

export default function MyPostsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Posts</h1>
          <p className="text-muted-foreground">
            Manage your community posts and drafts.
          </p>
        </div>
        <Link href="/dashboard/community/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <MyPostsList />
    </div>
  );
}
