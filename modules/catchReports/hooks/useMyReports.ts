"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getMyCatchReports,
  deleteCatchReport,
} from "../serverActions/catchReport.action";

export function useMyReports() {
  return useQuery({
    queryKey: ["my-reports"],
    queryFn: () => getMyCatchReports(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => deleteCatchReport(reportId),
    onSuccess: () => {
      toast.success("Report deleted");
      queryClient.invalidateQueries({ queryKey: ["my-reports"] });
      queryClient.invalidateQueries({ queryKey: ["catch-reports"] });
      queryClient.invalidateQueries({ queryKey: ["catch-map"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete report");
    },
  });
}
