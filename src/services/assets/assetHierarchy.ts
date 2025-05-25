
import { supabase } from "@/integrations/supabase/client";
import { AssetWithChildren } from "./types";

export async function getAssetHierarchy() {
  // Get all assets with location information
  const { data: assets, error } = await supabase
    .from("assets")
    .select(`
      id, 
      name, 
      description,
      location,
      location_id,
      status,
      parent_id,
      locations:location_id (
        id,
        name,
        description,
        parent_id
      )
    `)
    .order("name");
    
  if (error) throw error;
  
  // Build hierarchy structure
  const assetMap = new Map<string, AssetWithChildren>();
  const rootAssets: AssetWithChildren[] = [];
  
  // First pass: create map of all assets
  assets?.forEach(asset => {
    // Initialize the asset with an empty children array
    const assetWithChildren: AssetWithChildren = {
      ...asset,
      children: []
    };
    assetMap.set(asset.id, assetWithChildren);
  });
  
  // Second pass: build hierarchical structure
  assets?.forEach(asset => {
    if (asset.parent_id && assetMap.has(asset.parent_id)) {
      // This asset has a parent, add it to the parent's children
      assetMap.get(asset.parent_id)!.children.push(assetMap.get(asset.id)!);
    } else {
      // This is a root asset (no parent)
      rootAssets.push(assetMap.get(asset.id)!);
    }
  });
  
  return rootAssets;
}
