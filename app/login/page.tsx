import { Suspense } from "react";
import { LoginForm } from "@/modules/auth/ui/LoginForm";
import { LoginErrorBanner } from "@/modules/auth/ui/LoginErrorBanner";

export const metadata = {
  title: "Sign In - The Fish Forecaster",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen grid place-items-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            The Fish Forecaster
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to your account
          </p>
        </div>
        <Suspense>
          <LoginErrorBanner />
        </Suspense>
        <div className="border rounded-lg p-6 bg-card shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
