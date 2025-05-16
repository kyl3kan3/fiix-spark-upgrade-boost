
import { SetupData, initialSetupData, SETUP_DATA_KEY, SETUP_COMPLETE_KEY } from './setupTypes';

/**
 * Gets the local setup data from localStorage
 */
export const getLocalSetupData = (): SetupData => {
  try {
    const savedData = localStorage.getItem(SETUP_DATA_KEY);
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
 * Saves setup data to localStorage
 */
export const saveLocalSetupData = (setupData: SetupData, isComplete: boolean = false): void => {
  localStorage.setItem(SETUP_DATA_KEY, JSON.stringify(setupData));
  
  if (isComplete) {
    localStorage.setItem(SETUP_COMPLETE_KEY, 'true');
  }
};

/**
 * Clears setup data from localStorage
 */
export const clearLocalSetupData = (): void => {
  localStorage.removeItem(SETUP_DATA_KEY);
  localStorage.removeItem(SETUP_COMPLETE_KEY);
};

/**
 * Checks if setup is completed in localStorage
 */
export const isSetupCompletedLocally = (): boolean => {
  return localStorage.getItem(SETUP_COMPLETE_KEY) === 'true';
};
