import { supabase } from "@/integrations/supabase/client";
import { requireUserCompany } from "@/services/supabaseHelpers";
import { toast } from "sonner";
import type {
  CreateMaintenanceCodeInput,
  MaintenanceCode,
  MaintenanceCodeType,
  MttrSummaryRow,
} from "@/types/maintenanceCodes";

export async function fetchMaintenanceCodes(type?: MaintenanceCodeType): Promise<MaintenanceCode[]> {
  let q = supabase.from("maintenance_codes").select("*").order("code");
  if (type) q = q.eq("code_type", type);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as MaintenanceCode[];
}

export async function createMaintenanceCode(input: CreateMaintenanceCodeInput): Promise<MaintenanceCode> {
  const { companyId } = await requireUserCompany();
  const { data, error } = await supabase
    .from("maintenance_codes")
    .insert([{ ...input, company_id: companyId }])
    .select()
    .single();
  if (error) throw error;
  toast.success("Code added");
  return data as MaintenanceCode;
}

export async function deleteMaintenanceCode(id: string): Promise<void> {
  const { error } = await supabase.from("maintenance_codes").delete().eq("id", id);
  if (error) throw error;
  toast.success("Code removed");
}

export async function saveWorkOrderCompletionCodes(
  workOrderId: string,
  fields: {
    failure_code_id?: string | null;
    downtime_code_id?: string | null;
    downtime_minutes?: number | null;
  },
): Promise<void> {
  const { error } = await supabase.from("work_orders").update(fields).eq("id", workOrderId);
  if (error) throw error;
}

export async function fetchMttrSummary(days = 90): Promise<MttrSummaryRow[]> {
  const { data, error } = await supabase.rpc("get_mttr_summary", { _days: days });
  if (error) throw error;
  return (data ?? []) as unknown as MttrSummaryRow[];
}
