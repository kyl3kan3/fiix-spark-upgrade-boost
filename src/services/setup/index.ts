
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SetupData, initialSetupData } from './setupTypes';
import { getLocalSetupData, saveLocalSetupData, clearLocalSetupData, isSetupCompletedLocally } from './setupLocalStorage';
import { 
  loadFromDatabase, 
  saveToDatabase, 
  resetDatabaseSetupData, 
  isUserAuthenticated,
  isSetupCompletedInDatabase
} from './setupDatabaseService';

/**
 * Loads setup data from Supabase, falls back to localStorage if not available
 */
export const loadSetupData = async (): Promise<SetupData> => {
  try {
    // First check if user is authenticated
    const isAuthenticated = await isUserAuthenticated();
    
    if (isAuthenticated) {
      // Fetch from database if authenticated
      const { data, error } = await loadFromDatabase();

      if (error) {
        console.error("Error loading setup data from database:", error);
        return getLocalSetupData();
      }

      if (data) {
        console.log("Loaded setup data from database");
        
        // Sync to localStorage for offline use
        saveLocalSetupData(data, false);
        
        return data;
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
    saveLocalSetupData(setupData, isComplete);
    
    // Check if user is authenticated
    const isAuthenticated = await isUserAuthenticated();
    
    if (!isAuthenticated) {
      console.log("User not authenticated, saving to localStorage only");
      return true;
    }

    // Save to database
    const { success, error } = await saveToDatabase(setupData, isComplete);
    
    if (!success) {
      console.error("Error saving setup data to database:", error);
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
 * Checks if setup is completed
 */
export const isSetupCompleted = async (): Promise<boolean> => {
  try {
    // First check localStorage for quick access
    if (isSetupCompletedLocally()) {
      return true;
    }
    
    // Then check database if user is authenticated
    const isAuthenticated = await isUserAuthenticated();
    
    if (isAuthenticated) {
      return await isSetupCompletedInDatabase();
    }
    
    return false;
  } catch (error) {
    console.error("Error checking setup completion:", error);
    return false;
  }
};

/**
 * Resets all setup data
 */
export const resetSetupData = async (): Promise<boolean> => {
  try {
    // Clear localStorage data
    clearLocalSetupData();
    
    // Check if user is authenticated
    const isAuthenticated = await isUserAuthenticated();
    
    if (!isAuthenticated) {
      console.log("User not authenticated, cleared localStorage only");
      return true;
    }
    
    // Clear database data
    const { success, error } = await resetDatabaseSetupData();
    
    if (!success) {
      console.error("Error resetting setup data in database:", error);
      return false;
    }
    
    console.log("Reset setup data in database");
    return true;
  } catch (error) {
    console.error("Error in resetSetupData:", error);
    return false;
  }
};

// Re-export types
export type { SetupData };
export { initialSetupData };
