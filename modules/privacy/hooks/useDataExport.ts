"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { exportUserData } from "../serverActions/privacy.action";

export function useDataExport() {
  return useMutation({
    mutationFn: async () => {
      const result = await exportUserData();
      if (!result.success) throw new Error("Export failed");
      return result.data;
    },
    onSuccess: (data) => {
      // Create a JSON file and trigger download in the browser
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "fishforecaster-net-data-export.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Your data export is ready!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
