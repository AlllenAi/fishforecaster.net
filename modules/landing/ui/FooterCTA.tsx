"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function FooterCTA() {
  return (
    <footer className="border-t px-4">
      {/* CTA */}
      <div className="mx-auto max-w-4xl py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to know when the
          <span className="text-primary"> fish will bite?</span>
        </h2>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/register">Sign Up Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Already have an account?</Link>
          </Button>
        </div>
      </div>

      {/* Footer bar */}
      <div className="mx-auto max-w-6xl border-t py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Image src="/logo.jpg" alt="fishforecaster.net" width={80} height={24} className="h-6 w-auto object-contain" />
            <span>&copy; 2026 fishforecaster.net. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
