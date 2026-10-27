export type LubricantUnit = "L" | "gal" | "qt" | "mL" | "kg" | "lb" | "oz";

export const LUBRICANT_UNITS: { value: LubricantUnit; label: string }[] = [
  { value: "L", label: "Liters (L)" },
  { value: "gal", label: "Gallons (gal)" },
  { value: "qt", label: "Quarts (qt)" },
  { value: "mL", label: "Milliliters (mL)" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "lb", label: "Pounds (lb)" },
  { value: "oz", label: "Ounces (oz)" },
];

export interface Lubricant {
  id: string;
  company_id: string;
  name: string;
  lubricant_type: string | null;
  manufacturer: string | null;
  unit_of_measure: string;
  notes: string | null;
  quantity_on_hand: number;
  reorder_level: number;
  created_at: string;
  updated_at: string;
}

export interface LubricantAssetLink {
  asset_id: string;
  asset?: { id: string; name: string } | null;
}

export interface LubricantChecklistLink {
  checklist_id: string;
  checklist?: { id: string; name: string } | null;
}

export interface LubricantWithLinks extends Lubricant {
  lubricant_assets?: LubricantAssetLink[];
  lubricant_checklists?: LubricantChecklistLink[];
}

export interface LubricantStockAdjustment {
  id: string;
  lubricant_id: string;
  adjustment_type: "receive" | "adjustment";
  quantity_delta: number;
  quantity_before: number;
  quantity_after: number;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export interface LubricantUsageLog {
  id: string;
  lubricant_id: string;
  asset_id: string | null;
  checklist_id: string | null;
  checklist_submission_id: string | null;
  work_order_id: string | null;
  quantity: number;
  used_at: string;
  used_by: string | null;
  notes: string | null;
  lubricant?: { name: string; unit_of_measure: string } | null;
  asset?: { name: string } | null;
  checklist?: { name: string } | null;
}

export interface CreateLubricantInput {
  name: string;
  lubricant_type?: string | null;
  manufacturer?: string | null;
  unit_of_measure?: string;
  notes?: string | null;
  reorder_level?: number;
  quantity_on_hand?: number;
  asset_ids?: string[];
  checklist_ids?: string[];
}

export interface UpdateLubricantInput extends Partial<CreateLubricantInput> {
  id: string;
}

export interface LubricantUsageLine {
  lubricant_id: string;
  asset_id?: string | null;
  quantity: number;
}
