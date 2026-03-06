import { auth } from "@/lib/auth/auth";

export const metadata = {
  title: "Dashboard - The Fish Forecaster",
};

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || "Angler"}. Forecasts are coming
          in Phase 3.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Saltwater Zones", "Freshwater Zones", "Your Favorites"].map(
          (title) => (
            <div
              key={title}
              className="rounded-lg border bg-card p-6 shadow-sm"
            >
              <h3 className="font-medium">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Coming soon...
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
