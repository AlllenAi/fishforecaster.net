import Link from "next/link";
import { MyEventsList } from "@/modules/community/ui/MyEventsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata = {
  title: "My Events - The Fish Forecaster",
};

export default function MyEventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Events</h1>
          <p className="text-muted-foreground">
            Manage your community events and drafts.
          </p>
        </div>
        <Link href="/dashboard/community/events/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Event
          </Button>
        </Link>
      </div>

      <MyEventsList />
    </div>
  );
}
