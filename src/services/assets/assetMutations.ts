import { supabase } from "@/integrations/supabase/client";
import { AssetFormValues } from "@/components/workOrders/assets/AssetFormSchema";

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

// Delete an asset
export async function deleteAsset(assetId: string) {
  // First check if asset has children
  const { data: children, error: childrenError } = await supabase
    .from("assets")
    .select("id")
    .eq("parent_id", assetId);
    
  if (childrenError) throw childrenError;
  
  if (children && children.length > 0) {
    throw new Error("Cannot delete asset with child assets. Please delete or move child assets first.");
  }
  
  // Check if asset has work orders
  const { data: workOrders, error: workOrdersError } = await supabase
    .from("work_orders")
    .select("id")
    .eq("asset_id", assetId);
    
  if (workOrdersError) throw workOrdersError;
  
  if (workOrders && workOrders.length > 0) {
    throw new Error("Cannot delete asset with work orders. Please resolve or reassign work orders first.");
  }
  
  const { error } = await supabase
    .from("assets")
    .delete()
    .eq("id", assetId);
    
  if (error) throw error;
}
