
import { supabase } from "@/integrations/supabase/client";
import { CompanyData } from "./types";

/**
 * Fetches company information for the currently logged in user
 */
export const fetchUserCompany = async (): Promise<CompanyData | null> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error fetching user:", userError);
      throw new Error("User not authenticated");
    }
    
    // Fetch user's profile to get company ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }
    
    if (!profile?.company_id) {
      return null; // User has no associated company
    }
    
    // Fetch company details
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", profile.company_id)
      .single();
    
    if (companyError) {
      console.error("Error fetching company:", companyError);
      throw companyError;
    }
    
    return company;
  } catch (error) {
    console.error("Error in fetchUserCompany:", error);
    throw error;
  }
};
