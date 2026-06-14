import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchRuns,
  fetchActions,
  fetchPendingFlagCount,
  fetchSettings,
  upsertSettings,
  runSelfHealNow,
  markActionReviewed,
  type HealerKey,
  type SelfHealingSettings,
} from "@/services/selfHealingService";
import { useUserProfile } from "@/hooks/useUserProfile";

const RUNS_KEY = ["self-healing", "runs"] as const;
const SETTINGS_KEY = ["self-healing", "settings"] as const;
const FLAGS_KEY = ["self-healing", "pending-flags"] as const;

export function useSelfHealing() {
  const qc = useQueryClient();
  const { profile } = useUserProfile();

  const runs = useQuery({ queryKey: RUNS_KEY, queryFn: () => fetchRuns(50) });
  const settings = useQuery({ queryKey: SETTINGS_KEY, queryFn: fetchSettings });
  const pendingFlags = useQuery({
    queryKey: FLAGS_KEY,
    queryFn: fetchPendingFlagCount,
    staleTime: 60_000,
  });

  const triggerRun = useMutation({
    mutationFn: (healer?: HealerKey) => runSelfHealNow(healer),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RUNS_KEY });
      qc.invalidateQueries({ queryKey: FLAGS_KEY });
    },
  });

  const saveSettings = useMutation({
    mutationFn: (updates: Partial<Omit<SelfHealingSettings, "company_id">>) => {
      if (!profile?.company_id) throw new Error("No company");
      return upsertSettings(profile.company_id, updates);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEY }),
  });

  const reviewAction = useMutation({
    mutationFn: (id: string) => markActionReviewed(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FLAGS_KEY });
    },
  });

  return {
    runs: runs.data ?? [],
    isLoadingRuns: runs.isLoading,
    settings: settings.data ?? null,
    isLoadingSettings: settings.isLoading,
    pendingFlagCount: pendingFlags.data ?? 0,
    triggerRun: (healer?: HealerKey) => triggerRun.mutate(healer),
    isTriggering: triggerRun.isPending,
    saveSettings: (updates: Partial<Omit<SelfHealingSettings, "company_id">>) =>
      saveSettings.mutate(updates),
    reviewAction: (id: string) => reviewAction.mutate(id),
  };
}

export function useRunActions(runId: string | null) {
  return useQuery({
    queryKey: ["self-healing", "actions", runId],
    queryFn: () => fetchActions(runId!),
    enabled: !!runId,
  });
}