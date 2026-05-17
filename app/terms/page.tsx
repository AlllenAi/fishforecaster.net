import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Terms of Service | fishforecaster.net",
  description: "Terms and conditions for using fishforecaster.net.",
};

export default function TermsOfServicePage() {
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

        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: March 27, 2026 &middot; Version 1.0
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2">
              By creating an account or using fishforecaster.net, you agree to
              these Terms of Service and our{" "}
              <Link
                href="/privacy"
                className="text-primary underline hover:no-underline"
              >
                Privacy Policy
              </Link>
              . If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              2. Description of Service
            </h2>
            <p className="mt-2">
              fishforecaster.net provides AI-powered fishing forecasts, bite
              window predictions, and community catch reports for Southern
              California fishing zones. The service is available as a web
              application with free and paid subscription tiers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. User Accounts
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>You must provide accurate information when registering.</li>
              <li>You are responsible for keeping your password secure.</li>
              <li>You must be at least 13 years old to use this service.</li>
              <li>
                One account per person. Sharing accounts is not permitted.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              4. Subscriptions and Payments
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Paid subscriptions grant access to premium fishing zones and
                features for a fixed period.
              </li>
              <li>Payments are processed securely through Stripe.</li>
              <li>
                Refund requests are handled on a case-by-case basis. Contact us
                if you have an issue with a payment.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              5. Acceptable Use
            </h2>
            <p className="mt-2">You agree not to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Submit false or misleading catch reports.</li>
              <li>
                Upload inappropriate, offensive, or copyrighted content.
              </li>
              <li>
                Attempt to access other users&apos; accounts or data.
              </li>
              <li>
                Use automated tools to scrape or misuse the service.
              </li>
              <li>
                Violate any applicable local, state, or federal laws, including
                fishing regulations.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              6. Forecast Disclaimer
            </h2>
            <p className="mt-2">
              <strong>
                Fishing forecasts are predictions based on weather, tide, moon
                phase, and historical data. They are not guarantees.
              </strong>{" "}
              Actual fishing conditions may vary. fishforecaster.net is not
              responsible for fishing outcomes, and forecasts should not be
              relied upon for safety decisions. Always check local weather and
              marine conditions before heading out.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              7. Intellectual Property
            </h2>
            <p className="mt-2">
              fishforecaster.net name, logo, forecasting algorithms, and
              website content are our property. Catch reports and photos you
              submit remain yours, but you grant us a license to display them
              on the platform and use aggregated data to improve forecasts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              8. Limitation of Liability
            </h2>
            <p className="mt-2">
              fishforecaster.net is provided &ldquo;as is&rdquo; without
              warranties of any kind. We are not liable for any damages
              resulting from your use of the service, including but not limited
              to lost catches, incorrect forecasts, or service downtime.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              9. Termination
            </h2>
            <p className="mt-2">
              We may suspend or terminate your account if you violate these
              terms. You may delete your account at any time from your{" "}
              <Link
                href="/dashboard/account"
                className="text-primary underline hover:no-underline"
              >
                Account page
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              10. Changes to These Terms
            </h2>
            <p className="mt-2">
              We may update these terms from time to time. We will notify
              registered users of significant changes via email. Continued use
              of the service after changes constitutes acceptance of the updated
              terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              11. Contact
            </h2>
            <p className="mt-2">
              Questions about these terms? Contact us at{" "}
              <a
                href="mailto:support@fishforecaster.net"
                className="text-primary underline hover:no-underline"
              >
                support@fishforecaster.net
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
