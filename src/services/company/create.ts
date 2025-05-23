
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo } from "@/components/profile/company/types";
import { CompanyData } from "./types";
import { mapCompanyInfoToCompanyData } from "./utils";

/**
 * Creates a new company and associates it with the current user
 */
export const createCompany = async (companyData: Partial<CompanyInfo>): Promise<CompanyData> => {
  try {
    console.log("Creating company with data:", companyData);
    
    // Get the current user - with better error handling
    const { data, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error fetching user:", userError);
      throw new Error("Failed to get current user");
    }
    
    const user = data?.user;
    if (!user) {
      console.error("No authenticated user found");
      throw new Error("User not authenticated");
    }
    
    // Get user email for profile updates
    const email = user.email || '';
    
    // Convert CompanyInfo to CompanyData format
    const dbData = mapCompanyInfoToCompanyData(companyData);
    
    // Check if company with the same name already exists
    if (dbData.name) {
      const { data: existingCompany, error: searchError } = await supabase
        .from("companies")
        .select("id")
        .ilike("name", dbData.name)
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
          .upsert({ 
            id: user.id,
            company_id: existingCompany.id,
            role: "administrator",
            email: email
          });
          
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
    
    // Ensure name is always provided for the insert operation
    if (!dbData.name) {
      throw new Error("Company name is required");
    }

    // Create company with the converted data format
    const insertData = {
      name: dbData.name, // Ensure name is explicitly set
      industry: dbData.industry,
      address: dbData.address,
      city: dbData.city,
      state: dbData.state,
      zip_code: dbData.zip_code,
      phone: dbData.phone,
      email: dbData.email,
      website: dbData.website,
      logo: dbData.logo,
      created_by: user.id
    };
    
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert(insertData)
      .select()
      .single();
    
    if (companyError) {
      console.error("Error creating company:", companyError);
      throw companyError;
    }
    
    console.log("Company created successfully:", company);
    
    // Try multiple approaches to ensure the profile gets updated
    
    // First update - set company_id
    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({ 
        id: user.id,
        company_id: company.id,
        role: "administrator",
        email: email
      });
    
    if (updateError) {
      console.error("Error associating user with company:", updateError);
      
      // Try an alternative approach if the upsert fails
      const { error: updateAltError } = await supabase
        .from("profiles")
        .update({ company_id: company.id, role: "administrator" })
        .eq("id", user.id);
        
      if (updateAltError) {
        console.error("Alternative update also failed:", updateAltError);
        throw updateError;
      } else {
        console.log("Alternative profile update succeeded");
      }
    } else {
      console.log("User profile updated with company ID:", company.id);
    }
    
    // Second update - ensure role is set separately (for redundancy)
    const { error: roleError } = await supabase
      .from("profiles")
      .update({ role: "administrator" })
      .eq("id", user.id);
    
    if (roleError) {
      console.error("Error setting user as administrator:", roleError);
    } else {
      console.log("User set as administrator for the company");
    }
    
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
  } catch (error: any) {
    console.error("Error in createCompany:", error);
    throw error;
  }
};
