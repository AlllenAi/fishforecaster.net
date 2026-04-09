import { validateSession } from "@/lib/auth/validateSession";
import { AuthContext, PermissionError } from "@/lib/auth/types";

export function withPaidSubscription<Args extends any[], R>(
  actionFn: (user: AuthContext, ...args: Args) => Promise<R>
) {
  return async (...args: Args): Promise<R> => {
    const user = await validateSession();

    if (user.subscriptionTier === "FREE") {
      throw new PermissionError(
        "Upgrade to a paid plan to access this feature"
      );
    }

    return actionFn(user, ...args);
  };
}
