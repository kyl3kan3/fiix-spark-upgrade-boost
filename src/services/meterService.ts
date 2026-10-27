import { supabase } from "@/integrations/supabase/client";
import { requireUserCompany } from "@/services/supabaseHelpers";
import { toast } from "sonner";
import type { AssetMeter, ChecklistMeterRule, CreateMeterInput, MeterReading } from "@/types/meters";

export async function fetchMetersForAsset(assetId: string): Promise<AssetMeter[]> {
  const { data, error } = await supabase
    .from("asset_meters")
    .select("*")
    .eq("asset_id", assetId)
    .order("name");
  if (error) throw error;
  return (data ?? []).map((r) => ({ ...r, current_reading: Number(r.current_reading) })) as AssetMeter[];
}

export async function createMeter(input: CreateMeterInput): Promise<AssetMeter> {
  const { companyId } = await requireUserCompany();
  const { data, error } = await supabase
    .from("asset_meters")
    .insert({
      company_id: companyId,
      asset_id: input.asset_id,
      name: input.name,
      unit: input.unit ?? "hrs",
      current_reading: input.current_reading ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  toast.success("Meter added");
  return { ...data, current_reading: Number(data.current_reading) } as AssetMeter;
}

export async function recordMeterReading(
  meterId: string,
  readingValue: number,
  notes?: string,
): Promise<MeterReading> {
  const { data, error } = await supabase.rpc("record_asset_meter_reading", {
    _meter_id: meterId,
    _reading_value: readingValue,
    _notes: notes ?? null,
  });
  if (error) throw error;
  toast.success("Reading recorded");
  return data as unknown as MeterReading;
}

export async function fetchMeterReadings(meterId: string): Promise<MeterReading[]> {
  const { data, error } = await supabase
    .from("meter_readings")
    .select("*")
    .eq("meter_id", meterId)
    .order("recorded_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((r) => ({ ...r, reading_value: Number(r.reading_value) })) as MeterReading[];
}

export async function upsertChecklistMeterRule(
  checklistId: string,
  meterId: string,
  intervalUnits: number,
): Promise<void> {
  const { companyId } = await requireUserCompany();
  const { error } = await supabase.from("checklist_meter_rules").upsert({
    checklist_id: checklistId,
    company_id: companyId,
    meter_id: meterId,
    interval_units: intervalUnits,
  });
  if (error) throw error;
}

export async function fetchMeterRulesForMeters(meterIds: string[]) {
  if (meterIds.length === 0) return [];
  const { data, error } = await supabase
    .from("checklist_meter_rules")
    .select("interval_units, meter_id, checklist:checklists(id, name)")
    .in("meter_id", meterIds);
  if (error) throw error;
  return data ?? [];
}

export async function fetchChecklistMeterRule(checklistId: string): Promise<ChecklistMeterRule | null> {
  const { data, error } = await supabase
    .from("checklist_meter_rules")
    .select("*, meter:asset_meters(*)")
    .eq("checklist_id", checklistId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as ChecklistMeterRule & { interval_units: number; last_service_reading: number };
  return {
    ...row,
    interval_units: Number(row.interval_units),
    last_service_reading: Number(row.last_service_reading),
    meter: row.meter
      ? { ...row.meter, current_reading: Number((row.meter as AssetMeter).current_reading) }
      : null,
  };
}
