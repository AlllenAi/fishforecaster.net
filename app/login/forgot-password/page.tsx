import Link from "next/link";
import { useState } from "react";
import { useForgotPassword } from "@/modules/auth/hooks/useForgotPassword";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Forgot Password - The Fish Forecaster",
};

export default function ForgotPasswordPage() {
  const { mutate: sendResetEmail, isPending } = useForgotPassword();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendResetEmail(email);
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-card shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Sending..." : "Send reset link"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link href="/login" className="text-primary underline hover:no-underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
