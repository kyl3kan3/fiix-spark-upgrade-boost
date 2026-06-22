import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchEnergyReadings,
  fetchEnergyAssets,
  createEnergyReading,
  importEnergyReadings,
  type EnergyReading,
} from "@/services/energyService";
import { summarizeEnergy, type EnergySummary } from "@/lib/energyAnalytics";

const READINGS_KEY = ["power-usage", "readings"] as const;
const ASSETS_KEY = ["power-usage", "assets"] as const;

export function usePowerUsage(periodDays = 365) {
  const queryClient = useQueryClient();

  const {
    data: readings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...READINGS_KEY, periodDays],
    queryFn: () => fetchEnergyReadings(periodDays),
  });

  const { data: assets = [] } = useQuery({
    queryKey: ASSETS_KEY,
    queryFn: fetchEnergyAssets,
    staleTime: 1000 * 60 * 5,
  });

  const summary: EnergySummary = useMemo(() => summarizeEnergy(readings, { months: 6 }), [readings]);
  const assetNames = useMemo(() => new Map(assets.map((a) => [a.id, a.name])), [assets]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["power-usage"] });

  const create = useMutation({ mutationFn: createEnergyReading, onSuccess: invalidate });
  const importCsv = useMutation({
    mutationFn: (vars: Parameters<typeof importEnergyReadings>) => importEnergyReadings(...vars),
    onSuccess: invalidate,
  });

  return {
    readings,
    summary,
    assets,
    assetNames,
    isLoading,
    error: (error as Error) ?? null,
    refetch,
    create,
    importCsv,
  };
}

export type { EnergyReading };
