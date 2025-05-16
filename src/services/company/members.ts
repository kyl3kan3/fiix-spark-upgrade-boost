
import { supabase } from "@/integrations/supabase/client";

/**
 * Adds a user to an existing company
 */
export const addUserToCompany = async (userId: string, companyId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ company_id: companyId })
      .eq("id", userId);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error adding user to company:", error);
    return false;
  }
};
