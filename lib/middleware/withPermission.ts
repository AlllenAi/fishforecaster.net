import { validateSession } from "@/lib/auth/validateSession";
import { AuthContext, PermissionError } from "@/lib/auth/types";

function hasRequiredRoles(
  userRoles: string[],
  required: string | string[]
): boolean {
  const requiredRoles = Array.isArray(required) ? required : [required];
  return requiredRoles.some((role) => userRoles.includes(role));
}

export function withPermission(required: string | string[]) {
  return <Args extends any[], R>(
    actionFn: (user: AuthContext, ...args: Args) => Promise<R>
  ) => {
    return async (...args: Args): Promise<R> => {
      const user = await validateSession();

      if (!hasRequiredRoles(user.roles, required)) {
        throw new PermissionError("Insufficient permissions");
      }

      return actionFn(user, ...args);
    };
  };
}
