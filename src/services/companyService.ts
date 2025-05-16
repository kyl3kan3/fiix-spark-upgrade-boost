import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CompanyInfo } from "@/components/profile/company/types";

/**
 * Fetches the current user's company information
 */
export const fetchUserCompany = async () => {
  try {
    // First get the current user's profile to obtain company_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      throw profileError;
    }
    
    // If user doesn't have a company_id, return null
    if (!profile?.company_id) {
      return null;
    }
    
    // Fetch company data
    const { data: company, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", profile.company_id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching company:", error);
      throw error;
    }
    
    return company;
  } catch (error) {
    console.error("Error in fetchUserCompany:", error);
    return null;
  }
};

/**
 * Creates a new company and associates it with the current user
 */
export const createCompany = async (companyData: Partial<CompanyInfo>) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
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
        throw new Error("A company with this name already exists");
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
        logo: companyData.logo
      })
      .select()
      .single();
    
    if (companyError) {
      console.error("Error creating company:", companyError);
      throw companyError;
    }
    
    // Associate user with the company
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        company_id: company.id 
      })
      .eq("id", user.id);
    
    if (updateError) {
      console.error("Error associating user with company:", updateError);
      throw updateError;
    }
    
    // Set user as administrator if not already
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
      
    if (profile && profile.role !== "administrator") {
      const { error: roleError } = await supabase
        .from("profiles")
        .update({ role: "administrator" })
        .eq("id", user.id);
      
      if (roleError) {
        console.error("Error setting user as administrator:", roleError);
      }
    }
    
    return company;
  } catch (error) {
    console.error("Error in createCompany:", error);
    throw error;
  }
};

/**
 * Updates an existing company
 */
export const updateCompany = async (companyId: string, companyData: Partial<CompanyInfo>) => {
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

/**
 * Adds a user to an existing company
 */
export const addUserToCompany = async (userId: string, companyId: string) => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ company_id: companyId })
      .eq("id", userId);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error adding user to company:", error);
    return false;
  }
};

/**
 * Converts the database company object to CompanyInfo format used in the UI
 */
export const mapCompanyToCompanyInfo = (company: any): CompanyInfo => {
  if (!company) return {};
  
  return {
    companyName: company.name,
    industry: company.industry,
    address: company.address,
    city: company.city,
    state: company.state,
    zipCode: company.zip_code,
    phone: company.phone,
    email: company.email,
    website: company.website,
    logo: company.logo
  };
};
