
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo } from "@/components/profile/company/types";
import { CompanyData } from "./types";
import { mapCompanyInfoToCompanyData } from "./utils";

/**
 * Updates an existing company
 */
export const updateCompany = async (companyId: string, companyInfo: Partial<CompanyInfo>): Promise<CompanyData> => {
  console.log("=== UPDATE COMPANY START ===");
  console.log("Company ID:", companyId);
  console.log("Company Info to update:", companyInfo);
  
  try {
    // Convert CompanyInfo to CompanyData format
    const updateData = mapCompanyInfoToCompanyData(companyInfo);
    console.log("Mapped update data:", updateData);
    
    // Check if company with the same name already exists (except for this company)
    if (updateData.name) {
      console.log("Checking for name conflicts with:", updateData.name);
      
      const { data: existingCompanies, error: searchError } = await supabase
        .from("companies")
        .select("id, name")
        .neq("id", companyId);
      
      if (searchError) {
        console.error("Error checking existing companies:", searchError);
        throw searchError;
      }
      
      console.log("Existing companies:", existingCompanies);
      
      // Check for case-insensitive name conflicts
      const nameConflict = existingCompanies?.find(
        company => company.name.toLowerCase() === updateData.name.toLowerCase()
      );
      
      if (nameConflict) {
        console.error("Name conflict found:", nameConflict);
        throw new Error("A company with this name already exists");
      }
      
      console.log("No name conflicts found");
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
    
    console.log("Final update data:", finalUpdateData);
    
    const { data, error } = await supabase
      .from("companies")
      .update(finalUpdateData)
      .eq("id", companyId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating company in database:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log("Company updated successfully:", data);
    console.log("=== UPDATE COMPANY SUCCESS ===");
    return data;
  } catch (error) {
    console.error("=== UPDATE COMPANY ERROR ===");
    console.error("Error in updateCompany:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
};
