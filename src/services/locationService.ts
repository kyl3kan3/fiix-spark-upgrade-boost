
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Location {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LocationWithChildren extends Location {
  children?: LocationWithChildren[];
}

export interface CreateLocationData {
  name: string;
  description?: string;
  parent_id?: string;
}

export const fetchLocations = async (): Promise<Location[]> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to fetch locations');
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchLocations:', error);
    throw error;
  }
};

// Alias for compatibility with existing code
export const getAllLocations = fetchLocations;

export const getLocationById = async (id: string): Promise<Location | null> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching location:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getLocationById:', error);
    throw error;
  }
};

export const getLocationPath = async (id: string): Promise<string> => {
  try {
    const locations = await fetchLocations();
    const locationMap = new Map(locations.map(loc => [loc.id, loc]));
    
    const buildPath = (locationId: string): string[] => {
      const location = locationMap.get(locationId);
      if (!location) return [];
      
      const path = [location.name];
      if (location.parent_id) {
        path.unshift(...buildPath(location.parent_id));
      }
      return path;
    };
    
    return buildPath(id).join(' > ');
  } catch (error) {
    console.error('Error in getLocationPath:', error);
    return '';
  }
};

export const createLocation = async (locationData: CreateLocationData): Promise<Location> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .insert([locationData])
      .select()
      .single();

    if (error) {
      console.error('Error creating location:', error);
      toast.error('Failed to create location');
      throw error;
    }

    toast.success('Location created successfully');
    return data;
  } catch (error) {
    console.error('Error in createLocation:', error);
    throw error;
  }
};

export const updateLocation = async (id: string, updates: Partial<CreateLocationData>): Promise<Location> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
      throw error;
    }

    toast.success('Location updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateLocation:', error);
    throw error;
  }
};

export const deleteLocation = async (id: string): Promise<void> => {
  try {
    // Check for child locations
    const { data: childLocations, error: childError } = await supabase
      .from('locations')
      .select('id')
      .eq('parent_id', id);

    if (childError) {
      console.error('Error checking child locations:', childError);
      toast.error('Failed to check location dependencies');
      throw childError;
    }

    if (childLocations && childLocations.length > 0) {
      toast.error('Cannot delete location with sub-locations. Please delete or move child locations first.');
      throw new Error('Location has child locations');
    }

    // Check for assets referencing this location
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id')
      .eq('location_id', id);

    if (assetsError) {
      console.error('Error checking location assets:', assetsError);
      toast.error('Failed to check location dependencies');
      throw assetsError;
    }

    if (assets && assets.length > 0) {
      toast.error('Cannot delete location with assets. Please move or delete assets first.');
      throw new Error('Location has associated assets');
    }

    // Proceed with deletion if no dependencies
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
      throw error;
    }

    toast.success('Location deleted successfully');
  } catch (error) {
    console.error('Error in deleteLocation:', error);
    throw error;
  }
};

export const buildLocationHierarchy = (locations: Location[]): LocationWithChildren[] => {
  const locationMap = new Map<string, LocationWithChildren>();
  const rootLocations: LocationWithChildren[] = [];

  // Create a map of all locations
  locations.forEach(location => {
    locationMap.set(location.id, { ...location, children: [] });
  });

  // Build the hierarchy
  locations.forEach(location => {
    const locationWithChildren = locationMap.get(location.id)!;
    
    if (location.parent_id) {
      const parent = locationMap.get(location.parent_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(locationWithChildren);
      }
    } else {
      rootLocations.push(locationWithChildren);
    }
  });

  return rootLocations;
};

export const searchLocations = (locations: Location[], query: string): Location[] => {
  if (!query.trim()) return locations;
  
  const searchTerm = query.toLowerCase();
  return locations.filter(location => 
    location.name.toLowerCase().includes(searchTerm) ||
    (location.description && location.description.toLowerCase().includes(searchTerm))
  );
};

export const filterLocationsByParent = (locations: Location[], parentId: string): Location[] => {
  if (parentId === 'all') return locations;
  return locations.filter(location => location.parent_id === parentId);
};

export const filterLocationsByDate = (locations: Location[], dateFilter: string): Location[] => {
  if (dateFilter === 'all') return locations;
  
  const now = new Date();
  const filterDate = new Date();
  
  switch (dateFilter) {
    case 'today':
      filterDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      filterDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      filterDate.setMonth(now.getMonth() - 1);
      break;
    default:
      return locations;
  }
  
  return locations.filter(location => 
    new Date(location.created_at) >= filterDate
  );
};
