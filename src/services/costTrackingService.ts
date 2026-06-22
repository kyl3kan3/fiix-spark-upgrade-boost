import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { requireUserCompany } from "@/services/supabaseHelpers";
import type { CostCategory, MaintenanceType } from "@/lib/costAnalytics";

export interface MaintenanceCost {
  id: string;
  company_id: string;
  asset_id: string | null;
  work_order_id: string | null;
  category: CostCategory;
  maintenance_type: MaintenanceType;
  amount: number;
  currency: string;
  incurred_at: string;
  description: string | null;
  created_at: string;
}

export interface CreateMaintenanceCostData {
  asset_id?: string | null;
  work_order_id?: string | null;
  category: CostCategory;
  maintenance_type: MaintenanceType;
  amount: number;
  currency?: string;
  incurred_at?: string;
  description?: string;
}

export interface CostableAsset {
  id: string;
  name: string;
}

/** Lightweight asset list (id + name) for the cost-entry picker. RLS-scoped to company. */
export const fetchCostableAssets = async (): Promise<CostableAsset[]> => {
  const { data, error } = await supabase.from("assets").select("id, name").order("name");
  if (error) throw error;
  return (data ?? []).map((a) => ({ id: a.id, name: a.name }));
};

const COST_COLUMNS =
  "id, company_id, asset_id, work_order_id, category, maintenance_type, amount, currency, incurred_at, description, created_at";

/** Fetch maintenance cost entries for the current company within the last `sinceDays`. */
export const fetchMaintenanceCosts = async (sinceDays = 180): Promise<MaintenanceCost[]> => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - sinceDays);
    const { data, error } = await supabase
      .from("maintenance_costs")
      .select(COST_COLUMNS)
      .gte("incurred_at", since.toISOString())
      .order("incurred_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      ...r,
      amount: Number(r.amount),
      category: r.category as CostCategory,
      maintenance_type: r.maintenance_type as MaintenanceType,
    }));
  } catch (error) {
    console.error("Error fetching maintenance costs:", error);
    toast.error("Failed to load cost data");
    throw error;
  }
};

/** Record a maintenance cost entry for the current company. */
export const createMaintenanceCost = async (payload: CreateMaintenanceCostData): Promise<void> => {
  try {
    const { companyId } = await requireUserCompany();
    const { error } = await supabase
      .from("maintenance_costs")
      .insert([{ ...payload, company_id: companyId }]);
    if (error) throw error;
    toast.success("Cost recorded");
  } catch (error) {
    console.error("Error creating maintenance cost:", error);
    toast.error("Failed to record cost");
    throw error;
  }
};
