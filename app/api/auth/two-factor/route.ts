import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setupTwoFactor, disableTwoFactor, verifyTwoFactorCode } from "@/modules/auth/serverActions/auth.action";
import { RateLimitError } from "@/lib/auth/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    twoFactorEnabled: user.twoFactorEnabled,
    email: user.email,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, email } = body as { action?: string; email?: string }; 

  if (!action || !email) {
    return NextResponse.json({ success: false, message: "Action and email are required" }, { status: 400 });
  }

  try {
    if (action === "setup") {
      const result = await setupTwoFactor(email);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "disable") {
      await disableTwoFactor(email);
      return NextResponse.json({ success: true });
    }

    if (action === "verify") {
      const code = body.code as string | undefined;
      if (!code) {
        return NextResponse.json({ success: false, message: "Code is required" }, { status: 400 });
      }

      const result = await verifyTwoFactorCode(email, code);
      return NextResponse.json({ success: result.success, message: result.message });
    }

    return NextResponse.json({ success: false, message: "Unsupported action" }, { status: 400 });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 429 });
    }
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
