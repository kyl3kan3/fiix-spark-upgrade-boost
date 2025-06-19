
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Asset {
  id: string;
  name: string;
  description?: string;
  model?: string;
  serial_number?: string;
  location_id?: string;
  location?: string;
  parent_id?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  purchase_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetWithChildren extends Asset {
  children?: AssetWithChildren[];
}

export interface CreateAssetData {
  name: string;
  description?: string;
  model?: string;
  serial_number?: string;
  location_id?: string;
  parent_id?: string;
  status?: 'active' | 'inactive' | 'maintenance' | 'retired';
  purchase_date?: string;
}

export const fetchAssets = async (): Promise<Asset[]> => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching assets:', error);
      toast.error('Failed to fetch assets');
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchAssets:', error);
    throw error;
  }
};

export const getAllAssets = fetchAssets;

export const getAssetById = async (id: string): Promise<Asset | null> => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching asset:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getAssetById:', error);
    throw error;
  }
};

export const createAsset = async (assetData: CreateAssetData): Promise<Asset> => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .insert([{
        ...assetData,
        status: assetData.status || 'active'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating asset:', error);
      toast.error('Failed to create asset');
      throw error;
    }

    toast.success('Asset created successfully');
    return data;
  } catch (error) {
    console.error('Error in createAsset:', error);
    throw error;
  }
};

export const updateAsset = async (id: string, updates: Partial<CreateAssetData>): Promise<Asset> => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating asset:', error);
      toast.error('Failed to update asset');
      throw error;
    }

    toast.success('Asset updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateAsset:', error);
    throw error;
  }
};

export const deleteAsset = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset');
      throw error;
    }

    toast.success('Asset deleted successfully');
  } catch (error) {
    console.error('Error in deleteAsset:', error);
    throw error;
  }
};

export const buildAssetHierarchy = (assets: Asset[]): AssetWithChildren[] => {
  const assetMap = new Map<string, AssetWithChildren>();
  const rootAssets: AssetWithChildren[] = [];

  // Create a map of all assets
  assets.forEach(asset => {
    assetMap.set(asset.id, { ...asset, children: [] });
  });

  // Build the hierarchy
  assets.forEach(asset => {
    const assetWithChildren = assetMap.get(asset.id)!;
    
    if (asset.parent_id) {
      const parent = assetMap.get(asset.parent_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(assetWithChildren);
      }
    } else {
      rootAssets.push(assetWithChildren);
    }
  });

  return rootAssets;
};

export const searchAssets = (assets: Asset[], query: string): Asset[] => {
  if (!query.trim()) return assets;
  
  const searchTerm = query.toLowerCase();
  return assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm) ||
    (asset.description && asset.description.toLowerCase().includes(searchTerm)) ||
    (asset.model && asset.model.toLowerCase().includes(searchTerm)) ||
    (asset.serial_number && asset.serial_number.toLowerCase().includes(searchTerm))
  );
};

export const filterAssetsByLocation = (assets: Asset[], locationId: string): Asset[] => {
  if (locationId === 'all') return assets;
  return assets.filter(asset => asset.location_id === locationId);
};

export const filterAssetsByStatus = (assets: Asset[], status: string): Asset[] => {
  if (status === 'all') return assets;
  return assets.filter(asset => asset.status === status);
};
