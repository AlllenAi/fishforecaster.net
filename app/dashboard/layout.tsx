import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { UserMenu } from "@/components/layout/UserMenu";
import { ModeToggle } from "@/components/darkmode-toggle";
import Link from "next/link";
import Image from "next/image";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.roles?.includes("admin") ?? false;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center"
            >
              <Image
                src="/logo.jpg"
                alt="fishforecaster.net"
                width={140}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
            <DashboardNav isAdmin={isAdmin} />
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserMenu
              name={session.user.name || "User"}
              email={session.user.email || ""}
              subscriptionTier={session.user.subscriptionTier ?? "FREE"}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
