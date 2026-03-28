"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useDataExport } from "../hooks/useDataExport";

export function DataExportButton() {
  const { mutate: exportData, isPending } = useDataExport();

  return (
    <Button
      variant="outline"
      onClick={() => exportData()}
      disabled={isPending}
    >
      <Download className="mr-2 h-4 w-4" />
      {isPending ? "Preparing export..." : "Export My Data"}
    </Button>
  );
}
