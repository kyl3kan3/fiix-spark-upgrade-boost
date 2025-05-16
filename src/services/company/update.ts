
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo } from "@/components/profile/company/types";
import { CompanyData } from "./types";

/**
 * Updates an existing company
 */
export const updateCompany = async (companyId: string, companyData: Partial<CompanyInfo>): Promise<CompanyData> => {
  try {
    // Check if company with the same name already exists (except for this company)
    if (companyData.companyName) {
      const { data: existingCompany, error: searchError } = await supabase
        .from("companies")
        .select("id")
        .ilike("name", companyData.companyName)
        .neq("id", companyId)
        .maybeSingle();
      
      if (searchError) {
        console.error("Error checking existing companies:", searchError);
        throw searchError;
      }
      
      if (existingCompany) {
        throw new Error("A company with this name already exists");
      }
    }
    
    const updateData: Record<string, any> = {
      name: companyData.companyName,
      industry: companyData.industry,
      address: companyData.address,
      city: companyData.city,
      state: companyData.state,
      zip_code: companyData.zipCode,
      phone: companyData.phone,
      email: companyData.email,
      website: companyData.website,
      logo: companyData.logo,
      updated_at: new Date().toISOString()
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    const { data, error } = await supabase
      .from("companies")
      .update(updateData)
      .eq("id", companyId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating company:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in updateCompany:", error);
    throw error;
  }
};
