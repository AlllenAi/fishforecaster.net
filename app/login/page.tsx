import { Suspense } from "react";
import { LoginForm } from "@/modules/auth/ui/LoginForm";
import { LoginErrorBanner } from "@/modules/auth/ui/LoginErrorBanner";
import Image from "next/image";

export const metadata = {
  title: "Sign In - fishforecaster.net",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen grid place-items-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Image
              src="/logo.jpg"
              alt="fishforecaster.net"
              width={360}
              height={108}
              className="h-28 w-auto object-contain"
              priority
            />
          </div>
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
