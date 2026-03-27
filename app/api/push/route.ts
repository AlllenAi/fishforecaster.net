// ─── Push Subscription API ───────────────────────────────────
// Handles saving and removing browser push subscriptions.
// Exception to "no API routes" rule — browser Push API needs
// a standard HTTP endpoint to post subscriptions to.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

// POST: Save a push subscription for the authenticated user
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await req.json();

  if (!subscription?.endpoint) {
    return NextResponse.json(
      { error: "Invalid push subscription" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pushSubscription: subscription },
  });

  return NextResponse.json({ success: true });
}

// DELETE: Remove the push subscription for the authenticated user
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pushSubscription: null },
  });

  return NextResponse.json({ success: true });
}
