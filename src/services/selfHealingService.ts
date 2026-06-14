import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type HealerKey = "risk_scoring" | "work_orders" | "data_integrity" | "ai_triage";

export interface SelfHealingRun {
  id: string;
  healer: HealerKey;
  triggered_by: string;
  actor_id: string | null;
  status: "success" | "failed" | "empty" | "partial";
  scanned: number;
  fixed: number;
  flagged: number;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
}

export interface SelfHealingAction {
  id: string;
  run_id: string;
  healer: HealerKey;
  entity_type: string;
  entity_id: string | null;
  action: string;
  before: unknown;
  after: unknown;
  details: string | null;
  requires_review: boolean;
  reviewed_at: string | null;
  created_at: string;
}

export interface SelfHealingSettings {
  company_id: string;
  risk_scoring_enabled: boolean;
  work_orders_enabled: boolean;
  data_integrity_enabled: boolean;
  ai_triage_enabled: boolean;
}

const sb = supabase as unknown as {
  from: (table: string) => ReturnType<typeof supabase.from>;
};

export async function fetchRuns(limit = 50): Promise<SelfHealingRun[]> {
  const { data, error } = await sb
    .from("self_healing_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as SelfHealingRun[];
}

export async function fetchActions(runId: string): Promise<SelfHealingAction[]> {
  const { data, error } = await sb
    .from("self_healing_actions")
    .select("*")
    .eq("run_id", runId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as SelfHealingAction[];
}

export async function fetchPendingFlagCount(): Promise<number> {
  const { count, error } = await sb
    .from("self_healing_actions")
    .select("*", { count: "exact", head: true })
    .eq("requires_review", true)
    .is("reviewed_at", null);
  if (error) return 0;
  return count ?? 0;
}

export async function fetchSettings(): Promise<SelfHealingSettings | null> {
  const { data, error } = await sb
    .from("self_healing_settings")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as SelfHealingSettings) ?? null;
}

export async function upsertSettings(
  companyId: string,
  updates: Partial<Omit<SelfHealingSettings, "company_id">>,
): Promise<void> {
  const { error } = await sb
    .from("self_healing_settings")
    .upsert({ company_id: companyId, ...updates });
  if (error) throw error;
}

export async function markActionReviewed(actionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await sb
    .from("self_healing_actions")
    .update({ reviewed_at: new Date().toISOString(), reviewed_by: user?.id ?? null } as never)
    .eq("id", actionId);
  if (error) throw error;
}

export async function runSelfHealNow(healer?: HealerKey): Promise<void> {
  const { error } = await supabase.functions.invoke("self-heal", {
    body: { triggered_by: "manual", ...(healer ? { healer } : {}) },
  });
  if (error) {
    toast.error("Self-heal failed: " + error.message);
    throw error;
  }
  toast.success("Self-heal complete");
}