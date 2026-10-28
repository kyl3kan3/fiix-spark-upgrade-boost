import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { requireUserCompany } from "@/services/supabaseHelpers";
import { toast } from "sonner";
import type {
  CreatePartInput,
  Part,
  PartStockAdjustment,
  PartUsageLine,
  PartUsageLog,
  PartWithLinks,
  UpdatePartInput,
} from "@/types/parts";

const PART_SELECT = `
  *,
  part_assets(asset_id, asset:assets(id, name))
`;

export async function fetchParts(): Promise<PartWithLinks[]> {
  const { data, error } = await supabase.from("parts").select(PART_SELECT).order("name");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    quantity_on_hand: Number(row.quantity_on_hand),
    min_quantity: Number(row.min_quantity),
  })) as unknown as PartWithLinks[];
}

export async function fetchPartsForAsset(assetId: string): Promise<PartWithLinks[]> {
  const { data, error } = await supabase
    .from("part_assets")
    .select(`part_id, part:parts(${PART_SELECT})`)
    .eq("asset_id", assetId);
  if (error) throw error;
  return (data ?? [])
    .map((row) => (row as unknown as { part: PartWithLinks | null }).part)
    .filter(Boolean)
    .map((p) => ({
      ...p!,
      quantity_on_hand: Number(p!.quantity_on_hand),
      min_quantity: Number(p!.min_quantity),
    }));
}

async function syncPartAssets(partId: string, companyId: string, assetIds?: string[]): Promise<void> {
  if (assetIds === undefined) return;
  const { error: delA } = await supabase.from("part_assets").delete().eq("part_id", partId);
  if (delA) throw delA;
  if (assetIds.length > 0) {
    const { error: insA } = await supabase.from("part_assets").insert(
      assetIds.map((asset_id) => ({ part_id: partId, asset_id, company_id: companyId })),
    );
    if (insA) throw insA;
  }
}

export async function createPart(input: CreatePartInput): Promise<Part> {
  const { companyId } = await requireUserCompany();
  const { asset_ids, ...fields } = input;
  const { data, error } = await supabase
    .from("parts")
    .insert([
      {
        ...fields,
        company_id: companyId,
        unit_of_measure: fields.unit_of_measure ?? "ea",
        min_quantity: fields.min_quantity ?? 0,
        quantity_on_hand: fields.quantity_on_hand ?? 0,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  await syncPartAssets(data.id, companyId, asset_ids ?? []);
  toast.success("Part added");
  return {
    ...data,
    quantity_on_hand: Number(data.quantity_on_hand),
    min_quantity: Number(data.min_quantity),
  } as Part;
}

export async function updatePart(input: UpdatePartInput): Promise<void> {
  const { companyId } = await requireUserCompany();
  const { id, asset_ids, ...fields } = input;
  const { error } = await supabase.from("parts").update(fields).eq("id", id);
  if (error) throw error;
  await syncPartAssets(id, companyId, asset_ids);
  toast.success("Part updated");
}

export async function deletePart(id: string): Promise<void> {
  const { error } = await supabase.from("parts").delete().eq("id", id);
  if (error) throw error;
  toast.success("Part removed");
}

export async function adjustPartStock(
  partId: string,
  adjustmentType: "receive" | "adjustment",
  quantityDelta: number,
  notes?: string,
): Promise<PartStockAdjustment> {
  const { data, error } = await supabase.rpc("adjust_part_stock", {
    _part_id: partId,
    _adjustment_type: adjustmentType,
    _quantity_delta: quantityDelta,
    _notes: notes ?? undefined,
  });
  if (error) throw error;
  const row = data as unknown as PartStockAdjustment;
  toast.success(adjustmentType === "receive" ? "Stock received" : "Stock adjusted");
  return {
    ...row,
    quantity_delta: Number(row.quantity_delta),
    quantity_before: Number(row.quantity_before),
    quantity_after: Number(row.quantity_after),
  };
}

export async function fetchStockAdjustments(partId: string): Promise<PartStockAdjustment[]> {
  const { data, error } = await supabase
    .from("part_stock_adjustments")
    .select("*")
    .eq("part_id", partId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    quantity_delta: Number(r.quantity_delta),
    quantity_before: Number(r.quantity_before),
    quantity_after: Number(r.quantity_after),
  })) as PartStockAdjustment[];
}

export async function fetchUsageLogs(sinceDays = 180): Promise<PartUsageLog[]> {
  const since = new Date();
  since.setDate(since.getDate() - sinceDays);
  const { data, error } = await supabase
    .from("part_usage_logs")
    .select(`*, part:parts(name, unit_of_measure), asset:assets(name)`)
    .gte("used_at", since.toISOString())
    .order("used_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({ ...r, quantity: Number(r.quantity) })) as unknown as PartUsageLog[];
}

export async function recordPartUsage(
  lines: PartUsageLine[],
  options?: { work_order_id?: string; asset_id?: string | null; notes?: string },
): Promise<number> {
  const filtered = lines.filter((l) => l.quantity > 0);
  if (filtered.length === 0) return 0;
  const { data, error } = await supabase.rpc("record_part_usage", {
    _lines: filtered as unknown as Json,
    _work_order_id: options?.work_order_id ?? undefined,
    _asset_id: options?.asset_id ?? undefined,
    _notes: options?.notes ?? undefined,
  });
  if (error) throw error;
  return Number(data ?? 0);
}
