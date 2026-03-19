import Link from "next/link";
import { MyReportsList } from "@/modules/catchReports/ui/MyReportsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata = {
  title: "My Catches - The Fish Forecaster",
};

export default function MyCatchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Catches</h1>
          <p className="text-muted-foreground">
            Manage your submitted catch reports.
          </p>
        </div>
        <Link href="/dashboard/catches/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Report Catch
          </Button>
        </Link>
      </div>

      <MyReportsList />
    </div>
  );
}
