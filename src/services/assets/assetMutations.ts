
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

// Delete an asset with comprehensive constraint checking
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

  // Check for child assets
  console.log('🗑️ deleteAsset service - Checking for child assets...');
  const { data: childAssets, error: childError } = await supabase
    .from('assets')
    .select('id, name')
    .eq('parent_id', assetId);
    
  if (childError) {
    console.error('❌ deleteAsset service - Error checking child assets:', childError);
    throw new Error(`Failed to check child assets: ${childError.message}`);
  }
  
  console.log(`🗑️ deleteAsset service - Found ${childAssets?.length || 0} child assets`);
  
  if (childAssets && childAssets.length > 0) {
    const childNames = childAssets.map(child => child.name || child.id).join(', ');
    throw new Error(`Cannot delete asset "${assetDetails.name}" because it has ${childAssets.length} child assets: ${childNames}. Please delete the child assets first.`);
  }

  // Check for work orders
  console.log('🗑️ deleteAsset service - Checking for work orders...');
  const { data: workOrders, error: workOrderError } = await supabase
    .from('work_orders')
    .select('id, title')
    .eq('asset_id', assetId);
    
  if (workOrderError) {
    console.error('❌ deleteAsset service - Error checking work orders:', workOrderError);
    throw new Error(`Failed to check work orders: ${workOrderError.message}`);
  }
  
  console.log(`🗑️ deleteAsset service - Found ${workOrders?.length || 0} work orders`);
  
  if (workOrders && workOrders.length > 0) {
    const workOrderTitles = workOrders.map(wo => wo.title || wo.id).join(', ');
    throw new Error(`Cannot delete asset "${assetDetails.name}" because it has ${workOrders.length} associated work orders: ${workOrderTitles}. Please resolve these work orders first.`);
  }

  // Check and auto-delete vendor asset relationships
  console.log('🗑️ deleteAsset service - Checking for vendor asset relationships...');
  const { data: vendorAssets, error: vendorError } = await supabase
    .from('vendor_assets')
    .select('id')
    .eq('asset_id', assetId);
    
  if (vendorError) {
    console.error('❌ deleteAsset service - Error checking vendor relationships:', vendorError);
    throw new Error(`Failed to check vendor relationships: ${vendorError.message}`);
  }
  
  console.log(`🗑️ deleteAsset service - Found ${vendorAssets?.length || 0} vendor relationships`);
  
  if (vendorAssets && vendorAssets.length > 0) {
    // Auto-delete vendor asset relationships
    console.log('🗑️ deleteAsset service - Auto-deleting vendor asset relationships...');
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

  // Perform the deletion with detailed error handling
  console.log('🗑️ deleteAsset service - All checks passed. Attempting deletion...');
  
  const { error: deleteError, count } = await supabase
    .from("assets")
    .delete({ count: 'exact' })
    .eq("id", assetId);
    
  if (deleteError) {
    console.error('❌ deleteAsset service - Database deletion failed:', deleteError);
    console.error('❌ deleteAsset service - Error details:', {
      message: deleteError.message,
      code: deleteError.code,
      details: deleteError.details,
      hint: deleteError.hint
    });
    
    // Check for specific constraint violations
    if (deleteError.message.includes('foreign key constraint') || deleteError.code === '23503') {
      // Try to extract table name from error message
      let constraintDetails = 'unknown table';
      const errorMsg = deleteError.message.toLowerCase();
      
      if (errorMsg.includes('work_order')) {
        constraintDetails = 'work_orders table';
      } else if (errorMsg.includes('vendor_asset')) {
        constraintDetails = 'vendor_assets table';
      } else if (errorMsg.includes('asset')) {
        constraintDetails = 'assets table (parent-child relationship)';
      } else if (errorMsg.includes('location')) {
        constraintDetails = 'locations table';
      }
      
      throw new Error(`Cannot delete asset "${assetDetails.name}" due to foreign key constraint from ${constraintDetails}. The asset is still being referenced by records in another table. Full error: ${deleteError.message}`);
    }
    
    throw new Error(`Failed to delete asset "${assetDetails.name}": ${deleteError.message}`);
  }
  
  console.log('✅ deleteAsset service - Delete operation completed. Rows affected:', count);
  
  // Check if any rows were actually deleted
  if (count === 0) {
    console.error('❌ deleteAsset service - No rows were deleted despite asset existing');
    throw new Error(`Asset deletion failed - asset "${assetDetails.name}" could not be deleted. This indicates the asset may have been deleted by another process or there are database constraints we haven't detected.`);
  }
  
  console.log('✅ deleteAsset service - Deletion completed successfully');
}
