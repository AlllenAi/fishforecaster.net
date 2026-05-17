import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Privacy Policy | fishforecaster.net",
  description: "How fishforecaster.net collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="mb-8">
          <Link href="/">
            <Image
              src="/logo.jpg"
              alt="fishforecaster.net"
              width={200}
              height={60}
              className="h-16 w-auto object-contain"
            />
          </Link>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: March 27, 2026 &middot; Version 1.0
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              1. What Data We Collect
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Account information:</strong> Your name, email address,
                and password (stored securely using bcrypt hashing).
              </li>
              <li>
                <strong>Catch reports:</strong> Species, location (latitude and
                longitude), date, lure, weight, photos, and notes you submit.
              </li>
              <li>
                <strong>Payment information:</strong> When you purchase a
                subscription, payment is processed by Stripe. We store your
                Stripe customer ID and subscription status but never your card
                number.
              </li>
              <li>
                <strong>Preferences:</strong> Notification settings, email
                subscription preferences, favorite fishing zones, and theme
                preference.
              </li>
              <li>
                <strong>Security data:</strong> Two-factor authentication
                secrets (if enabled) and password reset tokens.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              2. How We Use Your Data
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>To provide fishing forecasts and personalized bite alerts.</li>
              <li>To send you email digests and product updates (you can unsubscribe anytime).</li>
              <li>To process payments and manage your subscription.</li>
              <li>To improve forecast accuracy using aggregated catch report data.</li>
              <li>To maintain security and prevent abuse of the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. Third-Party Services
            </h2>
            <p className="mt-2">
              We use the following third-party services to operate The Fish
              Forecaster:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Stripe</strong> &mdash; Payment processing. Stripe has
                its own{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Resend</strong> &mdash; Transactional emails (welcome
                emails, alerts, password resets).
              </li>
              <li>
                <strong>Vercel</strong> &mdash; Hosting and photo storage (Vercel Blob).
              </li>
              <li>
                <strong>MongoDB Atlas</strong> &mdash; Database hosting.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              4. Cookies and Local Storage
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Session cookie</strong> (essential): A secure,
                HTTP-only JWT token that keeps you logged in. This is required
                for the app to work.
              </li>
              <li>
                <strong>Theme preference</strong>: Stored in your
                browser&apos;s local storage (not a cookie) to remember your
                light/dark mode choice.
              </li>
              <li>
                <strong>Cookie consent</strong>: Stored in local storage to
                remember your cookie preference.
              </li>
            </ul>
            <p className="mt-2">
              We do not use any tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              5. Your Rights
            </h2>
            <p className="mt-2">You have the right to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Access your data:</strong> Download a copy of all your
                data from your{" "}
                <Link
                  href="/dashboard/account"
                  className="text-primary underline hover:no-underline"
                >
                  Account page
                </Link>
                .
              </li>
              <li>
                <strong>Delete your account:</strong> Permanently remove all
                your data from our systems via the Account page.
              </li>
              <li>
                <strong>Unsubscribe from emails:</strong> Use the unsubscribe
                link in any email or update your preferences in your account
                settings.
              </li>
              <li>
                <strong>Withdraw consent:</strong> You can withdraw your
                consent at any time by deleting your account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              6. Data Retention
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Your data is kept as long as your account is active.
              </li>
              <li>
                When you delete your account, all personal data is removed.
                Audit logs are anonymized (identity removed but records kept for
                legal compliance). Consent records are also anonymized.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              7. Contact
            </h2>
            <p className="mt-2">
              If you have questions about this privacy policy or your data,
              contact us at{" "}
              <a
                href="mailto:privacy@fishforecaster.net"
                className="text-primary underline hover:no-underline"
              >
                privacy@fishforecaster.net
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 border-t pt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to fishforecaster.net
          </Link>
        </div>
      </div>
    </div>
  );
}
