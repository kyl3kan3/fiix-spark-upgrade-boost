
import { supabase } from "@/integrations/supabase/client";
import { AssetWithChildren } from "./types";
import { logger } from "@/lib/logger";

export async function getAssetHierarchy() {
  logger.log('🏗️ getAssetHierarchy - Starting fresh fetch from database');
  
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
    
  if (error) {
    console.error('❌ getAssetHierarchy - Database error:', error);
    throw error;
  }
  
  logger.log('🏗️ getAssetHierarchy - Raw assets from database:', assets);
  
  if (!assets || assets.length === 0) {
    logger.log('🏗️ getAssetHierarchy - No assets found, returning empty array');
    return [];
  }
  
  // Build hierarchy structure
  const assetMap = new Map<string, AssetWithChildren>();
  const rootAssets: AssetWithChildren[] = [];
  
  // First pass: create map of all assets with empty children arrays
  assets.forEach(asset => {
    const assetWithChildren: AssetWithChildren = {
      ...asset,
      children: []
    };
    assetMap.set(asset.id, assetWithChildren);
    logger.log(`🏗️ Added asset to map: ${asset.name} (ID: ${asset.id}, parent_id: ${asset.parent_id || 'null'})`);
  });
  
  // Second pass: build hierarchical structure
  assets.forEach(asset => {
    const currentAsset = assetMap.get(asset.id);
    if (!currentAsset) {
      console.error(`🏗️ Could not find asset ${asset.id} in map`);
      return;
    }
    
    if (asset.parent_id) {
      const parentAsset = assetMap.get(asset.parent_id);
      if (parentAsset) {
        // This asset has a parent, add it to the parent's children
        parentAsset.children.push(currentAsset);
        logger.log(`🏗️ Added ${asset.name} as child of ${parentAsset.name}`);
      } else {
        // Parent not found, treat as root asset
        logger.log(`🏗️ Parent ${asset.parent_id} not found for ${asset.name}, treating as root`);
        rootAssets.push(currentAsset);
      }
    } else {
      // This is a root asset (no parent)
      rootAssets.push(currentAsset);
      logger.log(`🏗️ Added ${asset.name} as root asset`);
    }
  });
  
  logger.log('🏗️ getAssetHierarchy - Final root assets:', rootAssets.length);
  logger.log('🏗️ getAssetHierarchy - Root assets with children:', rootAssets.map(asset => ({
    name: asset.name,
    id: asset.id,
    childrenCount: asset.children.length,
    children: asset.children.map(child => ({ name: child.name, id: child.id }))
  })));
  
  return rootAssets;
}
