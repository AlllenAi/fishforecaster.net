import Link from "next/link";
import { CatchReportFeed } from "@/modules/catchReports/ui/CatchReportFeed";
import { CatchStats } from "@/modules/catchReports/ui/CatchStats";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Catch Reports - fishforecaster.net",
};

export default function CatchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catch Reports</h1>
          <p className="text-muted-foreground">
            Recent catches from anglers across Southern California.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/catches/mine">
            <Button variant="outline" size="sm">
              My Reports
            </Button>
          </Link>
          <Link href="/dashboard/catches/new">
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Report Catch
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <CatchReportFeed />
        <aside className="space-y-4">
          <CatchStats />
        </aside>
      </div>
    </div>
  );
}
