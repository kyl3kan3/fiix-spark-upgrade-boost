import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

export interface PmWorkOrderPreviewRow {
  checklist_id: string;
  checklist_name: string;
  asset_id: string | null;
  due_at: string;
}

export async function previewPmWorkOrders(daysAhead = 30): Promise<PmWorkOrderPreviewRow[]> {
  const { data, error } = await supabase.rpc("preview_pm_work_orders", { _days_ahead: daysAhead });
  if (error) throw error;
  return (data as unknown as PmWorkOrderPreviewRow[]) ?? [];
}

export async function createPmWorkOrdersFromPreview(items: PmWorkOrderPreviewRow[]): Promise<number> {
  const { data, error } = await supabase.rpc("create_pm_work_orders_from_preview", {
    _items: items as unknown as Json,
  });
  if (error) throw error;
  const count = Number(data ?? 0);
  toast.success(`Created ${count} work order${count === 1 ? "" : "s"}`);
  return count;
}
