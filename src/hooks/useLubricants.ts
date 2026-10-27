import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adjustLubricantStock,
  createLubricant,
  deleteLubricant,
  fetchLubricants,
  fetchStockAdjustments,
  fetchUsageLogs,
  updateLubricant,
} from "@/services/lubricantService";
import type { CreateLubricantInput, UpdateLubricantInput } from "@/types/lubricants";
import { summarizeUsageByAsset, summarizeUsageByLubricant } from "@/lib/lubricantAnalytics";
import { useMemo } from "react";

const LUBRICANTS_KEY = ["lubricants"] as const;
const USAGE_KEY = ["lubricants", "usage"] as const;

export function useLubricants() {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: LUBRICANTS_KEY,
    queryFn: fetchLubricants,
  });

  const usage = useQuery({
    queryKey: [...USAGE_KEY, 180],
    queryFn: () => fetchUsageLogs(180),
  });

  const byLubricant = useMemo(
    () => summarizeUsageByLubricant(usage.data ?? []),
    [usage.data],
  );
  const byAsset = useMemo(() => summarizeUsageByAsset(usage.data ?? []), [usage.data]);

  const create = useMutation({
    mutationFn: (input: CreateLubricantInput) => createLubricant(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LUBRICANTS_KEY }),
  });

  const update = useMutation({
    mutationFn: (input: UpdateLubricantInput) => updateLubricant(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LUBRICANTS_KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteLubricant(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LUBRICANTS_KEY }),
  });

  const adjustStock = useMutation({
    mutationFn: (args: {
      lubricantId: string;
      type: "receive" | "adjustment";
      delta: number;
      notes?: string;
    }) => adjustLubricantStock(args.lubricantId, args.type, args.delta, args.notes),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: LUBRICANTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["lubricants", "adjustments", vars.lubricantId] });
    },
  });

  return {
    lubricants: list.data ?? [],
    isLoading: list.isLoading,
    error: list.error as Error | null,
    refetch: list.refetch,
    usageLogs: usage.data ?? [],
    usageLoading: usage.isLoading,
    consumptionByLubricant: byLubricant,
    consumptionByAsset: byAsset,
    create,
    update,
    remove,
    adjustStock,
  };
}

export function useLubricantAdjustments(lubricantId: string | undefined) {
  return useQuery({
    queryKey: ["lubricants", "adjustments", lubricantId],
    queryFn: () => fetchStockAdjustments(lubricantId!),
    enabled: !!lubricantId,
  });
}
