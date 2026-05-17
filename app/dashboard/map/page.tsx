import { MapContent } from "@/modules/forecast/ui/MapContent";
import { CatchMapContent } from "@/modules/catchReports/ui/CatchMapContent";
import { MapTabs } from "@/modules/catchReports/ui/MapTabs";

export const metadata = {
  title: "Map - fishforecaster.net",
};

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Zone Map</h1>
        <p className="text-muted-foreground">
          Forecast scores and recent catches across Southern California.
        </p>
      </div>
      <MapTabs
        forecastMap={<MapContent />}
        catchMap={<CatchMapContent />}
      />
    </div>
  );
}
