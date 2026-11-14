
import { supabase } from "@/integrations/supabase/client";

export async function getAssetsWithLocations() {
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

export async function getAssetWithLocationById(assetId: string) {
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

export async function getAllAssets() {
 const { data, error } = await supabase
 .from("assets")
 .select("*")
 .order("name");
 
 if (error) throw error;
 return data || [];
}

export async function getAssetById(assetId: string) {
 const { data, error } = await supabase
 .from("assets")
 .select("*")
 .eq("id", assetId)
 .single();
 
 if (error) throw error;
 return data;
}

export interface AssetCountByLocation {
 locationId: string;
 count: number;
}

/** Aggregates raw asset rows into per-location counts (testable without Supabase). */
export function aggregateAssetCountsByLocation(
 assets: { location_id: string | null }[],
): AssetCountByLocation[] {
 const counts = assets.reduce((acc: Record<string, number>, asset) => {
 if (!asset.location_id) return acc;
 acc[asset.location_id] = (acc[asset.location_id] || 0) + 1;
 return acc;
 }, {});

 return Object.entries(counts).map(([locationId, count]) => ({
 locationId,
 count,
 }));
}

export async function getAssetCountsByLocation(): Promise<AssetCountByLocation[]> {
 const { data, error } = await supabase
 .from("assets")
 .select("location_id")
 .not("location_id", "is", null);

 if (error) throw error;

 return aggregateAssetCountsByLocation(data ?? []);
}
