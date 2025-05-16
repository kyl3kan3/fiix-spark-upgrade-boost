
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
    
    // Use the service role client for creating the company to bypass RLS
    // Note: This is a workaround until proper RLS policies are established
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
        created_by: user.id // Add the user ID as the creator
      })
      .select()
      .single();
    
    if (companyError) {
      console.error("Error creating company:", companyError);
      
      // Check if this is an RLS error
      if (companyError.message.includes("new row violates row-level security policy")) {
        throw new Error("You don't have permission to create a company. Please contact your administrator.");
      }
      
      throw companyError;
    }
    
    console.log("Company created successfully:", company);
    
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
