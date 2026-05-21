/**
 * Type definitions for setup data
 */
export type SetupSectionData = Record<string, unknown>;

export interface SetupData {
 companyInfo: SetupSectionData;
 userRoles: SetupSectionData;
 assetCategories: SetupSectionData;
 locations: SetupSectionData;
 maintenanceSchedules: SetupSectionData;
 notifications: SetupSectionData;
 integrations: SetupSectionData;
 dashboardCustomization: SetupSectionData;
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
