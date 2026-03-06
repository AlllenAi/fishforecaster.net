import { RegisterForm } from "@/modules/auth/ui/RegisterForm";

export const metadata = {
  title: "Create Account - The Fish Forecaster",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid place-items-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            The Fish Forecaster
          </h1>
          <p className="text-muted-foreground text-sm">
            Create your account
          </p>
        </div>
        <div className="border rounded-lg p-6 bg-card shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
