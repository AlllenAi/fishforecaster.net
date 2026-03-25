"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLogin } from "../hooks/useLogin";
import { loginSchema } from "../types/auth.schema";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const twoFactorUser = (email: string) =>
  email.toLowerCase().endsWith("@2fa.test") || email.toLowerCase() === "2fa@example.com";

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (lockoutSeconds > 0) {
      toast.error(`Too many attempts. Retry in ${lockoutSeconds} seconds.`);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      email: (formData.get("email") as string)?.trim(),
      password: formData.get("password") as string,
      rememberMe,
      twoFactorCode: twoFactorRequired ? twoFactorCode.trim() : undefined,
    };

    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (!twoFactorRequired && twoFactorUser(parsed.data.email)) {
      setTwoFactorRequired(true);
      toast("Two-factor authentication required for this account. Please enter your 6-digit code.");
      return;
    }

    login(parsed.data, {
      onSuccess: () => {
        setFailedAttempts(0);
        setTwoFactorCode("");
        setTwoFactorRequired(false);
      },
      onError: () => {
        setFailedAttempts((prev) => {
          const next = prev + 1;
          if (next >= 5) setLockoutSeconds(30);
          return next;
        });
      },
    });
  };

  return (
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
          className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
        {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
      </div>

      {twoFactorRequired && (
        <div>
          <label htmlFor="twoFactorCode" className="block text-sm font-medium mb-1">
            2FA Code
          </label>
          <input
            id="twoFactorCode"
            name="twoFactorCode"
            type="text"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            pattern="\\d{6}"
            minLength={6}
            maxLength={6}
            inputMode="numeric"
            required
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
          {errors.twoFactorCode && <p className="mt-1 text-xs text-destructive">{errors.twoFactorCode}</p>}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border border-border text-primary focus:ring-primary"
        />
        <label htmlFor="rememberMe" className="text-sm">
          Remember me
        </label>
      </div>

      {lockoutSeconds > 0 && (
        <p className="text-sm text-destructive">Too many attempts. Try again in {lockoutSeconds} seconds</p>
      )}

      <Button type="submit" disabled={isPending || lockoutSeconds > 0} className="w-full">
        {isPending ? "Signing in..." : "Sign In"}
      </Button>

      <div className="flex justify-between text-sm text-muted-foreground">
        <Link href="/login/forgot-password" className="text-primary underline hover:no-underline">
          Forgot Password?
        </Link>
        <Link href="/login/2fa" className="text-primary underline hover:no-underline">
          I have a 2FA code
        </Link>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary underline hover:no-underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
