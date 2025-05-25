
import { supabase } from "@/integrations/supabase/client";

export async function getAllAssets() {
  const { data, error } = await supabase
    .from("assets")
    .select(`
      *,
      locations:location_id (
        id,
        name,
        description,
        parent_id
      )
    `)
    .order("name");
    
  if (error) throw error;
  return data || [];
}

export async function getAssetById(assetId: string) {
  const { data, error } = await supabase
    .from("assets")
    .select(`
      *,
      locations:location_id (
        id,
        name,
        description,
        parent_id
      )
    `)
    .eq("id", assetId)
    .single();
    
  if (error) throw error;
  return data;
}
