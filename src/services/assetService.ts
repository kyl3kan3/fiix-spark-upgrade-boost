
import { supabase } from "@/integrations/supabase/client";
import { AssetFormValues } from "@/components/workOrders/assets/AssetFormSchema";
import { getAllLocations as getLocationsFromService, createLocation as createLocationService } from "./locationService";

// Define an interface for the asset with children for the hierarchy
export interface AssetWithChildren {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  location_id: string | null;
  status: string;
  parent_id: string | null;
  children: AssetWithChildren[];
}

// Interface for the Location (re-export for compatibility)
export interface Location {
  id: string;
  name: string;
}

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

export async function createAsset(assetData: Partial<AssetFormValues>) {
  const formattedData = {
    name: assetData.name,
    description: assetData.description || null,
    location_id: assetData.location_id || null,
    model: assetData.model || null,
    serial_number: assetData.serial_number || null,
    purchase_date: assetData.purchase_date ? assetData.purchase_date : null,
    status: assetData.status as "active" | "inactive" | "maintenance" | "retired",
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
  location_id: string | null;
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
    location_id: assetData.location_id || null,
    model: assetData.model || null,
    serial_number: assetData.serial_number || null,
    purchase_date: assetData.purchase_date ? assetData.purchase_date : null,
    status: assetData.status as "active" | "inactive" | "maintenance" | "retired",
    parent_id: assetData.parent_id || null
  };

  const response = await supabase
    .from("assets")
    .update(formattedData)
    .eq("id", assetId)
    .select();
    
  return response;
}

// Function to get all unique locations (updated to use new locations table)
export async function getAllLocations() {
  return getLocationsFromService();
}

// Function to create a new location (updated to use new location service)
export async function createLocation(locationName: string) {
  return createLocationService({ name: locationName });
}

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
