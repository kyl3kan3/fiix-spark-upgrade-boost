import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { requireUserCompany } from "@/services/supabaseHelpers";
import { toast } from "sonner";
import type {
  CreateLubricantInput,
  Lubricant,
  LubricantStockAdjustment,
  LubricantUsageLine,
  LubricantUsageLog,
  LubricantWithLinks,
  UpdateLubricantInput,
} from "@/types/lubricants";

const LUBRICANT_SELECT = `
  *,
  lubricant_assets(asset_id, asset:assets(id, name)),
  lubricant_checklists(checklist_id, checklist:checklists(id, name))
`;

export async function fetchLubricants(): Promise<LubricantWithLinks[]> {
  const { data, error } = await supabase
    .from("lubricants")
    .select(LUBRICANT_SELECT)
    .order("name");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    quantity_on_hand: Number(row.quantity_on_hand),
    reorder_level: Number(row.reorder_level),
  })) as unknown as LubricantWithLinks[];
}

export async function fetchLubricantById(id: string): Promise<LubricantWithLinks | null> {
  const { data, error } = await supabase
    .from("lubricants")
    .select(LUBRICANT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    quantity_on_hand: Number(data.quantity_on_hand),
    reorder_level: Number(data.reorder_level),
  } as unknown as LubricantWithLinks;
}

export async function fetchLubricantsForChecklist(checklistId: string): Promise<LubricantWithLinks[]> {
  const { data, error } = await supabase
    .from("lubricant_checklists")
    .select(`lubricant_id, lubricant:lubricants(${LUBRICANT_SELECT})`)
    .eq("checklist_id", checklistId);
  if (error) throw error;
  return (data ?? [])
    .map((row) => (row as { lubricant: LubricantWithLinks | null }).lubricant)
    .filter(Boolean)
    .map((l) => ({
      ...l!,
      quantity_on_hand: Number(l!.quantity_on_hand),
      reorder_level: Number(l!.reorder_level),
    }));
}

export async function fetchLubricantsForAsset(assetId: string): Promise<LubricantWithLinks[]> {
  const { data, error } = await supabase
    .from("lubricant_assets")
    .select(`lubricant_id, lubricant:lubricants(${LUBRICANT_SELECT})`)
    .eq("asset_id", assetId);
  if (error) throw error;
  return (data ?? [])
    .map((row) => (row as { lubricant: LubricantWithLinks | null }).lubricant)
    .filter(Boolean)
    .map((l) => ({
      ...l!,
      quantity_on_hand: Number(l!.quantity_on_hand),
      reorder_level: Number(l!.reorder_level),
    }));
}

async function syncLubricantLinks(
  lubricantId: string,
  companyId: string,
  assetIds?: string[],
  checklistIds?: string[],
): Promise<void> {
  if (assetIds !== undefined) {
    const { error: delA } = await supabase
      .from("lubricant_assets")
      .delete()
      .eq("lubricant_id", lubricantId);
    if (delA) throw delA;
    if (assetIds.length > 0) {
      const { error: insA } = await supabase.from("lubricant_assets").insert(
        assetIds.map((asset_id) => ({ lubricant_id: lubricantId, asset_id, company_id: companyId })),
      );
      if (insA) throw insA;
    }
  }

  if (checklistIds !== undefined) {
    const { error: delC } = await supabase
      .from("lubricant_checklists")
      .delete()
      .eq("lubricant_id", lubricantId);
    if (delC) throw delC;
    if (checklistIds.length > 0) {
      const { error: insC } = await supabase.from("lubricant_checklists").insert(
        checklistIds.map((checklist_id) => ({
          lubricant_id: lubricantId,
          checklist_id,
          company_id: companyId,
        })),
      );
      if (insC) throw insC;
    }
  }
}

