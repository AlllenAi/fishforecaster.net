import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { CreateEventForm } from "@/modules/community/ui/CreateEventForm";

export const metadata = {
  title: "Create Event - The Fish Forecaster",
};

export default async function NewEventPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const isFreeUser = session.user.subscriptionTier === "FREE";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Event</h1>
        <p className="text-muted-foreground">
          Organize a fishing tournament, meetup, or outing for the community!
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <CreateEventForm isFreeUser={isFreeUser} />
      </div>
    </div>
  );
}
