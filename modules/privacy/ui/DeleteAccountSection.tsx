"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useDeleteAccount } from "../hooks/useDeleteAccount";

export function DeleteAccountSection() {
  const { mutate: deleteAccount, isPending } = useDeleteAccount();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  if (!showConfirm) {
    return (
      <Button
        variant="outline"
        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => setShowConfirm(true)}
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Delete My Account
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-destructive">
            This action is permanent
          </p>
          <p className="text-sm text-muted-foreground">
            All your data will be permanently deleted, including your profile,
            catch reports, photos, and subscription. This cannot be undone.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="confirm-email"
          className="block text-sm font-medium mb-1"
        >
          Type your email to confirm
        </label>
        <input
          id="confirm-email"
          type="email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder="your@email.com"
          className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowConfirm(false);
            setConfirmEmail("");
          }}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={!confirmEmail || isPending}
          onClick={() => deleteAccount({ confirmEmail })}
        >
          {isPending ? "Deleting..." : "Permanently Delete Account"}
        </Button>
      </div>
    </div>
  );
}
