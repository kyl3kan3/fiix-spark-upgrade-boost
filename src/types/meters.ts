export interface AssetMeter {
  id: string;
  company_id: string;
  asset_id: string;
  name: string;
  unit: string;
  current_reading: number;
  created_at: string;
  updated_at: string;
}

export interface MeterReading {
  id: string;
  meter_id: string;
  reading_value: number;
  recorded_at: string;
  recorded_by: string | null;
  notes: string | null;
}

export interface ChecklistMeterRule {
  checklist_id: string;
  meter_id: string;
  interval_units: number;
  last_service_reading: number;
  meter?: AssetMeter | null;
}

export interface CreateMeterInput {
  asset_id: string;
  name: string;
  unit?: string;
  current_reading?: number;
}
