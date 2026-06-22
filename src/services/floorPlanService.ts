import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { requireUserCompany } from "@/services/supabaseHelpers";
import { clamp01 } from "@/lib/floorPlan";

const BUCKET = "floor-plans";
const MAX_BYTES = 15 * 1024 * 1024;

export interface FloorPlan {
  id: string;
  company_id: string;
  name: string;
  storage_path: string;
  created_at: string;
}

export interface FloorPlanMarker {
  id: string;
  floor_plan_id: string;
  asset_id: string | null;
  label: string | null;
  x: number;
  y: number;
}

export interface PlanAsset {
  id: string;
  name: string;
}

export const fetchFloorPlanAssets = async (): Promise<PlanAsset[]> => {
  const { data, error } = await supabase.from("assets").select("id, name").order("name");
  if (error) throw error;
  return (data ?? []).map((a) => ({ id: a.id, name: a.name }));
};

export const fetchFloorPlans = async (): Promise<FloorPlan[]> => {
  const { data, error } = await supabase
    .from("floor_plans")
    .select("id, company_id, name, storage_path, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const getFloorPlanUrl = async (storagePath: string): Promise<string> => {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 30);
  if (error) throw error;
  return data.signedUrl;
};

export const uploadFloorPlan = async (file: File, name: string): Promise<FloorPlan> => {
  if (file.size > MAX_BYTES) throw new Error(`${file.name} is too large (max 15 MB).`);
  if (!file.type.startsWith("image/")) throw new Error("Floor plan must be an image (PNG/JPG).");
  const { companyId } = await requireUserCompany();
  const path = `${companyId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]+/g, "-").toLowerCase()}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw upErr;

  const { data, error } = await supabase
    .from("floor_plans")
    .insert([{ company_id: companyId, name: name.trim() || file.name, storage_path: path }])
    .select("id, company_id, name, storage_path, created_at")
    .single();
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw error;
  }
  toast.success("Floor plan uploaded");
  return data;
};

export const deleteFloorPlan = async (plan: FloorPlan): Promise<void> => {
  const { error } = await supabase.from("floor_plans").delete().eq("id", plan.id);
  if (error) throw error;
  await supabase.storage.from(BUCKET).remove([plan.storage_path]);
  toast.success("Floor plan removed");
};

export const fetchMarkers = async (floorPlanId: string): Promise<FloorPlanMarker[]> => {
  const { data, error } = await supabase
    .from("floor_plan_markers")
    .select("id, floor_plan_id, asset_id, label, x, y")
    .eq("floor_plan_id", floorPlanId);
  if (error) throw error;
  return (data ?? []).map((m) => ({ ...m, x: Number(m.x), y: Number(m.y) }));
};

export interface CreateMarkerData {
  floor_plan_id: string;
  asset_id?: string | null;
  label?: string | null;
  x: number;
  y: number;
}

export const createMarker = async (data: CreateMarkerData): Promise<void> => {
  const { companyId } = await requireUserCompany();
  const { error } = await supabase.from("floor_plan_markers").insert([
    {
      company_id: companyId,
      floor_plan_id: data.floor_plan_id,
      asset_id: data.asset_id ?? null,
      label: data.label ?? null,
      x: clamp01(data.x),
      y: clamp01(data.y),
    },
  ]);
  if (error) throw error;
};

export const deleteMarker = async (markerId: string): Promise<void> => {
  const { error } = await supabase.from("floor_plan_markers").delete().eq("id", markerId);
  if (error) throw error;
};
