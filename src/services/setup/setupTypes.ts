import type { Json } from "@/integrations/supabase/types";

/**
 * Type definitions for setup data
 */
export interface SetupData {
  companyInfo: Record<string, Json | undefined>;
  userRoles: Record<string, Json | undefined>;
  assetCategories: Record<string, Json | undefined>;
  locations: Record<string, Json | undefined>;
  maintenanceSchedules: Record<string, Json | undefined>;
  notifications: Record<string, Json | undefined>;
  integrations: Record<string, Json | undefined>;
  dashboardCustomization: Record<string, Json | undefined>;
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
