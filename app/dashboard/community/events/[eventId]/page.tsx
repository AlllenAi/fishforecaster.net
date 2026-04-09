import { EventDetail } from "@/modules/community/ui/EventDetail";

export const metadata = {
  title: "Event - The Fish Forecaster",
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <EventDetail eventId={eventId} />;
}
