
import { supabase } from "@/integrations/supabase/client";
import { AssetFormValues } from "@/components/workOrders/assets/AssetFormSchema";
import { requireUserCompany } from "@/services/supabaseHelpers";

async function getCurrentUserCompanyId(): Promise<string> {
 const { companyId } = await requireUserCompany();
 return companyId;
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
 image_url: assetData.image_url || null,
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

export async function bulkCreateAssets(names: string[], opts?: { description?: string }) {
 const company_id = await getCurrentUserCompanyId();
 const rows = names
 .map((n) => n.trim())
 .filter(Boolean)
 .map((name) => ({
 name,
 description: opts?.description || null,
 status: "active" as const,
 company_id,
 }));
 if (rows.length === 0) return { data: [], error: null };
 return await supabase.from("assets").insert(rows).select();
}

export type BulkAssetRow = {
 name: string;
 description?: string | null;
 model?: string | null;
 serial_number?: string | null;
 location?: string | null;
 status?: string | null;
};

export async function bulkCreateAssetsFromRows(rows: BulkAssetRow[]) {
 const company_id = await getCurrentUserCompanyId();
 const allowed = new Set(["active", "inactive", "maintenance", "retired"]);
 const cleaned = rows
 .filter((r) => r.name && r.name.trim())
 .map((r) => {
 const status = (r.status || "active").toLowerCase();
 return {
 name: r.name.trim(),
 description: r.description?.toString().trim() || null,
 model: r.model?.toString().trim() || null,
 serial_number: r.serial_number?.toString().trim() || null,
 location: r.location?.toString().trim() || null,
 status: (allowed.has(status) ? status : "active") as
 | "active"
 | "inactive"
 | "maintenance"
 | "retired",
 company_id,
 };
 });
 if (cleaned.length === 0) return { data: [], error: null };
 return await supabase.from("assets").insert(cleaned).select();
}
