
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo } from "@/components/profile/company/types";
import { CompanyData } from "./types";
import { mapCompanyInfoToCompanyData } from "./utils";

/**
 * Updates an existing company
 */
export const updateCompany = async (companyId: string, companyInfo: Partial<CompanyInfo>): Promise<CompanyData> => {
  try {
    // Convert CompanyInfo to CompanyData format
    const updateData = mapCompanyInfoToCompanyData(companyInfo);
    
    // Check if company with the same name already exists (except for this company)
    if (updateData.name) {
      const { data: existingCompany, error: searchError } = await supabase
        .from("companies")
        .select("id")
        .ilike("name", updateData.name)
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
    
    // Add updated_at timestamp
    const finalUpdateData = {
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    // Remove undefined values
    Object.keys(finalUpdateData).forEach(key => 
      finalUpdateData[key] === undefined && delete finalUpdateData[key]
    );
    
    const { data, error } = await supabase
      .from("companies")
      .update(finalUpdateData)
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
