
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo } from "@/components/profile/company/types";
import { toast } from "sonner";
import { CompanyData } from "./types";

/**
 * Creates a new company and associates it with the current user
 */
export const createCompany = async (companyData: Partial<CompanyInfo>): Promise<CompanyData> => {
  try {
    console.log("Creating company with data:", companyData);
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error fetching user:", userError);
      throw new Error("Failed to get current user");
    }
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Check if company with the same name already exists
    if (companyData.companyName) {
      const { data: existingCompany, error: searchError } = await supabase
        .from("companies")
        .select("id")
        .ilike("name", companyData.companyName)
        .maybeSingle();
      
      if (searchError) {
        console.error("Error checking existing companies:", searchError);
        throw searchError;
      }
      
      if (existingCompany) {
        console.log("Company with this name already exists:", existingCompany);
        
        // If company exists, associate user with it instead of creating a new one
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ 
            company_id: existingCompany.id,
            role: "administrator" 
          })
          .eq("id", user.id);
          
        if (updateError) {
          console.error("Error associating user with existing company:", updateError);
          throw updateError;
        }
        
        console.log("User set as administrator for existing company");
        
        // Update user roles in a separate query to ensure it's set
        const { error: roleError } = await supabase
          .from("profiles")
          .update({ role: "administrator" })
          .eq("id", user.id);
          
        if (roleError) {
          console.error("Error setting user as administrator:", roleError);
          throw roleError;
        }
        
        // Set up complete flag
        localStorage.setItem('maintenease_setup_complete', 'true');
        
        // Fetch full company data to return
        const { data: company, error: fetchError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", existingCompany.id)
          .single();
          
        if (fetchError) {
          console.error("Error fetching existing company details:", fetchError);
          throw fetchError;
        }
        
        // Verify the profile update was successful by checking again
        const { data: profileCheck } = await supabase
          .from("profiles")
          .select("company_id, role")
          .eq("id", user.id)
          .maybeSingle();
          
        console.log("Updated profile check:", profileCheck);
        
        return company;
      }
    }
    
    // Create company 
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
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
        created_by: user.id 
      })
      .select()
      .single();
    
    if (companyError) {
      console.error("Error creating company:", companyError);
      throw companyError;
    }
    
    console.log("Company created successfully:", company);
    
    // First update - set company_id
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        company_id: company.id,
        role: "administrator"
      })
      .eq("id", user.id);
    
    if (updateError) {
      console.error("Error associating user with company:", updateError);
      throw updateError;
    }
    
    console.log("User profile updated with company ID:", company.id);
    
    // Second update - ensure role is set separately (for redundancy)
    const { error: roleError } = await supabase
      .from("profiles")
      .update({ role: "administrator" })
      .eq("id", user.id);
    
    if (roleError) {
      console.error("Error setting user as administrator:", roleError);
      throw roleError;
    }
    
    console.log("User set as administrator for the company");
    
    // Verify the profile update was successful
    const { data: profileCheck } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .maybeSingle();
      
    console.log("Updated profile check:", profileCheck);
    
    // Set setup complete flag
    localStorage.setItem('maintenease_setup_complete', 'true');
    
    return company;
  } catch (error) {
    console.error("Error in createCompany:", error);
    throw error;
  }
};
