import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adjustPartStock,
  createPart,
  deletePart,
  fetchParts,
  fetchStockAdjustments,
  fetchUsageLogs,
  updatePart,
} from "@/services/partsService";
import type { CreatePartInput, UpdatePartInput } from "@/types/parts";
import { summarizeUsageByAsset, summarizeUsageByPart } from "@/lib/partsAnalytics";
import { useMemo } from "react";

const PARTS_KEY = ["parts"] as const;

export function useParts() {
  const queryClient = useQueryClient();
  const list = useQuery({ queryKey: PARTS_KEY, queryFn: fetchParts });
  const usage = useQuery({
    queryKey: [...PARTS_KEY, "usage", 180],
    queryFn: () => fetchUsageLogs(180),
  });
  const consumptionByPart = useMemo(
    () => summarizeUsageByPart(usage.data ?? []),
    [usage.data],
  );
  const consumptionByAsset = useMemo(
    () => summarizeUsageByAsset(usage.data ?? []),
    [usage.data],
  );

  const create = useMutation({
    mutationFn: (input: CreatePartInput) => createPart(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PARTS_KEY }),
  });
  const update = useMutation({
    mutationFn: (input: UpdatePartInput) => updatePart(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PARTS_KEY }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deletePart(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PARTS_KEY }),
  });
  const adjustStock = useMutation({
    mutationFn: (args: {
      partId: string;
      type: "receive" | "adjustment";
      delta: number;
      notes?: string;
    }) => adjustPartStock(args.partId, args.type, args.delta, args.notes),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: PARTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["parts", "adjustments", vars.partId] });
    },
  });

  return {
    parts: list.data ?? [],
    isLoading: list.isLoading,
    error: list.error as Error | null,
    refetch: list.refetch,
    usageLogs: usage.data ?? [],
    consumptionByPart,
    consumptionByAsset,
    create,
    update,
    remove,
    adjustStock,
  };
}

export function usePartAdjustments(partId: string | undefined) {
  return useQuery({
    queryKey: ["parts", "adjustments", partId],
    queryFn: () => fetchStockAdjustments(partId!),
    enabled: !!partId,
  });
}
