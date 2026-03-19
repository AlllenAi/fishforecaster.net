"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { submitCatchReport } from "../serverActions/catchReport.action";

export function useSubmitCatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Record<string, unknown>) => submitCatchReport(input),
    onSuccess: () => {
      toast.success("Catch reported!");
      queryClient.invalidateQueries({ queryKey: ["catch-reports"] });
      queryClient.invalidateQueries({ queryKey: ["catch-map"] });
      queryClient.invalidateQueries({ queryKey: ["catch-stats"] });
      queryClient.invalidateQueries({ queryKey: ["my-reports"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit catch report");
    },
  });
}
