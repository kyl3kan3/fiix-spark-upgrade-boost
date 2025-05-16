
/**
 * Type definitions for setup data
 */
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

export const initialSetupData: SetupData = {
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
 * Keys for localStorage
 */
export const SETUP_DATA_KEY = 'maintenease_setup';
export const SETUP_COMPLETE_KEY = 'maintenease_setup_complete';
