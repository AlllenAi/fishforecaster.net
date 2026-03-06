import { defaultMeta } from "@/lib/seo";
import { LandingPage } from "@/modules/landing/ui/LandingPage";

export const metadata = defaultMeta;

export default function Home() {
  return <LandingPage />;
}
