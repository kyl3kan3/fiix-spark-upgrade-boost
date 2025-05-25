
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
