import { ResetPasswordForm } from "@/modules/auth/ui/ResetPasswordForm";

export const metadata = {
  title: "Reset Password - The Fish Forecaster",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground text-sm">
            Provide a new password to restore access.
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-card shadow-sm">
          <ResetPasswordForm token={token || ""} />
        </div>
      </div>
    </div>
  );
}
