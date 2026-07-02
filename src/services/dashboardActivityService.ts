import { supabase } from "@/integrations/supabase/client";

/**
 * Data access for the dashboard's maintenance-activity chart: raw work-order
 * rows for the weekly opened/completed series, and the currently open rows
 * for the priority breakdown. Aggregation into buckets lives in the
 * useMaintenanceActivity hook.
 */

export interface ActivityRow {
  id: string;
  created_at: string;
  updated_at: string;
  status: string | null;
}

export interface OpenPriorityRow {
  id: string;
  priority: string | null;
}

export async function fetchActivityWindow(windowIso: string): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from("work_orders")
    .select("id, created_at, updated_at, status")
    .or(`created_at.gte.${windowIso},and(status.eq.completed,updated_at.gte.${windowIso})`)
    .limit(2000);
  if (error) throw error;
  return data ?? [];
}

export async function fetchOpenWorkOrderPriorities(): Promise<OpenPriorityRow[]> {
  const { data, error } = await supabase
    .from("work_orders")
    .select("id, priority")
    .in("status", ["pending", "in_progress"])
    .limit(2000);
  if (error) throw error;
  return data ?? [];
}
