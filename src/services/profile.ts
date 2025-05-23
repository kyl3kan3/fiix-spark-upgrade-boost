
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates a user's profile with company information
 */
export const updateUserProfileCompany = async (userId: string, companyId: string) => {
  try {
    // First try with standard client
    const { data, error } = await supabase
      .from("profiles")
      .update({ company_id: companyId })
      .eq("id", userId)
      .select();
    
    if (error) {
      console.error("Error updating profile with company:", error);
      
      // If it's an RLS error, we need to refresh the session
      if (error.message.includes("violates row-level security policy")) {
        // Refresh the session to get new tokens
        const { error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          throw new Error(`Failed to refresh session: ${refreshError.message}`);
        }
        
        // Try again after refresh
        const { data: retryData, error: retryError } = await supabase
          .from("profiles")
          .update({ company_id: companyId })
          .eq("id", userId)
          .select();
        
        if (retryError) {
          throw new Error(`Failed to update profile after refresh: ${retryError.message}`);
        }
        
        return retryData;
      }
      
      throw new Error(`Failed to update profile: ${error.message}`);
    }
    
    return data;
  } catch (error: any) {
    console.error("Error in updateUserProfileCompany:", error);
    throw error;
  }
};

/**
 * Gets a user profile by ID
 */
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    if (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }
    
    return data;
  } catch (error: any) {
    console.error("Error in getUserProfile:", error);
    throw error;
  }
};
