// ─── Web Push Notification Service ───────────────────────────
//
// Sends push notifications to users who have subscribed via
// their browser. Uses the web-push library with VAPID keys.
//
// To generate VAPID keys, run:
//   npx web-push generate-vapid-keys

import webpush from "web-push";

let configured = false;

function ensureConfigured() {
  if (configured) return;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error(
      "[Push] VAPID keys not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env"
    );
  }

  webpush.setVapidDetails(
    `mailto:${process.env.EMAIL_FROM_ADDRESS || "support@fishforecaster.net"}`,
    publicKey,
    privateKey
  );

  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

/**
 * Send a push notification to a single subscription.
 * Returns true if sent, false if the subscription is expired/invalid.
 */
export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: PushPayload
): Promise<boolean> {
  ensureConfigured();

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (err: unknown) {
    const error = err as { statusCode?: number };
    // 410 Gone or 404 = subscription expired, caller should remove it
    if (error.statusCode === 410 || error.statusCode === 404) {
      return false;
    }
    console.error("[Push] Failed to send:", err);
    return false;
  }
}

/**
 * Send push notifications to multiple subscriptions in parallel.
 * Returns the count of successfully delivered notifications.
 */
export async function sendBatchPushNotifications(
  notifications: Array<{
    subscription: webpush.PushSubscription;
    payload: PushPayload;
  }>
): Promise<number> {
  const results = await Promise.allSettled(
    notifications.map((n) => sendPushNotification(n.subscription, n.payload))
  );

  return results.filter(
    (r) => r.status === "fulfilled" && r.value === true
  ).length;
}
