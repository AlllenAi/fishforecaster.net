import { Suspense } from "react";
import { AccountBilling } from "@/modules/subscription/ui/AccountBilling";

export const metadata = {
  title: "Account & Billing | The Fish Forecaster",
};

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 animate-pulse rounded-xl border bg-card" />
      }
    >
      <AccountBilling />
    </Suspense>
  );
}
