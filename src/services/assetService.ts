
import { supabase } from "@/integrations/supabase/client";
import { AssetFormValues } from "@/components/workOrders/assets/AssetFormSchema";

// Define an interface for the asset with children for the hierarchy
interface AssetWithChildren {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: string;
  parent_id: string | null;
  children: AssetWithChildren[];
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

export async function createAsset(assetData: AssetFormValues) {
  const formattedData = {
    name: assetData.name,
    description: assetData.description || null,
    location: assetData.location || null,
    model: assetData.model || null,
    serial_number: assetData.serial_number || null,
    purchase_date: assetData.purchase_date ? assetData.purchase_date : null,
    status: assetData.status,
    parent_id: assetData.parent_id || null
  };

  const response = await supabase
    .from("assets")
    .insert(formattedData)
    .select();
    
  return response;
}

export async function updateAsset(assetId: string, assetData: AssetFormValues) {
  const formattedData = {
    name: assetData.name,
    description: assetData.description || null,
    location: assetData.location || null,
    model: assetData.model || null,
    serial_number: assetData.serial_number || null,
    purchase_date: assetData.purchase_date ? assetData.purchase_date : null,
    status: assetData.status,
    parent_id: assetData.parent_id || null
  };

  const response = await supabase
    .from("assets")
    .update(formattedData)
    .eq("id", assetId)
    .select();
    
  return response;
}

export async function getAssetHierarchy() {
  // Get all assets
  const { data: assets, error } = await supabase
    .from("assets")
    .select(`
      id, 
      name, 
      description,
      location,
      status,
      parent_id
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
