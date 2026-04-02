"use client";

import Link from "next/link";
import { Fish, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingCards } from "@/modules/subscription/ui/PricingCards";

interface PricingPageClientProps {
  currentTier: "FREE" | "FRESHWATER" | "SALTWATER" | "ALL_ACCESS" | null;
  isLoggedIn: boolean;
}

const faqs = [
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes! You can upgrade, downgrade, or switch between Freshwater and Saltwater plans at any time. Changes take effect immediately, and we'll prorate the billing.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, Amex, Discover) through our secure payment processor, Stripe.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Absolutely. Cancel anytime from your account page. You'll keep access until the end of your billing period — no penalties, no hassle.",
  },
  {
    question: "What's included in the free tier?",
    answer:
      "Free users can browse the zone list and see zone names, but forecast details (scores, bite windows, species data) are locked behind a subscription.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "We don't currently offer a free trial, but you can cancel within the first 24 hours for a full refund if you're not satisfied.",
  },
];

export function PricingPageClient({ currentTier, isLoggedIn }: PricingPageClientProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <Fish className="h-5 w-5 text-primary" />
            The Fish Forecaster
          </Link>
          <div className="flex items-center gap-2">
            {currentTier ? (
              <Button size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, Honest <span className="text-primary">Pricing</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Choose the water you fish. Cancel anytime. No hidden fees.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl">
          <PricingCards currentTier={currentTier} interactive={isLoggedIn} />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 divide-y">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between font-medium">
                  {faq.question}
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
