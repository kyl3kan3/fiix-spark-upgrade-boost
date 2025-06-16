
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
    if (assetError.code === 'PGRST116') {
      console.log('🗑️ deleteAsset service - Asset not found (already deleted)');
      throw new Error("Asset not found - it may have already been deleted");
    }
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
  
  // Check for vendor asset relationships
  console.log('🗑️ deleteAsset service - Checking for vendor relationships...');
  const { data: vendorAssets, error: vendorAssetsError } = await supabase
    .from("vendor_assets")
    .select("id, vendor_id")
    .eq("asset_id", assetId);
    
  if (vendorAssetsError) {
    console.error('❌ deleteAsset service - Error checking vendor assets:', vendorAssetsError);
    throw vendorAssetsError;
  }
  
  console.log('🗑️ deleteAsset service - Found vendor relationships:', vendorAssets?.length || 0);
  
  if (vendorAssets && vendorAssets.length > 0) {
    console.log('🗑️ deleteAsset service - Deleting vendor asset relationships first...');
    const { error: vendorDeleteError } = await supabase
      .from("vendor_assets")
      .delete()
      .eq("asset_id", assetId);
      
    if (vendorDeleteError) {
      console.error('❌ deleteAsset service - Error deleting vendor relationships:', vendorDeleteError);
      throw new Error(`Failed to delete vendor relationships: ${vendorDeleteError.message}`);
    }
    console.log('✅ deleteAsset service - Vendor relationships deleted successfully');
  }
  
  console.log('🗑️ deleteAsset service - All checks passed. Attempting to delete asset from database...');
  
  // Perform the deletion with more detailed error handling
  const { error: deleteError, count } = await supabase
    .from("assets")
    .delete({ count: 'exact' })
    .eq("id", assetId);
    
  if (deleteError) {
    console.error('❌ deleteAsset service - Database deletion failed:', deleteError);
    throw new Error(`Failed to delete asset: ${deleteError.message}`);
  }
  
  console.log('✅ deleteAsset service - Delete operation completed. Rows affected:', count);
  
  // Check if any rows were actually deleted
  if (count === 0) {
    console.error('❌ deleteAsset service - No rows were deleted despite asset existing');
    throw new Error(`Asset deletion failed - asset "${assetDetails.name}" could not be deleted. This may be due to database constraints or the asset being referenced by other records.`);
  }
  
  console.log('✅ deleteAsset service - Deletion completed successfully');
}
