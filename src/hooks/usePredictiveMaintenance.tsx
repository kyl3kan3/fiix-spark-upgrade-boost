import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAssetRiskScores,
  recomputeRiskScores,
  type AssetRiskScore,
} from "@/services/predictiveMaintenanceService";

const QUERY_KEY = ["predictive-maintenance", "risk-scores"] as const;

export interface PredictiveMaintenanceStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  averageRisk: number;
  failuresNext30Days: number;
  lastComputedAt: string | null;
}

function buildStats(scores: AssetRiskScore[]): PredictiveMaintenanceStats {
  const now = Date.now();
  const horizon = now + 30 * 86400000;
  const byLevel = (level: string) => scores.filter((s) => s.risk_level === level).length;

  const averageRisk =
    scores.length === 0
      ? 0
      : Math.round((scores.reduce((sum, s) => sum + s.risk_score, 0) / scores.length) * 10) / 10;

  const failuresNext30Days = scores.filter(
    (s) =>
      s.predicted_failure_date &&
      new Date(s.predicted_failure_date).getTime() <= horizon &&
      (s.risk_level === "high" || s.risk_level === "critical"),
  ).length;

  const lastComputedAt =
    scores.length === 0
      ? null
      : scores.reduce<string | null>((latest, s) => {
          if (!latest || new Date(s.computed_at) > new Date(latest)) return s.computed_at;
          return latest;
        }, null);

  return {
    total: scores.length,
    critical: byLevel("critical"),
    high: byLevel("high"),
    medium: byLevel("medium"),
    low: byLevel("low"),
    averageRisk,
    failuresNext30Days,
    lastComputedAt,
  };
}

export function usePredictiveMaintenance() {
  const queryClient = useQueryClient();

  const { data: scores = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchAssetRiskScores,
    staleTime: 1000 * 60 * 5,
  });

  const recompute = useMutation({
    mutationFn: recomputeRiskScores,
    onSuccess: (fresh) => {
      queryClient.setQueryData(QUERY_KEY, fresh);
    },
  });

  const stats = useMemo(() => buildStats(scores), [scores]);

  return {
    scores,
    stats,
    isLoading,
    error,
    recompute: () => recompute.mutate(),
    isRecomputing: recompute.isPending,
  };
}
