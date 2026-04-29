
import { supabase } from "@/integrations/supabase/client";
import { AssetFormValues } from "@/components/workOrders/assets/AssetFormSchema";

async function getCurrentUserCompanyId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to create an asset.");
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!profile?.company_id) {
    throw new Error("Your account is not linked to a company. Complete setup first.");
  }
  return profile.company_id;
}

export async function createAsset(assetData: Partial<AssetFormValues>) {
  const company_id = await getCurrentUserCompanyId();
  const formattedData = {
    name: assetData.name,
    description: assetData.description || null,
    location_id: assetData.location_id || null,
    model: assetData.model || null,
    serial_number: assetData.serial_number || null,
    purchase_date: assetData.purchase_date ? assetData.purchase_date : null,
    status: assetData.status as "active" | "inactive" | "maintenance" | "retired",
    parent_id: assetData.parent_id || null,
    company_id,
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
  const company_id = await getCurrentUserCompanyId();
  const response = await supabase
    .from("assets")
    .insert({ ...parentData, company_id })
    .select();
    
  return response;
}
