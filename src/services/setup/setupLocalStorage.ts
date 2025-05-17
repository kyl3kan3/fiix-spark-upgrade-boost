
import { supabase } from "@/integrations/supabase/client";
import { SetupData } from "./setupTypes";

/**
 * Load setup data from Supabase (if authenticated) or localStorage
 */
export const loadSetupData = async (): Promise<SetupData> => {
  try {
    // First try to load from Supabase if authenticated
    const { data, error } = await supabase.auth.getUser();
    
    if (!error && data.user) {
      console.log("User authenticated, loading from Supabase");
      
      // Fetch system settings from Supabase
      const { data: settings, error: settingsError } = await supabase
        .from("system_settings")
        .select("*")
        .maybeSingle(); // Use maybeSingle() instead of single() to handle case where no rows exist
        
      if (settingsError) {
        console.error("Error fetching settings from Supabase:", settingsError);
        throw settingsError;
      }
        
      if (settings) {
        console.log("Found settings in Supabase:", settings);
        
        // Convert settings to our SetupData format with proper type checking
        const setupData: SetupData = {
          companyInfo: (settings.company_info as object) || {},
          userRoles: (settings.user_roles as object) || {},
          assetCategories: (settings.asset_categories as object) || {},
          locations: (settings.locations as object) || {},
          maintenanceSchedules: (settings.maintenance_schedules as object) || {},
          notifications: (settings.notifications as object) || {},
          integrations: (settings.integrations as object) || {},
          dashboardCustomization: (settings.dashboard_customization as object) || {}
        };
        
        // Also update localStorage for backup
        localStorage.setItem('maintenease_setup', JSON.stringify(setupData));
        
        return setupData;
      }
    } 
    
    // Fallback to localStorage
    console.log("User not authenticated, loading from localStorage only");
    const savedData = localStorage.getItem('maintenease_setup');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as SetupData;
        return parsedData;
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
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
    console.error("Error loading setup data:", error);
    throw error;
  }
};

/**
 * Save setup data to Supabase (if authenticated) and localStorage
 * Returns a Promise<void> - does not return a success boolean
 */
export const saveSetupData = async (
  setupData: SetupData,
  isSetupComplete: boolean = false
): Promise<void> => {
  try {
    // Save to localStorage first for redundancy
    localStorage.setItem('maintenease_setup', JSON.stringify(setupData));
    
    // Set completion flag if specified
    if (isSetupComplete) {
      localStorage.setItem('maintenease_setup_complete', 'true');
    }
    
    // Try to save to Supabase if authenticated
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      console.log("User not authenticated, saving to localStorage only");
      return;
    }
    
    console.log("User authenticated, saving to Supabase", setupData);
    
    // Convert setupData to database format
    const dbData = {
      company_info: setupData.companyInfo,
      user_roles: setupData.userRoles,
      asset_categories: setupData.assetCategories,
      locations: setupData.locations,
      maintenance_schedules: setupData.maintenanceSchedules,
      notifications: setupData.notifications,
      integrations: setupData.integrations,
      dashboard_customization: setupData.dashboardCustomization,
      setup_completed: isSetupComplete
    };
    
    // Try to update existing record first
    const { data: existingSettings, error: fetchError } = await supabase
      .from("system_settings")
      .select("id")
      .maybeSingle();
      
    if (fetchError) {
      console.error("Error checking existing settings:", fetchError);
    }
    
    if (existingSettings?.id) {
      // Update existing record
      console.log("Updating existing settings");
      const { error: updateError } = await supabase
        .from("system_settings")
        .update(dbData)
        .eq("id", existingSettings.id);
        
      if (updateError) {
        console.error("Error updating settings:", updateError);
        throw updateError;
      }
    } else {
      // Insert new record
      console.log("Creating new settings");
      const { error: insertError } = await supabase
        .from("system_settings")
        .insert([dbData]);
        
      if (insertError) {
        console.error("Error inserting settings:", insertError);
        throw insertError;
      }
    }
    
    console.log("Setup data saved successfully");
    console.log("Updated completion status:", isSetupComplete);
  } catch (error) {
    console.error("Error saving setup data:", error);
    throw error;
  }
};

/**
 * Reset all setup data and completion status
 */
export const resetSetupData = async (): Promise<void> => {
  try {
    // Clear localStorage
    localStorage.removeItem('maintenease_setup');
    localStorage.removeItem('maintenease_setup_complete');
    
    // Try to clear Supabase data if authenticated
    const { data, error } = await supabase.auth.getUser();
    
    if (!error && data.user) {
      // Get existing settings
      const { data: settings, error: fetchError } = await supabase
        .from("system_settings")
        .select("id")
        .maybeSingle();
        
      if (fetchError) {
        console.error("Error fetching settings:", fetchError);
      }
      
      if (settings?.id) {
        // Update with empty data
        const emptyData = {
          company_info: {},
          user_roles: {},
          asset_categories: {},
          locations: {},
          maintenance_schedules: {},
          notifications: {},
          integrations: {},
          dashboard_customization: {},
          setup_completed: false
        };
        
        const { error: updateError } = await supabase
          .from("system_settings")
          .update(emptyData)
          .eq("id", settings.id);
          
        if (updateError) {
          console.error("Error resetting settings:", updateError);
          throw updateError;
        }
      }
    }
    
    console.log("Setup data reset successfully");
  } catch (error) {
    console.error("Error resetting setup data:", error);
    throw error;
  }
};

/**
 * Check if setup has been completed
 */
export const isSetupCompleted = async (): Promise<boolean> => {
  try {
    // First check localStorage
    const localCompleted = localStorage.getItem('maintenease_setup_complete') === 'true';
    
    // If authenticated, check Supabase as well
    const { data, error } = await supabase.auth.getUser();
    
    if (!error && data.user) {
      const { data: settings, error: fetchError } = await supabase
        .from("system_settings")
        .select("setup_completed")
        .maybeSingle(); // Use maybeSingle() instead of single() to handle case where no rows exist
        
      if (fetchError) {
        console.error("Error fetching setup completion status:", fetchError);
      }
      
      if (settings) {
        return settings.setup_completed === true || localCompleted;
      }
    }
    
    // Default to localStorage value
    return localCompleted;
  } catch (error) {
    console.error("Error checking setup completion status:", error);
    return localStorage.getItem('maintenease_setup_complete') === 'true';
  }
};
