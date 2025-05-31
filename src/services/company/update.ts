
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
      
      // Get the current company's name first
      const { data: currentCompany, error: currentCompanyError } = await supabase
        .from("companies")
        .select("name")
        .eq("id", companyId)
        .single();
      
      if (currentCompanyError) {
        console.error("Error fetching current company:", currentCompanyError);
        throw new Error(`Unable to verify company information: ${currentCompanyError.message}`);
      }
      
      console.log("Current company name:", currentCompany?.name);
      
      // Only check for conflicts if the name is actually changing
      if (currentCompany && currentCompany.name.toLowerCase() !== updateData.name.toLowerCase()) {
        console.log("Name is changing, checking for conflicts...");
        
        const { data: existingCompanies, error: searchError } = await supabase
          .from("companies")
          .select("id, name")
          .neq("id", companyId);
        
        if (searchError) {
          console.error("Error checking existing companies:", searchError);
          throw new Error(`Failed to check for duplicate company names: ${searchError.message}`);
        }
        
        console.log("Existing companies:", existingCompanies);
        
        // Check for case-insensitive name conflicts
        const nameConflict = existingCompanies?.find(
          company => company.name.toLowerCase() === updateData.name.toLowerCase()
        );
        
        if (nameConflict) {
          console.error("Name conflict found:", nameConflict);
          throw new Error("A company with this name already exists. Please choose a different name.");
        }
        
        console.log("No name conflicts found");
      } else {
        console.log("Name is not changing, skipping conflict check");
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
      
      // Provide more specific error messages based on error type
      if (error.code === '23505') {
        throw new Error("A company with this information already exists. Please check your input.");
      } else if (error.code === '42501') {
        throw new Error("You don't have permission to update this company information.");
      } else {
        throw new Error(`Failed to update company: ${error.message || 'Unknown database error'}`);
      }
    }
    
    if (!data) {
      throw new Error("Company update completed but no data was returned. Please refresh and try again.");
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
      // Re-throw the error with its original message
      throw error;
    } else {
      // Handle non-Error objects
      throw new Error("An unexpected error occurred while updating company information");
    }
  }
};
