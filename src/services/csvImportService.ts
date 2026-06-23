import { supabase } from "@/integrations/supabase/client";
import { requireUserCompany } from "@/services/supabaseHelpers";
import type { AssetImportRow, WorkOrderImportRow } from "@/lib/csvImport";

/** Bulk-insert imported assets for the current company. Returns rows written. */
export const importAssets = async (rows: AssetImportRow[]): Promise<number> => {
  if (rows.length === 0) return 0;
  const { companyId } = await requireUserCompany();
  const payload = rows.map((r) => ({
    company_id: companyId,
    name: r.name,
    status: r.status,
    location: r.location,
    model: r.model,
    serial_number: r.serial_number,
    purchase_date: r.purchase_date,
    description: r.description,
  }));
  const { error } = await supabase.from("assets").insert(payload);
  if (error) throw error;
  return rows.length;
};

/** Bulk-insert imported work orders for the current company. Returns rows written. */
export const importWorkOrders = async (rows: WorkOrderImportRow[]): Promise<number> => {
  if (rows.length === 0) return 0;
  const { companyId, userId } = await requireUserCompany();
  const payload = rows.map((r) => ({
    company_id: companyId,
    created_by: userId,
    title: r.title,
    description: r.description,
    priority: r.priority,
    status: r.status,
    due_date: r.due_date ?? null,
  }));
  const { error } = await supabase.from("work_orders").insert(payload);
  if (error) throw error;
  return rows.length;
};
