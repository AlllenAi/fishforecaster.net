import { AdminCommunityModeration } from "@/modules/admin/ui/AdminCommunityModeration";

export const metadata = {
  title: "Community Moderation - Admin - The Fish Forecaster",
};

export default function AdminCommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Community Moderation
        </h1>
        <p className="text-muted-foreground">
          Review and moderate community posts and events.
        </p>
      </div>

      <AdminCommunityModeration />
    </div>
  );
}
