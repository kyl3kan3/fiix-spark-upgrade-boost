
import { supabase } from "@/integrations/supabase/client";
import { SetupData } from './setupTypes';

/**
 * Loads setup data from Supabase database
 */
export const loadFromDatabase = async (): Promise<{
  data: SetupData | null;
  isComplete: boolean;
  error: any | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error loading setup data from database:", error);
      return { data: null, isComplete: false, error };
    }

    if (!data) {
      return { data: null, isComplete: false, error: null };
    }

    // Format data for application use
    const setupData: SetupData = {
      companyInfo: data.company_info as Record<string, any> || {},
      userRoles: data.user_roles as Record<string, any> || {},
      assetCategories: data.asset_categories as Record<string, any> || {},
      locations: data.locations as Record<string, any> || {},
      maintenanceSchedules: data.maintenance_schedules as Record<string, any> || {},
      notifications: data.notifications as Record<string, any> || {},
      integrations: data.integrations as Record<string, any> || {},
      dashboardCustomization: data.dashboard_customization as Record<string, any> || {}
    };

    const isComplete = !!data.setup_completed;
    
    return { data: setupData, isComplete, error: null };
  } catch (error) {
    console.error("Error in loadFromDatabase:", error);
    return { data: null, isComplete: false, error };
  }
};

/**
 * Saves setup data to Supabase database
 */
export const saveToDatabase = async (
  setupData: SetupData, 
  isComplete: boolean = false
): Promise<{ success: boolean; error: any | null }> => {
  try {
    // Check if settings already exist
    const { data: existingData, error: checkError } = await supabase
      .from('system_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing settings:", checkError);
      return { success: false, error: checkError };
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
      return { success: false, error: result.error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in saveToDatabase:", error);
    return { success: false, error };
  }
};

/**
 * Resets setup data in database
 */
export const resetDatabaseSetupData = async (): Promise<{ success: boolean; error: any | null }> => {
  try {
    // Clear database data - we update with empty values rather than delete
    // to maintain the record but reset all settings
    const { error } = await supabase
      .from('system_settings')
      .update({
        company_info: null,
        user_roles: null,
        asset_categories: null,
        locations: null,
        maintenance_schedules: null,
        notifications: null,
        integrations: null, 
        dashboard_customization: null,
        setup_completed: false
      })
      .not('id', 'is', null);
    
    if (error) {
      console.error("Error resetting setup data in database:", error);
      return { success: false, error };
    }
    
    console.log("Reset setup data in database");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error in resetDatabaseSetupData:", error);
    return { success: false, error };
  }
};

/**
 * Checks if user is authenticated with Supabase
 */
export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  } catch {
    return false;
  }
};

/**
 * Checks if setup is completed in database
 */
export const isSetupCompletedInDatabase = async (): Promise<boolean> => {
  try {
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
  } catch (error) {
    console.error("Error checking setup completion in database:", error);
    return false;
  }
};
