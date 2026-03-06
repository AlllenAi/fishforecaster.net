import { auth } from "@/lib/auth/auth";
import { AuthContext, UnauthorizedError } from "./types";

export async function validateSession(): Promise<AuthContext> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError("Authentication required");
  }

  return {
    userId: session.user.id,
    email: session.user.email!,
    name: session.user.name ?? undefined,
    roles: session.user.roles ?? ["user"],
    subscriptionTier: session.user.subscriptionTier ?? "FREE",
  };
}
