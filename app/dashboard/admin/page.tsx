import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AdminDashboardContent } from "@/modules/admin/ui/AdminDashboardContent";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.roles?.includes("admin")) {
    redirect("/dashboard");
  }

  return <AdminDashboardContent />;
}
