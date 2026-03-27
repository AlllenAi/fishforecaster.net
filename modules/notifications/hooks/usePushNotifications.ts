"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

type PushState = "unsupported" | "default" | "granted" | "denied";

export function usePushNotifications() {
  const [pushState, setPushState] = useState<PushState>("unsupported");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check initial state on mount
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushState("unsupported");
      setIsLoading(false);
      return;
    }

    setPushState(Notification.permission as PushState);

    // Check if already subscribed
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(sub !== null);
        setIsLoading(false);
      });
    });

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("[Push] SW registration failed:", err));
  }, []);

  const subscribe = useCallback(async () => {
    try {
      setIsLoading(true);

      const permission = await Notification.requestPermission();
      setPushState(permission as PushState);

      if (permission !== "granted") {
        toast.error("Notification permission denied");
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Send subscription to server
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) throw new Error("Failed to save subscription");

      setIsSubscribed(true);
      toast.success("Push notifications enabled");
    } catch (err) {
      console.error("[Push] Subscribe failed:", err);
      toast.error("Failed to enable push notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    try {
      setIsLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from server
      await fetch("/api/push", { method: "DELETE" });

      setIsSubscribed(false);
      toast.success("Push notifications disabled");
    } catch (err) {
      console.error("[Push] Unsubscribe failed:", err);
      toast.error("Failed to disable push notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    pushState,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
}
