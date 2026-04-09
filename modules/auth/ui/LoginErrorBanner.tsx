"use client";

import { useSearchParams } from "next/navigation";

const errorMessages: Record<string, string> = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  Configuration: "Invalid email or password. Please try again.",
  Default: "Something went wrong. Please try again.",
};

export function LoginErrorBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive">
      {message}
    </div>
  );
}
