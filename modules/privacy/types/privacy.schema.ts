import { z } from "zod/v4";

export const consentTypeSchema = z.enum(["terms", "privacy", "cookies"]);

export const recordConsentSchema = z.object({
  type: consentTypeSchema,
  version: z.string(),
  granted: z.boolean(),
});

export const deleteAccountSchema = z.object({
  confirmEmail: z.email("Please enter a valid email"),
});

export type ConsentType = z.infer<typeof consentTypeSchema>;
export type RecordConsentInput = z.infer<typeof recordConsentSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

// Current policy versions — bump these when you update the pages
export const PRIVACY_POLICY_VERSION = "1.0";
export const TERMS_VERSION = "1.0";
export const COOKIE_POLICY_VERSION = "1.0";
