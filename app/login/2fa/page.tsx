"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { verifyTwoFactorCode } from "@/modules/auth/serverActions/auth.action";
import { toast } from "sonner";
import { trackAuthEvent, setSentryBreadcrumb } from "@/lib/telemetry";

export default function TwoFactorPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const result = await verifyTwoFactorCode(email, code);
      if (!result.success) throw new Error(result.message || "Invalid code");

      toast.success("2FA verified. Please sign in again.");
      trackAuthEvent("2fa_verified", { email });
      setSentryBreadcrumb("2FA verification succeeded", { email });
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "2FA verification failed";
      toast.error(message);
      trackAuthEvent("2fa_failed", { email, message });
      setSentryBreadcrumb("2FA verification failed", { email, message });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Two-Factor Auth</h1>
          <p className="text-muted-foreground text-sm">
            Enter the code from your authenticator app.
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-card shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-1">
                6-digit code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="\\d{6}"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Verifying..." : "Verify code"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Need a new code? <a className="text-primary underline" href="/login/forgot-password">Reset password</a>
          </p>
        </div>
      </div>
    </div>
  );
}
