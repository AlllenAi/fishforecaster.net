import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AdminAuditLog } from "@/modules/admin/ui/AdminAuditLog";

export const metadata = {
  title: "Audit Log - Admin - The Fish Forecaster",
};

export default async function AuditLogPage() {
  const session = await auth();

  if (!session?.user?.roles?.includes("admin")) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="mt-1 text-muted-foreground">
          Track all admin actions across the platform
        </p>
      </div>
      <AdminAuditLog />
    </div>
  );
}
