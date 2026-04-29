import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks ──────────────────────────────────────────
const { mockPrisma, mockBcrypt, mockSpeakeasy, mockSendEmail, mockSendWelcomeEmail, mockRateLimit } =
  vi.hoisted(() => ({
    mockPrisma: {
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      consent: {
        createMany: vi.fn(),
      },
    },
    mockBcrypt: {
      hash: vi.fn(),
    },
    mockSpeakeasy: {
      generateSecret: vi.fn(),
      totp: { verify: vi.fn() },
    },
    mockSendEmail: vi.fn(),
    mockSendWelcomeEmail: vi.fn(),
    mockRateLimit: {
      checkRegisterLimit: vi.fn(),
      checkPasswordResetLimit: vi.fn(),
      checkTwoFactorLimit: vi.fn(),
    },
  }));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("bcryptjs", () => ({ default: mockBcrypt }));
vi.mock("speakeasy", () => ({ default: mockSpeakeasy }));
vi.mock("@/modules/email/services/emailService", () => ({
  sendEmail: mockSendEmail,
}));
vi.mock("@/modules/email/serverActions/email.action", () => ({
  sendWelcomeEmail: mockSendWelcomeEmail,
}));
vi.mock("@/lib/middleware/rateLimit", () => mockRateLimit);

import {
  register,
  setupTwoFactor,
  verifyTwoFactorCode,
  sendPasswordResetRequest,
  updateForgottenPassword,
} from "@/modules/auth/serverActions/auth.action";

beforeEach(() => {
  vi.clearAllMocks();
  mockRateLimit.checkRegisterLimit.mockResolvedValue(undefined);
  mockRateLimit.checkPasswordResetLimit.mockResolvedValue(undefined);
  mockRateLimit.checkTwoFactorLimit.mockResolvedValue(undefined);
  mockSendWelcomeEmail.mockResolvedValue(undefined);
  mockBcrypt.hash.mockResolvedValue("hashed_password");
  process.env.NEXTAUTH_URL = "http://localhost:3000";
});

// ─── register ──────────────────────────────────────────────

describe("register", () => {
  const validInput = {
    name: "Test Angler",
    email: "test@example.com",
    password: "StrongPass123!",
    confirmPassword: "StrongPass123!",
  };

  it("creates a user with hashed password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "user_new" });
    mockPrisma.consent.createMany.mockResolvedValue({ count: 2 });

    const result = await register(validInput);

    expect(result.success).toBe(true);
    expect(result.userId).toBe("user_new");
    expect(mockBcrypt.hash).toHaveBeenCalledWith("StrongPass123!", 12);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "test@example.com",
        password: "hashed_password",
        roles: ["user"],
        subscriptionTier: "FREE",
      }),
    });
  });

  it("records GDPR consent for terms and privacy", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "user_new" });
    mockPrisma.consent.createMany.mockResolvedValue({ count: 2 });

    await register(validInput);

    expect(mockPrisma.consent.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ userId: "user_new", type: "terms", granted: true }),
        expect.objectContaining({ userId: "user_new", type: "privacy", granted: true }),
      ]),
    });
  });

  it("throws ConflictError when email already exists", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "existing" });

    await expect(register(validInput)).rejects.toThrow(
      "An account with this email already exists"
    );
  });

  it("throws ValidationError on invalid input", async () => {
    await expect(
      register({ name: "", email: "bad", password: "x", confirmPassword: "x" })
    ).rejects.toThrow();
  });

  it("sends welcome email after registration", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "user_new" });
    mockPrisma.consent.createMany.mockResolvedValue({ count: 2 });

    await register(validInput);

    expect(mockSendWelcomeEmail).toHaveBeenCalledWith("user_new");
  });
});

// ─── setupTwoFactor ────────────────────────────────────────

describe("setupTwoFactor", () => {
  it("generates a TOTP secret and enables 2FA", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user_1" });
    mockPrisma.user.update.mockResolvedValue({});
    mockSpeakeasy.generateSecret.mockReturnValue({
      base32: "SECRET32",
      ascii: "secretascii",
      otpauth_url: "otpauth://totp/test",
    });

    const result = await setupTwoFactor("test@example.com");

    expect(result.base32).toBe("SECRET32");
    expect(result.otpauthUrl).toBe("otpauth://totp/test");
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      data: { twoFactorEnabled: true, twoFactorSecret: "SECRET32" },
    });
  });

  it("throws when email is empty", async () => {
    await expect(setupTwoFactor("")).rejects.toThrow("Email is required");
  });

  it("throws when user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(setupTwoFactor("nobody@test.com")).rejects.toThrow(
      "User not found"
    );
  });
});

// ─── verifyTwoFactorCode ───────────────────────────────────

describe("verifyTwoFactorCode", () => {
  it("returns success when code is valid", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      twoFactorEnabled: true,
      twoFactorSecret: "SECRET32",
    });
    mockSpeakeasy.totp.verify.mockReturnValue(true);

    const result = await verifyTwoFactorCode("test@example.com", "123456");

    expect(result.success).toBe(true);
  });

  it("returns failure when code is invalid", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      twoFactorEnabled: true,
      twoFactorSecret: "SECRET32",
    });
    mockSpeakeasy.totp.verify.mockReturnValue(false);

    const result = await verifyTwoFactorCode("test@example.com", "000000");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid two-factor authentication code");
  });

  it("returns failure when 2FA not enabled", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });

    const result = await verifyTwoFactorCode("test@example.com", "123456");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Two-factor not enabled for this account");
  });
});

// ─── sendPasswordResetRequest ──────────────────────────────

describe("sendPasswordResetRequest", () => {
  it("sends reset email when user exists", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      name: "Test",
      email: "test@example.com",
    });
    mockPrisma.user.update.mockResolvedValue({});
    mockSendEmail.mockResolvedValue(undefined);

    const result = await sendPasswordResetRequest("test@example.com");

    expect(result.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      "test@example.com",
      "Password reset request",
      expect.stringContaining("reset-password?token=")
    );
  });

  it("returns safe response when user does not exist", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await sendPasswordResetRequest("nobody@example.com");

    expect(result.success).toBe(true);
    expect(result.message).toContain("If that account exists");
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("returns failure when email is empty", async () => {
    const result = await sendPasswordResetRequest("");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Email is required");
  });
});

// ─── updateForgottenPassword ───────────────────────────────

describe("updateForgottenPassword", () => {
  it("resets password with valid token", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: "user_1" });
    mockPrisma.user.update.mockResolvedValue({});

    const result = await updateForgottenPassword("valid_token", "NewStrong123!");

    expect(result.success).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: {
        password: "hashed_password",
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });
  });

  it("throws on expired or invalid token", async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    await expect(
      updateForgottenPassword("bad_token", "NewStrong123!")
    ).rejects.toThrow("Invalid or expired password reset token");
  });

  it("throws on missing token", async () => {
    await expect(
      updateForgottenPassword("", "NewStrong123!")
    ).rejects.toThrow("Invalid token");
  });
});
