"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [setupQRCode, setSetupQRCode] = useState<string | null>(null);
  const [setupBase32, setSetupBase32] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");

  const fetchStatus = async () => {
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/two-factor?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setTwoFactorEnabled(data.twoFactorEnabled);
      } else {
        toast.error(data.message || "Unable to fetch 2FA status");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!email) return;
    const timer = setTimeout(fetchStatus, 400);
    return () => clearTimeout(timer);
  }, [email]);

  const doAction = async (action: "setup" | "disable" | "verify") => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = { action, email };
      if (action === "verify") payload.code = verifyCode;

      const res = await fetch("/api/auth/two-factor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Action failed");
        return;
      }

      if (action === "setup") {
        setSetupQRCode(data.data.otpauthUrl);
        setSetupBase32(data.data.base32);
        toast.success("2FA setup initiated. Scan QR code or copy key.");
      } else if (action === "disable") {
        setTwoFactorEnabled(false);
        setSetupQRCode(null);
        setSetupBase32(null);
        toast.success("2FA disabled");
      } else if (action === "verify") {
        if (data.success) {
          setTwoFactorEnabled(true);
          toast.success("2FA code verified and enabled");
        } else {
          toast.error(data.message || "Invalid code");
        }
      }

      await fetchStatus();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-background text-slate-900">
      <h1 className="text-2xl font-bold">Account Security</h1>
      <p className="text-muted-foreground mt-1 mb-4">Enable and manage two-factor authentication for your account.</p>

      <div className="grid gap-4 max-w-lg">
        <label className="text-sm">
          Email
          <input
            value={email}
            type="email"
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
            placeholder="user@example.com"
          />
        </label>

        <div className="flex items-center gap-3">
          <p className="text-sm">Current 2FA status: {twoFactorEnabled ? "Enabled" : "Disabled"}</p>
          <Button disabled={loading || !email} onClick={() => doAction("setup")}>Set up 2FA</Button>
          <Button disabled={loading || !email || !twoFactorEnabled} onClick={() => doAction("disable")}>Disable 2FA</Button>
        </div>

        {setupQRCode && (
          <div className="rounded-lg border p-4 bg-card">
            <h2 className="text-sm font-semibold">Scan this QR code in your authenticator</h2>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(setupQRCode)}&size=250x250`} alt="2FA QR code" className="mt-2" />
            <p className="text-xs mt-2 text-muted-foreground">Or enter secret key: <strong>{setupBase32}</strong></p>
            <label className="block mt-3 text-sm">
              Enter 6-digit code to verify
              <input
                value={verifyCode}
                onChange={(event) => setVerifyCode(event.target.value)}
                className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm"
                placeholder="123456"
              />
            </label>
            <Button onClick={() => doAction("verify")} disabled={loading || verifyCode.length !== 6} className="mt-2">
              Verify 2FA code
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
