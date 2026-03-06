import { ZoneDetailContent } from "@/modules/forecast/ui/ZoneDetailContent";

export const metadata = {
  title: "Zone Forecast - The Fish Forecaster",
};

export default async function ZoneDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ZoneDetailContent slug={slug} />;
}
