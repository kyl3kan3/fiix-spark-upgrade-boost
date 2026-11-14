
import { supabase } from "@/integrations/supabase/client";

// Delete an asset with comprehensive constraint checking
export async function deleteAsset(assetId: string) {
 // First check if asset exists
 const { data: assetDetails, error: assetError } = await supabase
 .from("assets")
 .select("id, name, parent_id, location_id")
 .eq("id", assetId)
 .single();
 
 if (assetError) {
 if (assetError.code === 'PGRST116') {
 return; // An already-deleted asset is an idempotent success.
 }
 console.error('❌ deleteAsset service - Error fetching asset details:', assetError);
 throw assetError;
 }

 // Check for child assets
 const { data: childAssets, error: childError } = await supabase
 .from('assets')
 .select('id, name')
 .eq('parent_id', assetId);
 
 if (childError) {
 console.error('❌ deleteAsset service - Error checking child assets:', childError);
 throw new Error(`Failed to check child assets: ${childError.message}`);
 }
 
 if (childAssets && childAssets.length > 0) {
 const childNames = childAssets.map(child => child.name || child.id).join(', ');
 throw new Error(`Cannot delete asset "${assetDetails.name}" because it has ${childAssets.length} child assets: ${childNames}. Please delete the child assets first.`);
 }

 // Check for work orders
 const { data: workOrders, error: workOrderError } = await supabase
 .from('work_orders')
 .select('id, title')
 .eq('asset_id', assetId);
 
 if (workOrderError) {
 console.error('❌ deleteAsset service - Error checking work orders:', workOrderError);
 throw new Error(`Failed to check work orders: ${workOrderError.message}`);
 }
 
 if (workOrders && workOrders.length > 0) {
 const workOrderTitles = workOrders.map(wo => wo.title || wo.id).join(', ');
 throw new Error(`Cannot delete asset "${assetDetails.name}" because it has ${workOrders.length} associated work orders: ${workOrderTitles}. Please resolve these work orders first.`);
 }

 // The vendor_assets FK cascades inside the asset DELETE transaction.
 // Never remove relationships in an earlier independent request.
 const { error: deleteError } = await supabase
 .from("assets")
 .delete()
 .eq("id", assetId);
 
 if (deleteError) {
 console.error('❌ deleteAsset service - Database deletion failed:', deleteError);
 throw new Error(`Failed to delete asset "${assetDetails.name}": ${deleteError.message}`);
 }
 
 // Verify the asset is actually gone
 const { data: verifyGone, error: verifyError } = await supabase
 .from("assets")
 .select("id")
 .eq("id", assetId)
 .maybeSingle();
 
 if (verifyError) throw verifyError;
 if (verifyGone) {
 console.error('❌ deleteAsset service - Asset still exists after deletion attempt');
 throw new Error(`Asset deletion failed - "${assetDetails.name}" could not be deleted. This may be due to database constraints or permissions.`);
 }
}
