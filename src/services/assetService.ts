
import { supabase } from "@/integrations/supabase/client";
import { AssetFormValues } from "@/components/workOrders/assets/AssetFormSchema";

export async function createAsset(assetData: AssetFormValues) {
  const formattedData = {
    name: assetData.name,
    description: assetData.description || null,
    location: assetData.location || null,
    model: assetData.model || null,
    serial_number: assetData.serial_number || null,
    purchase_date: assetData.purchase_date ? assetData.purchase_date : null,
    status: assetData.status
  };

  const response = await supabase
    .from("assets")
    .insert(formattedData)
    .select();
    
  return response;
}

export async function updateAsset(assetId: string, assetData: AssetFormValues) {
  const formattedData = {
    name: assetData.name,
    description: assetData.description || null,
    location: assetData.location || null,
    model: assetData.model || null,
    serial_number: assetData.serial_number || null,
    purchase_date: assetData.purchase_date ? assetData.purchase_date : null,
    status: assetData.status
  };

  const response = await supabase
    .from("assets")
    .update(formattedData)
    .eq("id", assetId)
    .select();
    
  return response;
}
