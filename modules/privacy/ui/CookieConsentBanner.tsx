"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "../hooks/useCookieConsent";

export function CookieConsentBanner() {
  const { hasConsented, acceptAll, acceptEssentialOnly } = useCookieConsent();

  // Don't render anything until we've checked localStorage (avoids flicker)
  // or if the user has already made a choice
  if (hasConsented === null || hasConsented === true) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>
            We use essential cookies to keep you logged in. No tracking cookies
            are used.{" "}
            <Link href="/privacy" className="text-primary underline hover:no-underline">
              Learn more
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={acceptEssentialOnly}>
            Essential Only
          </Button>
          <Button size="sm" onClick={acceptAll}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