export async function createLubricant(input: CreateLubricantInput): Promise<Lubricant> {
  const { companyId } = await requireUserCompany();
  const { asset_ids, checklist_ids, ...fields } = input;
  const { data, error } = await supabase
    .from("lubricants")
    .insert([
      {
        ...fields,
        company_id: companyId,
        unit_of_measure: fields.unit_of_measure ?? "L",
        reorder_level: fields.reorder_level ?? 0,
        quantity_on_hand: fields.quantity_on_hand ?? 0,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  await syncLubricantLinks(data.id, companyId, asset_ids ?? [], checklist_ids ?? []);
  toast.success("Lubricant added");
  return {
    ...data,
    quantity_on_hand: Number(data.quantity_on_hand),
    reorder_level: Number(data.reorder_level),
  } as Lubricant;
}

export async function updateLubricant(input: UpdateLubricantInput): Promise<void> {
  const { companyId } = await requireUserCompany();
  const { id, asset_ids, checklist_ids, ...fields } = input;
  const { error } = await supabase.from("lubricants").update(fields).eq("id", id);
  if (error) throw error;
  await syncLubricantLinks(id, companyId, asset_ids, checklist_ids);
  toast.success("Lubricant updated");
}

export async function deleteLubricant(id: string): Promise<void> {
  const { error } = await supabase.from("lubricants").delete().eq("id", id);
  if (error) throw error;
  toast.success("Lubricant removed");
}

export async function adjustLubricantStock(
  lubricantId: string,
  adjustmentType: "receive" | "adjustment",
  quantityDelta: number,
  notes?: string,
): Promise<LubricantStockAdjustment> {
  const { data, error } = await supabase.rpc("adjust_lubricant_stock", {
    _lubricant_id: lubricantId,
    _adjustment_type: adjustmentType,
    _quantity_delta: quantityDelta,
    _notes: notes ?? null,
  });
  if (error) throw error;
  const row = data as unknown as LubricantStockAdjustment;
  toast.success(adjustmentType === "receive" ? "Stock received" : "Stock adjusted");
  return {
    ...row,
    quantity_delta: Number(row.quantity_delta),
    quantity_before: Number(row.quantity_before),
    quantity_after: Number(row.quantity_after),
  };
}

export async function fetchStockAdjustments(lubricantId: string): Promise<LubricantStockAdjustment[]> {
  const { data, error } = await supabase
    .from("lubricant_stock_adjustments")
    .select("*")
    .eq("lubricant_id", lubricantId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    quantity_delta: Number(r.quantity_delta),
    quantity_before: Number(r.quantity_before),
    quantity_after: Number(r.quantity_after),
  })) as LubricantStockAdjustment[];
}

export async function fetchUsageLogs(sinceDays = 180): Promise<LubricantUsageLog[]> {
  const since = new Date();
  since.setDate(since.getDate() - sinceDays);
  const { data, error } = await supabase
    .from("lubricant_usage_logs")
    .select(
      `*,
      lubricant:lubricants(name, unit_of_measure),
      asset:assets(name),
      checklist:checklists(name)`,
    )
    .gte("used_at", since.toISOString())
    .order("used_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    quantity: Number(r.quantity),
  })) as unknown as LubricantUsageLog[];
}

export async function fetchUsageLogsForLubricant(lubricantId: string): Promise<LubricantUsageLog[]> {
  const { data, error } = await supabase
    .from("lubricant_usage_logs")
    .select(
      `*,
      lubricant:lubricants(name, unit_of_measure),
      asset:assets(name),
      checklist:checklists(name)`,
    )
    .eq("lubricant_id", lubricantId)
    .order("used_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    quantity: Number(r.quantity),
  })) as unknown as LubricantUsageLog[];
}

export async function recordLubricantUsage(
  lines: LubricantUsageLine[],
  options?: {
    checklist_id?: string;
    checklist_submission_id?: string;
    work_order_id?: string;
    notes?: string;
  },
): Promise<number> {
  const filtered = lines.filter((l) => l.quantity > 0);
  if (filtered.length === 0) return 0;
  const { data, error } = await supabase.rpc("record_lubricant_usage", {
    _lines: filtered as unknown as Json,
    _checklist_id: options?.checklist_id ?? null,
    _checklist_submission_id: options?.checklist_submission_id ?? null,
    _work_order_id: options?.work_order_id ?? null,
    _notes: options?.notes ?? null,
  });
  if (error) throw error;
  return Number(data ?? 0);
}
