
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

// Interface for the Location
export interface Location {
  id: string;
  name: string;
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

export async function createAsset(assetData: Partial<AssetFormValues>) {
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

export async function createParentAsset(parentData: {
  name: string;
  description: string;
  location: string | null;
  status: string;
}) {
  const response = await supabase
    .from("assets")
    .insert(parentData)
    .select();
    
  return response;
}

export async function updateAsset(assetId: string, assetData: Partial<AssetFormValues>) {
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

// Function to get all unique locations
export async function getAllLocations() {
  const { data, error } = await supabase
    .from("assets")
    .select("location")
    .not("location", "is", null)
    .order("location");
    
  if (error) throw error;
  
  // Filter out null values and create a unique set of locations
  const uniqueLocations = Array.from(
    new Set(data?.map(item => item.location).filter(Boolean) as string[])
  );
  
  // Format locations as objects with id and name
  return uniqueLocations.map(location => ({
    id: location,
    name: location
  }));
}

// Function to create a new location (we'll store this as a new asset record to track it)
export async function createLocation(locationName: string) {
  // Check if location already exists
  const { data: existingLocations } = await supabase
    .from("assets")
    .select("location")
    .eq("location", locationName)
    .limit(1);
    
  // If location doesn't exist yet, we'll add it by updating a dummy asset
  // This is a simple way to maintain a list of locations without a separate table
  if (!existingLocations || existingLocations.length === 0) {
    // For simplicity, we'll create a minimal asset entry that just serves to register the location
    const locationAsset = {
      name: `Location: ${locationName}`,
      description: `Location placeholder for: ${locationName}`,
      location: locationName,
      status: "active",
    };
    
    const { error } = await supabase
      .from("assets")
      .insert(locationAsset);
      
    if (error) throw error;
  }
  
  return { success: true };
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
