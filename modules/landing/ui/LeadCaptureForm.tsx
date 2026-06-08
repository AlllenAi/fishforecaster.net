"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLeadCapture } from "../hooks/useLeadCapture";
import { Mail, Check } from "lucide-react";

export function LeadCaptureForm() {
  const [email, setEmail] = useState("");
  const [fishingType, setFishingType] = useState("both");
  const { mutate, isPending, isSuccess } = useLeadCapture();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      mutate({ email: email.trim(), fishingType });
    }
  };

  return (
    <section id="lead-capture" className="px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="rounded-2xl border bg-card/80 p-8 backdrop-blur sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-7 w-7" />
          </div>

          <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
            Get Your Free SoCal
            <span className="text-primary"> Bite Window Cheat Sheet</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            The best times to fish every zone — delivered straight to your inbox.
          </p>

          {isSuccess ? (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-score-excellent/20 text-score-excellent">
                <Check className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold">You&apos;re in!</p>
              <p className="text-sm text-muted-foreground">
                Check your email for your personalized cheat sheet.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {/* Fishing type selector */}
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  What do you fish?
                </p>
                <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
                  {[
                    { value: "salt", label: "Saltwater" },
                    { value: "fresh", label: "Freshwater" },
                    { value: "both", label: "Both" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFishingType(opt.value)}
                      className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                        fishingType === opt.value
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 rounded-lg border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending ? "Joining..." : "Get Free Access"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
