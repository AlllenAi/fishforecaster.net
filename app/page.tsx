import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DbHealthCheck } from "@/modules/health/ui/DbHealthCheck";

export default function Home() {
  return (
    <div className="min-h-screen grid place-items-center px-4 bg-background text-foreground">
      <main className="w-full max-w-xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            The Fish Forecaster
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Know when the fish will bite. AI-powered fishing forecasts for
            Southern California.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/register">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        <DbHealthCheck />
      </main>
    </div>
  );
}
