import { CatchReportForm } from "@/modules/catchReports/ui/CatchReportForm";

export const metadata = {
  title: "Report a Catch - The Fish Forecaster",
};

export default function NewCatchPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Report a Catch</h1>
        <p className="text-muted-foreground">
          Share your catch with the community.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <CatchReportForm />
      </div>
    </div>
  );
}
