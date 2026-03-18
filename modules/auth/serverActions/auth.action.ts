"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "../types/auth.schema";
import { ConflictError, ValidationError } from "@/lib/auth/types";
import { sendWelcomeEmail } from "@/modules/email/serverActions/email.action";

export async function register(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0].message);
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roles: ["user"],
      subscriptionTier: "FREE",
    },
  });

  // Send welcome email (fire and forget)
  sendWelcomeEmail(user.id).catch((err) =>
    console.error("[Auth] Failed to send welcome email:", err)
  );

  return { success: true, userId: user.id };
}
