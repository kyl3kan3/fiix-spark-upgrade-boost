
import { supabase } from "@/integrations/supabase/client";
import { CompanyData } from "./types";

/**
 * Fetches the current user's company information
 */
export const fetchUserCompany = async (): Promise<CompanyData | null> => {
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
