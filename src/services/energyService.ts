import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { requireUserCompany } from "@/services/supabaseHelpers";
import type { ParsedEnergyRow } from "@/lib/energyAnalytics";

export interface EnergyReading {
  id: string;
  company_id: string;
  asset_id: string | null;
  meter_label: string | null;
  reading_date: string;
  kwh: number;
  cost: number | null;
  currency: string;
  source: "manual" | "csv" | "integration";
  notes: string | null;
  created_at: string;
}

export interface CreateEnergyReadingData {
  asset_id?: string | null;
  meter_label?: string | null;
  reading_date?: string;
  kwh: number;
  cost?: number | null;
  currency?: string;
  source?: "manual" | "csv" | "integration";
  notes?: string;
}

export interface EnergyAsset {
  id: string;
  name: string;
}

const COLUMNS =
  "id, company_id, asset_id, meter_label, reading_date, kwh, cost, currency, source, notes, created_at";

/** Lightweight asset list (id + name) for the meter/asset picker. RLS-scoped. */
export const fetchEnergyAssets = async (): Promise<EnergyAsset[]> => {
  const { data, error } = await supabase.from("assets").select("id, name").order("name");
  if (error) throw error;
  return (data ?? []).map((a) => ({ id: a.id, name: a.name }));
};

/** Fetch the company's energy readings within the last `sinceDays`, newest first. */
export const fetchEnergyReadings = async (sinceDays = 365): Promise<EnergyReading[]> => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - sinceDays);
    const { data, error } = await supabase
      .from("energy_readings")
      .select(COLUMNS)
      .gte("reading_date", since.toISOString())
      .order("reading_date", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      ...r,
      kwh: Number(r.kwh),
      cost: r.cost == null ? null : Number(r.cost),
      source: r.source as EnergyReading["source"],
    }));
  } catch (error) {
    console.error("Error fetching energy readings:", error);
    toast.error("Failed to load energy data");
    throw error;
  }
};

/** Record a single manual energy reading. */
export const createEnergyReading = async (payload: CreateEnergyReadingData): Promise<void> => {
  try {
    const { companyId } = await requireUserCompany();
    const { error } = await supabase
      .from("energy_readings")
      .insert([{ ...payload, source: payload.source ?? "manual", company_id: companyId }]);
    if (error) throw error;
    toast.success("Reading recorded");
  } catch (error) {
    console.error("Error creating energy reading:", error);
    toast.error("Failed to record reading");
    throw error;
  }
};

/** Bulk-insert parsed CSV rows. Returns the number of rows written. */
export const importEnergyReadings = async (
  rows: ParsedEnergyRow[],
  currency = "USD",
): Promise<number> => {
  if (rows.length === 0) return 0;
  const { companyId } = await requireUserCompany();
  const payload = rows.map((r) => ({
    company_id: companyId,
    reading_date: r.reading_date,
    kwh: r.kwh,
    cost: r.cost,
    meter_label: r.meter_label,
    currency,
    source: "csv" as const,
  }));
  const { error } = await supabase.from("energy_readings").insert(payload);
  if (error) throw error;
  return rows.length;
};
