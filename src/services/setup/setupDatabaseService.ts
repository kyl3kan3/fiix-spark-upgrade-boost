import { supabase } from "@/integrations/supabase/client";
import { SetupData, SetupSectionData } from './setupTypes';
import { logger } from "@/lib/logger";
import { normalizeError } from "@/lib/errors";
import { Json } from "@/integrations/supabase/types";

type SetupResponse = {
 data: SetupData | null;
 isComplete: boolean;
 error: Error | null;
};

type SetupMutationResponse = {
 success: boolean;
 error: Error | null;
};

const asSectionData = (value: Json | null): SetupSectionData => {
 if (value && typeof value === "object" && !Array.isArray(value)) {
  return value as SetupSectionData;
 }

 return {};
};

/**
 * Loads setup data from Supabase database
 */
export const loadFromDatabase = async (): Promise<SetupResponse> => {
 try {
 const { data, error } = await supabase
 .from('system_settings')
 .select('*')
 .order('created_at', { ascending: false })
 .limit(1)
 .maybeSingle();

 if (error) {
 console.error("Error loading setup data from database:", error);
 return { data: null, isComplete: false, error: new Error(error.message) };
 }

 if (!data) {
 return { data: null, isComplete: false, error: null };
 }

 const setupData: SetupData = {
 companyInfo: asSectionData(data.company_info),
 userRoles: asSectionData(data.user_roles),
 assetCategories: asSectionData(data.asset_categories),
 locations: asSectionData(data.locations),
 maintenanceSchedules: asSectionData(data.maintenance_schedules),
 notifications: asSectionData(data.notifications),
 integrations: asSectionData(data.integrations),
 dashboardCustomization: asSectionData(data.dashboard_customization)
 };

 return { data: setupData, isComplete: !!data.setup_completed, error: null };
 } catch (error: unknown) {
 const normalized = normalizeError(error, "Failed to load setup data from database");
 console.error("Error in loadFromDatabase:", normalized.cause);
 return { data: null, isComplete: false, error: new Error(normalized.message) };
 }
};

/**
 * Saves setup data to Supabase database
 */
export const saveToDatabase = async (
 setupData: SetupData,
 isComplete: boolean = false
): Promise<SetupMutationResponse> => {
 try {
 const { data: existingData, error: checkError } = await supabase
 .from('system_settings')
 .select('id')
 .limit(1)
 .maybeSingle();

 if (checkError) {
 console.error("Error checking existing settings:", checkError);
 return { success: false, error: new Error(checkError.message) };
 }

 const dbData = {
 company_info: setupData.companyInfo,
 user_roles: setupData.userRoles,
 asset_categories: setupData.assetCategories,
 locations: setupData.locations,
 maintenance_schedules: setupData.maintenanceSchedules,
 notifications: setupData.notifications,
 integrations: setupData.integrations,
 dashboard_customization: setupData.dashboardCustomization,
 setup_completed: isComplete
 };

 const result = existingData?.id
 ? await supabase.from('system_settings').update(dbData).eq('id', existingData.id)
 : await supabase.from('system_settings').insert(dbData);

 if (result.error) {
 console.error("Error saving setup data to database:", result.error);
 return { success: false, error: new Error(result.error.message) };
 }

 return { success: true, error: null };
 } catch (error: unknown) {
 const normalized = normalizeError(error, "Failed to save setup data to database");
 console.error("Error in saveToDatabase:", normalized.cause);
 return { success: false, error: new Error(normalized.message) };
 }
};

/**
 * Resets setup data in database
 */
export const resetDatabaseSetupData = async (): Promise<SetupMutationResponse> => {
 try {
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
 return { success: false, error: new Error(error.message) };
 }

 logger.log("Reset setup data in database");
 return { success: true, error: null };
 } catch (error: unknown) {
 const normalized = normalizeError(error, "Failed to reset setup data");
 console.error("Error in resetDatabaseSetupData:", normalized.cause);
 return { success: false, error: new Error(normalized.message) };
 }
};

export const isUserAuthenticated = async (): Promise<boolean> => {
 try {
 const { data: { session } } = await supabase.auth.getSession();
 return !!session?.user;
 } catch {
 return false;
 }
};

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
 } catch (error: unknown) {
 const normalized = normalizeError(error, "Failed to check setup completion");
 console.error("Error checking setup completion in database:", normalized.cause);
 return false;
 }
};
