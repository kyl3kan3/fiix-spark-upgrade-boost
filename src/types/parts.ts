export type PartUnit = "ea" | "box" | "ft" | "m" | "kg" | "lb" | "L" | "gal";

export const PART_UNITS: { value: PartUnit; label: string }[] = [
  { value: "ea", label: "Each (ea)" },
  { value: "box", label: "Box" },
  { value: "ft", label: "Feet (ft)" },
  { value: "m", label: "Meters (m)" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "lb", label: "Pounds (lb)" },
  { value: "L", label: "Liters (L)" },
  { value: "gal", label: "Gallons (gal)" },
];

export interface Part {
  id: string;
  company_id: string;
  name: string;
  part_number: string | null;
  manufacturer: string | null;
  unit_of_measure: string;
  notes: string | null;
  quantity_on_hand: number;
  min_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface PartAssetLink {
  asset_id: string;
  asset?: { id: string; name: string } | null;
}

export interface PartWithLinks extends Part {
  part_assets?: PartAssetLink[];
}

export interface PartStockAdjustment {
  id: string;
  part_id: string;
  adjustment_type: "receive" | "adjustment";
  quantity_delta: number;
  quantity_before: number;
  quantity_after: number;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export interface PartUsageLog {
  id: string;
  part_id: string;
  asset_id: string | null;
  work_order_id: string | null;
  quantity: number;
  used_at: string;
  used_by: string | null;
  notes: string | null;
  part?: { name: string; unit_of_measure: string } | null;
  asset?: { name: string } | null;
}

export interface CreatePartInput {
  name: string;
  part_number?: string | null;
  manufacturer?: string | null;
  unit_of_measure?: string;
  notes?: string | null;
  min_quantity?: number;
  quantity_on_hand?: number;
  asset_ids?: string[];
}

export interface UpdatePartInput extends Partial<CreatePartInput> {
  id: string;
}

export interface PartUsageLine {
  part_id: string;
  quantity: number;
}
