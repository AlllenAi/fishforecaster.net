import { DashboardContent } from "@/modules/forecast/ui/DashboardContent";

export const metadata = {
  title: "Dashboard - The Fish Forecaster",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Forecasts</h1>
        <p className="text-muted-foreground">
          Daily bite scores for Southern California fishing zones.
        </p>
      </div>
      <DashboardContent />
    </div>
  );
}
