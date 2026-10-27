import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMaintenanceCode,
  deleteMaintenanceCode,
  fetchMaintenanceCodes,
  fetchMttrSummary,
} from "@/services/maintenanceCodesService";
import type { CreateMaintenanceCodeInput, MaintenanceCodeType } from "@/types/maintenanceCodes";

const KEY = ["maintenance-codes"] as const;

export function useMaintenanceCodes(type?: MaintenanceCodeType) {
  const queryClient = useQueryClient();
  const list = useQuery({
    queryKey: [...KEY, type ?? "all"],
    queryFn: () => fetchMaintenanceCodes(type),
  });

  const create = useMutation({
    mutationFn: (input: CreateMaintenanceCodeInput) => createMaintenanceCode(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteMaintenanceCode(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  return {
    codes: list.data ?? [],
    isLoading: list.isLoading,
    error: list.error,
    refetch: list.refetch,
    create,
    remove,
  };
}

export function useMttrSummary(days = 90) {
  return useQuery({
    queryKey: [...KEY, "mttr", days],
    queryFn: () => fetchMttrSummary(days),
  });
}
