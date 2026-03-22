import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AdminLeadsTable } from "@/modules/admin/ui/AdminLeadsTable";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminLeadsPage() {
  const session = await auth();

  if (!session?.user?.roles?.includes("admin")) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Admin Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Email Leads
        </h1>
        <p className="mt-1 text-muted-foreground">
          Leads captured from the landing page
        </p>
      </div>
      <AdminLeadsTable />
    </div>
  );
}
