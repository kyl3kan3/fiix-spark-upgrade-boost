
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

  // Comprehensive check for ALL possible references
  const referencesToCheck = [
    {
      table: 'assets',
      column: 'parent_id',
      description: 'child assets'
    },
    {
      table: 'work_orders',
      column: 'asset_id',
      description: 'work orders'
    },
    {
      table: 'vendor_assets',
      column: 'asset_id',
      description: 'vendor relationships'
    }
  ];

  // Check each possible reference
  for (const ref of referencesToCheck) {
    console.log(`🗑️ deleteAsset service - Checking ${ref.table} for references...`);
    
    const { data: references, error: refError } = await supabase
      .from(ref.table)
      .select('id, name')
      .eq(ref.column, assetId);
      
    if (refError) {
      console.error(`❌ deleteAsset service - Error checking ${ref.table}:`, refError);
      throw new Error(`Failed to check ${ref.description}: ${refError.message}`);
    }
    
    console.log(`🗑️ deleteAsset service - Found ${references?.length || 0} references in ${ref.table}`);
    
    if (references && references.length > 0) {
      if (ref.table === 'vendor_assets') {
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
      } else {
        // Block deletion for other types of references
        const referenceNames = references.map(r => r.name || r.id).join(', ');
        throw new Error(`Cannot delete asset "${assetDetails.name}" because it has ${references.length} associated ${ref.description}: ${referenceNames}. Please resolve these references first.`);
      }
    }
  }

  // Additional check: Look for any other potential foreign key references by trying the delete first
  console.log('🗑️ deleteAsset service - All known checks passed. Attempting deletion...');
  
  // Perform the deletion with detailed error handling
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
