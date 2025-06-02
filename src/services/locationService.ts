
import { supabase } from "@/integrations/supabase/client";

export interface Location {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  children?: Location[];
}

export interface LocationWithChildren extends Location {
  children: LocationWithChildren[];
}

// Get all locations
export async function getAllLocations() {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("name");
    
  if (error) throw error;
  return data || [];
}

// Get location hierarchy (locations with their children)
export async function getLocationHierarchy(): Promise<LocationWithChildren[]> {
  const { data: locations, error } = await supabase
    .from("locations")
    .select("*")
    .order("name");
    
  if (error) throw error;
  
  // Build hierarchy structure
  const locationMap = new Map<string, LocationWithChildren>();
  const rootLocations: LocationWithChildren[] = [];
  
  // First pass: create map of all locations
  locations?.forEach(location => {
    const locationWithChildren: LocationWithChildren = {
      ...location,
      children: []
    };
    locationMap.set(location.id, locationWithChildren);
  });
  
  // Second pass: build hierarchical structure
  locations?.forEach(location => {
    if (location.parent_id && locationMap.has(location.parent_id)) {
      // This location has a parent, add it to the parent's children
      locationMap.get(location.parent_id)!.children.push(locationMap.get(location.id)!);
    } else {
      // This is a root location (no parent)
      rootLocations.push(locationMap.get(location.id)!);
    }
  });
  
  return rootLocations;
}

// Create a new location
export async function createLocation(locationData: {
  name: string;
  description?: string;
  parent_id?: string;
}) {
  const { data, error } = await supabase
    .from("locations")
    .insert({
      name: locationData.name,
      description: locationData.description || null,
      parent_id: locationData.parent_id || null,
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Update a location
export async function updateLocation(locationId: string, locationData: {
  name?: string;
  description?: string;
  parent_id?: string;
}) {
  const { data, error } = await supabase
    .from("locations")
    .update({
      name: locationData.name,
      description: locationData.description,
      parent_id: locationData.parent_id,
    })
    .eq("id", locationId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Delete a location
export async function deleteLocation(locationId: string) {
  // First check if location has children
  const { data: children, error: childrenError } = await supabase
    .from("locations")
    .select("id")
    .eq("parent_id", locationId);
    
  if (childrenError) throw childrenError;
  
  if (children && children.length > 0) {
    throw new Error("Cannot delete location with sub-locations. Please delete or move sub-locations first.");
  }
  
  // Check if location has assets
  const { data: assets, error: assetsError } = await supabase
    .from("assets")
    .select("id")
    .eq("location_id", locationId);
    
  if (assetsError) throw assetsError;
  
  if (assets && assets.length > 0) {
    throw new Error("Cannot delete location with assets. Please move or delete assets first.");
  }
  
  const { error } = await supabase
    .from("locations")
    .delete()
    .eq("id", locationId);
    
  if (error) throw error;
}

// Get location by ID
export async function getLocationById(locationId: string) {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("id", locationId)
    .single();
    
  if (error) throw error;
  return data;
}

// Get full location path (e.g., "Building A > Floor 2 > Room 201")
export async function getLocationPath(locationId: string): Promise<string> {
  const location = await getLocationById(locationId);
  if (!location) return "";
  
  if (location.parent_id) {
    const parentPath = await getLocationPath(location.parent_id);
    return `${parentPath} > ${location.name}`;
  }
  
  return location.name;
}
