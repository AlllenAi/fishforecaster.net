import { validateSession } from "@/lib/auth/validateSession";
import { AuthContext, PermissionError } from "@/lib/auth/types";
import type { SubscriptionTier } from "@prisma/client";
import { checkTierAccess } from "@/modules/subscription/types/subscription.schema";

// ─── withSubscription Middleware ──────────────────────────────
// Wraps server actions that require a specific water type access.
// Checks the user's subscription tier against the required water type.
//
// Usage:
//   export const getFreshwaterForecast = withSubscription("FRESH")(
//     async (user, input) => { ... }
//   );

export function withSubscription(requiredWaterType: "SALT" | "FRESH") {
  return <Args extends unknown[], R>(
    actionFn: (user: AuthContext, ...args: Args) => Promise<R>
  ) => {
    return async (...args: Args): Promise<R> => {
      const user = await validateSession();

      const hasAccess = checkTierAccess(
        user.subscriptionTier as SubscriptionTier,
        requiredWaterType
      );

      if (!hasAccess) {
        const planNeeded = requiredWaterType === "FRESH" ? "Freshwater" : "Saltwater";
        throw new PermissionError(
          `Upgrade to the ${planNeeded} or All Access plan to view this forecast`
        );
      }

      return actionFn(user, ...args);
    };
  };
}
