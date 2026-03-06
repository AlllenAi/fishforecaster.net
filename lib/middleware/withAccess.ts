import { validateSession } from "@/lib/auth/validateSession";
import { AuthContext } from "@/lib/auth/types";

export function withAccess<Args extends any[], R>(
  actionFn: (user: AuthContext, ...args: Args) => Promise<R>
) {
  return async (...args: Args): Promise<R> => {
    const user = await validateSession();
    return actionFn(user, ...args);
  };
}
