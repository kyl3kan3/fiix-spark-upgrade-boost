import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMaintenanceCosts,
  fetchCostableAssets,
  createMaintenanceCost,
  type MaintenanceCost,
} from "@/services/costTrackingService";
import { summarizeCosts, type CostSummary } from "@/lib/costAnalytics";

const COSTS_KEY = ["cost-tracking", "costs"] as const;
const ASSETS_KEY = ["cost-tracking", "assets"] as const;

export interface UseCostTracking {
  costs: MaintenanceCost[];
  summary: CostSummary;
  assetNames: Map<string, string>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  create: ReturnType<typeof useMutation<void, Error, Parameters<typeof createMaintenanceCost>[0]>>;
}

export function useCostTracking(periodDays = 180): UseCostTracking {
  const queryClient = useQueryClient();

  const {
    data: costs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...COSTS_KEY, periodDays],
    queryFn: () => fetchMaintenanceCosts(periodDays),
  });

  const { data: assets = [] } = useQuery({
    queryKey: ASSETS_KEY,
    queryFn: fetchCostableAssets,
    staleTime: 1000 * 60 * 5,
  });

  const summary = useMemo(() => summarizeCosts(costs, { months: 6 }), [costs]);
  const assetNames = useMemo(() => new Map(assets.map((a) => [a.id, a.name])), [assets]);

  const create = useMutation({
    mutationFn: createMaintenanceCost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cost-tracking"] }),
  });

  return { costs, summary, assetNames, isLoading, error: (error as Error) ?? null, refetch, create };
}
