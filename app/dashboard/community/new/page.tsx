import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { CreatePostForm } from "@/modules/community/ui/CreatePostForm";

export const metadata = {
  title: "Share Your Story - The Fish Forecaster",
};

export default async function NewPostPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const isFreeUser = session.user.subscriptionTier === "FREE";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Share Your Story</h1>
        <p className="text-muted-foreground">
          Got a great fishing photo or story? Share it with the community!
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <CreatePostForm isFreeUser={isFreeUser} />
      </div>
    </div>
  );
}
