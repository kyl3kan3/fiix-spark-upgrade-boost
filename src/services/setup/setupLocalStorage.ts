import { supabase } from "@/integrations/supabase/client";
import { SetupData } from "./setupTypes";

// The localStorage key where setup data is stored
const SETUP_DATA_KEY = "maintenease_setup";
const SETUP_COMPLETE_KEY = "maintenease_setup_complete";

/**
 * Loads setup data from Supabase or falls back to localStorage
 */
export const loadSetupData = async (): Promise<SetupData> => {
  try {
    // First try to load from Supabase if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!authError && user) {
      // Try to load from Supabase by getting the company info
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("created_by", user.id)
        .maybeSingle();

      if (!companyError && company) {
        // Map company data to setup data structure
        const setupData: SetupData = {
          companyInfo: {
            companyName: company.name || "",
            industry: company.industry || "",
            address: company.address || "",
            city: company.city || "",
            state: company.state || "",
            zipCode: company.zip_code || "",
            phone: company.phone || "",
            email: company.email || "",
            website: company.website || "",
            logo: company.logo || null,
          },
          userRoles: {},
          assetCategories: {},
          locations: {},
          maintenanceSchedules: {},
          notifications: {},
          integrations: {},
          dashboardCustomization: {}
        };

        return setupData;
      }
    }

    // Fall back to localStorage if Supabase fails or user is not authenticated
    console.log("Falling back to localStorage for setup data");
    const storedData = localStorage.getItem(SETUP_DATA_KEY);
    if (storedData) {
      try {
        return JSON.parse(storedData) as SetupData;
      } catch (e) {
        console.error("Error parsing localStorage setup data:", e);
      }
    }

    // Return empty data if nothing found
    return {
      companyInfo: {},
      userRoles: {},
      assetCategories: {},
      locations: {},
      maintenanceSchedules: {},
      notifications: {},
      integrations: {},
      dashboardCustomization: {}
    };
  } catch (error) {
    console.error("Error in loadSetupData:", error);
    
    // Fall back to localStorage in case of any error
    const storedData = localStorage.getItem(SETUP_DATA_KEY);
    if (storedData) {
      try {
        return JSON.parse(storedData) as SetupData;
      } catch (e) {
        console.error("Error parsing localStorage setup data:", e);
      }
    }
    
    // Return empty data as the last resort
    return {
      companyInfo: {},
      userRoles: {},
      assetCategories: {},
      locations: {},
      maintenanceSchedules: {},
      notifications: {},
      integrations: {},
      dashboardCustomization: {}
    };
  }
};

/**
 * Saves setup data to Supabase and localStorage
 */
export const saveSetupData = async (data: SetupData, isComplete: boolean): Promise<void> => {
  try {
    // Always save to localStorage first for redundancy
    localStorage.setItem(SETUP_DATA_KEY, JSON.stringify(data));
    localStorage.setItem(SETUP_COMPLETE_KEY, isComplete.toString());
    
    // Check if user is authenticated before attempting to save to Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log("User not authenticated, saving to localStorage only");
      return;
    }
    
    // If we have company info and the user is authenticated, save to Supabase
    if (data.companyInfo && Object.keys(data.companyInfo).length > 0) {
      // Check if user already has a company
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();
        
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        return;
      }
      
      if (profile?.company_id) {
        // Update existing company
        const companyData = {
          name: data.companyInfo.companyName,
          industry: data.companyInfo.industry,
          address: data.companyInfo.address,
          city: data.companyInfo.city,
          state: data.companyInfo.state,
          zip_code: data.companyInfo.zipCode,
          phone: data.companyInfo.phone,
          email: data.companyInfo.email,
          website: data.companyInfo.website,
          logo: data.companyInfo.logo
        };
        
        const { error: updateError } = await supabase
          .from("companies")
          .update(companyData)
          .eq("id", profile.company_id);
          
        if (updateError) {
          console.error("Error updating company:", updateError);
        }
      }
      
      // Save other setup data (to be implemented based on feature requirements)
    }
  } catch (error) {
    console.error("Error in saveSetupData:", error);
    // Data is already saved to localStorage, so no need to retry
  }
};

/**
 * Resets setup data in both Supabase and localStorage
 */
export const resetSetupData = async (): Promise<void> => {
  try {
    // Clear localStorage data
    localStorage.removeItem(SETUP_DATA_KEY);
    localStorage.removeItem(SETUP_COMPLETE_KEY);
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log("User not authenticated, can only reset localStorage data");
      return;
    }
    
    // Get user's company ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();
      
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return;
    }
    
    if (profile?.company_id) {
      // Reset company data but don't delete it - just clear optional fields
      const { error: updateError } = await supabase
        .from("companies")
        .update({
          industry: null,
          address: null,
          city: null,
          state: null,
          zip_code: null,
          phone: null,
          website: null,
          logo: null
        })
        .eq("id", profile.company_id);
        
      if (updateError) {
        console.error("Error resetting company data:", updateError);
      }
    }
    
    // Reset other setup data as needed
    
  } catch (error) {
    console.error("Error in resetSetupData:", error);
  }
};

/**
 * Checks if setup has been completed
 */
export const isSetupCompleted = async (): Promise<boolean> => {
  // First check localStorage
  const isComplete = localStorage.getItem(SETUP_COMPLETE_KEY) === 'true';
  
  // If marked complete in localStorage, return true
  if (isComplete) {
    return true;
  }
  
  // Otherwise check Supabase for company association
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return false;
    }
    
    // Check if user has a company association
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();
      
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return false;
    }
    
    // If user has a company ID, consider setup completed
    return !!profile?.company_id;
    
  } catch (error) {
    console.error("Error checking setup completion:", error);
    return false;
  }
};
