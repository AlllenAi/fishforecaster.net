"use server";

import { prisma } from "@/lib/prisma";
import { withAccess } from "@/lib/middleware/withAccess";
import { ValidationError } from "@/lib/auth/types";
import { headers } from "next/headers";
import {
  recordConsentSchema,
  deleteAccountSchema,
  type RecordConsentInput,
  type DeleteAccountInput,
} from "../types/privacy.schema";
import { gatherUserData } from "../services/dataExportService";
import { deleteUserAccount } from "../services/accountDeletionService";

// Record consent for a logged-in user
export const recordConsent = withAccess(
  async (user, input: RecordConsentInput) => {
    const parsed = recordConsentSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message);
    }

    const headersList = await headers();

    await prisma.consent.create({
      data: {
        userId: user.userId,
        type: parsed.data.type,
        version: parsed.data.version,
        granted: parsed.data.granted,
        ipAddress: headersList.get("x-forwarded-for") ?? undefined,
        userAgent: headersList.get("user-agent") ?? undefined,
      },
    });

    return { success: true };
  }
);

// Record cookie consent for visitors who aren't logged in
export async function recordAnonymousConsent(input: RecordConsentInput) {
  const parsed = recordConsentSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0].message);
  }

  const headersList = await headers();

  await prisma.consent.create({
    data: {
      userId: null,
      type: parsed.data.type,
      version: parsed.data.version,
      granted: parsed.data.granted,
      ipAddress: headersList.get("x-forwarded-for") ?? undefined,
      userAgent: headersList.get("user-agent") ?? undefined,
    },
  });

  return { success: true };
}

// Export all user data as JSON
export const exportUserData = withAccess(async (user) => {
  const data = await gatherUserData(user.userId);
  return { success: true, data };
});

// Delete user account (requires email confirmation)
export const deleteAccount = withAccess(
  async (user, input: DeleteAccountInput) => {
    const parsed = deleteAccountSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message);
    }

    if (parsed.data.confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
      throw new ValidationError(
        "The email you entered does not match your account email"
      );
    }

    await deleteUserAccount(user.userId);

    return { success: true };
  }
);
