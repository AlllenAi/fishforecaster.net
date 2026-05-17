import { RegisterForm } from "@/modules/auth/ui/RegisterForm";
import Image from "next/image";

export const metadata = {
  title: "Create Account - fishforecaster.net",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid place-items-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Image
              src="/logo.jpg"
              alt="fishforecaster.net"
              width={200}
              height={60}
              className="h-16 w-auto object-contain"
              priority
            />
          </div>
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
