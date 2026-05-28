
import { supabase } from "@/integrations/supabase/client";
import { tryGetUserCompany } from "@/services/supabaseHelpers";
import { CompanyData } from "./types";

/**
 * Fetches company information for the currently logged in user
 */
export const fetchUserCompany = async (): Promise<CompanyData | null> => {
 try {
 const { userId, companyId } = await tryGetUserCompany();

 if (!userId) {
 throw new Error("User not authenticated");
 }

 if (!companyId) {
 return null; // User has no associated company
 }

 // Fetch company details
 const { data: company, error: companyError } = await supabase
 .from("companies")
 .select("*")
 .eq("id", companyId)
 .single();
 
 if (companyError) {
 console.error("Error fetching company:", companyError);
 throw companyError;
 }
 
 return company;
 } catch (error) {
 console.error("Error in fetchUserCompany:", error);
 throw error;
 }
};
