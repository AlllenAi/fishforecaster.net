import { MapContent } from "@/modules/forecast/ui/MapContent";

export const metadata = {
  title: "Map - The Fish Forecaster",
};

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Zone Map</h1>
        <p className="text-muted-foreground">
          Color-coded fishing zones across Southern California.
        </p>
      </div>
      <MapContent />
    </div>
  );
}
