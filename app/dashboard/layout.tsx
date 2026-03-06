import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { UserMenu } from "@/components/layout/UserMenu";
import { ModeToggle } from "@/components/darkmode-toggle";
import Link from "next/link";
import { Fish } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-bold tracking-tight"
            >
              <Fish className="h-5 w-5 text-primary" />
              <span className="hidden sm:inline">The Fish Forecaster</span>
              <span className="sm:hidden">TFF</span>
            </Link>
            <DashboardNav />
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserMenu
              name={session.user.name || "User"}
              email={session.user.email || ""}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
