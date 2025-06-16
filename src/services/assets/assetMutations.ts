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
  console.log('🗑️ deleteAsset service - Starting deletion for asset ID:', assetId);
  
  // First get the asset details to see what we're working with
  console.log('🗑️ deleteAsset service - Fetching asset details...');
  const { data: assetDetails, error: assetError } = await supabase
    .from("assets")
    .select("id, name, parent_id")
    .eq("id", assetId)
    .single();
    
  if (assetError) {
    console.error('❌ deleteAsset service - Error fetching asset details:', assetError);
    throw assetError;
  }
  
  console.log('🗑️ deleteAsset service - Asset details:', assetDetails);
  
  // Check if asset has children - with detailed logging
  console.log('🗑️ deleteAsset service - Checking for child assets...');
  const { data: children, error: childrenError } = await supabase
    .from("assets")
    .select("id, name, parent_id")
    .eq("parent_id", assetId);
    
  if (childrenError) {
    console.error('❌ deleteAsset service - Error checking children:', childrenError);
    throw childrenError;
  }
  
  console.log('🗑️ deleteAsset service - Children found:', children?.length || 0);
  
  if (children && children.length > 0) {
    console.error('❌ deleteAsset service - Cannot delete asset with children. Children found:', children.map(c => `${c.name} (${c.id})`));
    throw new Error(`Cannot delete asset "${assetDetails.name}" because it has ${children.length} child asset(s): ${children.map(c => c.name).join(', ')}. Please delete or move child assets first.`);
  }
  
  // Check if asset has work orders
  console.log('🗑️ deleteAsset service - Checking for work orders...');
  const { data: workOrders, error: workOrdersError } = await supabase
    .from("work_orders")
    .select("id, title")
    .eq("asset_id", assetId);
    
  if (workOrdersError) {
    console.error('❌ deleteAsset service - Error checking work orders:', workOrdersError);
    throw workOrdersError;
  }
  
  console.log('🗑️ deleteAsset service - Found work orders:', workOrders?.length || 0);
  
  if (workOrders && workOrders.length > 0) {
    console.error('❌ deleteAsset service - Cannot delete asset with work orders');
    throw new Error(`Cannot delete asset "${assetDetails.name}" because it has ${workOrders.length} associated work order(s). Please resolve or reassign work orders first.`);
  }
  
  console.log('🗑️ deleteAsset service - All checks passed. Attempting to delete asset from database...');
  const { error, count } = await supabase
    .from("assets")
    .delete({ count: 'exact' })
    .eq("id", assetId);
    
  if (error) {
    console.error('❌ deleteAsset service - Database deletion failed:', error);
    throw error;
  }
  
  console.log('✅ deleteAsset service - Asset successfully deleted from database. Rows affected:', count);
  
  // Verify deletion was successful by checking the count
  if (count === 0) {
    console.error('❌ deleteAsset service - No rows were deleted - asset may not exist');
    throw new Error("Asset deletion failed - no rows were affected");
  }
  
  console.log('✅ deleteAsset service - Deletion completed successfully');
}
