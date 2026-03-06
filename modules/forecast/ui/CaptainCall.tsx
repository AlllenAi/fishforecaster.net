"use client";

import { Anchor } from "lucide-react";

export function CaptainCall({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-center gap-2 text-primary">
        <Anchor className="h-5 w-5" />
        <h3 className="text-sm font-semibold uppercase tracking-wide">
          Captain&apos;s Call
        </h3>
      </div>
      <p className="mt-3 text-base leading-relaxed text-card-foreground italic">
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}
