import { unsubscribe } from "@/modules/email/serverActions/email.action";
import { Fish } from "lucide-react";
import Link from "next/link";

interface UnsubscribePageProps {
  searchParams: Promise<{ token?: string; type?: string }>;
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams;
  const token = params.token;
  const type = (params.type as "user" | "lead") || "user";

  let result = { success: false, message: "Missing unsubscribe token." };

  if (token) {
    result = await unsubscribe(token, type);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-lg font-bold"
        >
          <Fish className="h-5 w-5 text-primary" />
          The Fish Forecaster
        </Link>

        <div className="rounded-xl border p-8">
          {result.success ? (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <span className="text-2xl">&#10003;</span>
              </div>
              <h1 className="text-xl font-bold">Unsubscribed</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {result.message}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                You can re-enable emails anytime from your{" "}
                <Link href="/dashboard/account" className="text-primary underline">
                  account settings
                </Link>.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <span className="text-2xl">&#10007;</span>
              </div>
              <h1 className="text-xl font-bold">Something went wrong</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {result.message}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
