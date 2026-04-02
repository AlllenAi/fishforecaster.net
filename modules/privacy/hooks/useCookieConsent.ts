"use client";

import { useState, useCallback } from "react";
import { recordAnonymousConsent } from "../serverActions/privacy.action";
import { COOKIE_POLICY_VERSION } from "../types/privacy.schema";

const STORAGE_KEY = "cookie-consent";

interface CookiePreferences {
  essential: true; // always true — the app needs session cookies to work
  analytics: boolean;
}

export function useCookieConsent() {
  const [hasConsented, setHasConsented] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY) !== null;
  });
  const [preferences, setPreferences] = useState<CookiePreferences | null>(
    () => {
      if (typeof window === "undefined") return null;
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
  );

  const acceptAll = useCallback(() => {
    const prefs: CookiePreferences = { essential: true, analytics: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setHasConsented(true);
    setPreferences(prefs);

    // Record in database (fire and forget)
    recordAnonymousConsent({
      type: "cookies",
      version: COOKIE_POLICY_VERSION,
      granted: true,
    }).catch(() => {});
  }, []);

  const acceptEssentialOnly = useCallback(() => {
    const prefs: CookiePreferences = { essential: true, analytics: false };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setHasConsented(true);
    setPreferences(prefs);

    // Record in database (fire and forget)
    recordAnonymousConsent({
      type: "cookies",
      version: COOKIE_POLICY_VERSION,
      granted: false,
    }).catch(() => {});
  }, []);

  return { hasConsented, preferences, acceptAll, acceptEssentialOnly };
}
