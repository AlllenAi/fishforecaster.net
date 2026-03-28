import { Suspense } from "react";
import { AccountBilling } from "@/modules/subscription/ui/AccountBilling";
import { DataExportButton } from "@/modules/privacy/ui/DataExportButton";
import { DeleteAccountSection } from "@/modules/privacy/ui/DeleteAccountSection";
import { Download, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Account & Billing | The Fish Forecaster",
};

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-xl border bg-card" />
        }
      >
        <AccountBilling />
      </Suspense>

      {/* Your Data */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Your Data</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Download a copy of all your data as a JSON file. This includes your
          profile, catch reports, subscription info, and consent records.
        </p>
        <DataExportButton />
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/30 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold text-destructive">
            Danger Zone
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <DeleteAccountSection />
      </div>
    </div>
  );
}
