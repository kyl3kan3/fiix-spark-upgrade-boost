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
    _notes: notes ?? undefined,
  });
  if (error) throw error;
  const reading = data as MeterReading;
  toast.success("Reading recorded", {
    description: reading.work_orders_created
      ? `${reading.work_orders_created} PM work ${reading.work_orders_created === 1 ? "order" : "orders"} created.`
      : undefined,
  });
  if (reading.work_orders_deferred) {
    toast.warning("Monthly work order limit reached", {
      description: "The checklist is due. Log a reading again when work order capacity is available.",
    });
  }
  return reading;
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

export async function saveChecklistMeterRule(rule: {
  checklistId: string;
  meterId: string;
  intervalUnits: number;
  createWorkOrder: boolean;
  expectedMeterId?: string;
  initialServiceReading?: number;
}): Promise<void> {
  const { error } = await supabase.rpc("save_checklist_meter_rule", {
    _checklist_id: rule.checklistId,
    _meter_id: rule.meterId,
    _interval_units: rule.intervalUnits,
    _auto_create_work_order: rule.createWorkOrder,
    _expected_meter_id: rule.expectedMeterId,
    _initial_service_reading: rule.initialServiceReading,
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
