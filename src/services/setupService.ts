
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SetupData {
  companyInfo: Record<string, any>;
  userRoles: Record<string, any>;
  assetCategories: Record<string, any>;
  locations: Record<string, any>;
  maintenanceSchedules: Record<string, any>;
  notifications: Record<string, any>;
  integrations: Record<string, any>;
  dashboardCustomization: Record<string, any>;
}

const initialSetupData: SetupData = {
  companyInfo: {},
  userRoles: {},
  assetCategories: {},
  locations: {},
  maintenanceSchedules: {},
  notifications: {},
  integrations: {},
  dashboardCustomization: {}
};

/**
 * Loads setup data from Supabase, falls back to localStorage if not available
 */
export const loadSetupData = async (): Promise<SetupData> => {
  try {
    // First check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Fetch from database if authenticated
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error loading setup data from database:", error);
        return getLocalSetupData();
      }

      if (data) {
        console.log("Loaded setup data from database");
        const setupData: SetupData = {
          companyInfo: data.company_info || {},
          userRoles: data.user_roles || {},
          assetCategories: data.asset_categories || {},
          locations: data.locations || {},
          maintenanceSchedules: data.maintenance_schedules || {},
          notifications: data.notifications || {},
          integrations: data.integrations || {},
          dashboardCustomization: data.dashboard_customization || {}
        };

        // Sync to localStorage for offline use
        localStorage.setItem('maintenease_setup', JSON.stringify(setupData));
        
        if (data.setup_completed) {
          localStorage.setItem('maintenease_setup_complete', 'true');
        }
        
        return setupData;
      }
    }

    // Fall back to localStorage if not authenticated or no data found
    return getLocalSetupData();
  } catch (error) {
    console.error("Error in loadSetupData:", error);
    return getLocalSetupData();
  }
};

/**
 * Saves setup data to Supabase and localStorage
 */
export const saveSetupData = async (setupData: SetupData, isComplete: boolean = false): Promise<boolean> => {
  try {
    // Save to localStorage first as fallback
    localStorage.setItem('maintenease_setup', JSON.stringify(setupData));
    
    if (isComplete) {
      localStorage.setItem('maintenease_setup_complete', 'true');
    }

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log("User not authenticated, saving to localStorage only");
      return true;
    }

    // Check if settings already exist
    const { data: existingData, error: checkError } = await supabase
      .from('system_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing settings:", checkError);
      return false;
    }

    // Format data for Supabase
    const dbData = {
      company_info: setupData.companyInfo || null,
      user_roles: setupData.userRoles || null,
      asset_categories: setupData.assetCategories || null,
      locations: setupData.locations || null,
      maintenance_schedules: setupData.maintenanceSchedules || null,
      notifications: setupData.notifications || null,
      integrations: setupData.integrations || null,
      dashboard_customization: setupData.dashboardCustomization || null,
      setup_completed: isComplete
    };

    let result;
    
    if (existingData?.id) {
      // Update existing record
      result = await supabase
        .from('system_settings')
        .update(dbData)
        .eq('id', existingData.id);
    } else {
      // Insert new record
      result = await supabase
        .from('system_settings')
        .insert(dbData);
    }

    if (result.error) {
      console.error("Error saving setup data to database:", result.error);
      toast.error("Failed to save settings to the database");
      return false;
    }

    console.log("Saved setup data to database");
    return true;
  } catch (error) {
    console.error("Error in saveSetupData:", error);
    return false;
  }
};

/**
 * Gets the local setup data from localStorage
 */
const getLocalSetupData = (): SetupData => {
  try {
    const savedData = localStorage.getItem('maintenease_setup');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      
      // Fix any lowercase key issue - ensure we use camelCase keys
      if (parsedData.companyinfo && !parsedData.companyInfo) {
        parsedData.companyInfo = parsedData.companyinfo;
        delete parsedData.companyinfo;
      }
      
      return {
        companyInfo: parsedData.companyInfo || {},
        userRoles: parsedData.userRoles || {},
        assetCategories: parsedData.assetCategories || {},
        locations: parsedData.locations || {},
        maintenanceSchedules: parsedData.maintenanceSchedules || {},
        notifications: parsedData.notifications || {},
        integrations: parsedData.integrations || {},
        dashboardCustomization: parsedData.dashboardCustomization || {}
      };
    }
  } catch (error) {
    console.error("Error loading setup data from localStorage:", error);
  }
  
  return initialSetupData;
};

/**
 * Checks if setup is completed
 */
export const isSetupCompleted = async (): Promise<boolean> => {
  try {
    // First check localStorage for quick access
    if (localStorage.getItem('maintenease_setup_complete') === 'true') {
      return true;
    }
    
    // Then check database if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setup_completed')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error checking setup completion:", error);
        return false;
      }
      
      return !!data?.setup_completed;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking setup completion:", error);
    return false;
  }
};
