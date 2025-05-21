
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  checkUserProfile, 
  findOrCreateCompany, 
  createUserProfile, 
  getUserProfileWithCompany 
} from "../utils/companyProfileUtils";
import { showCompanyAssociationNotification } from "@/hooks/company/utils/companyStatusNotifications";

export function useCompanyChecker(onCompanyFound: (companyId: string) => void) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkUserCompanyInDatabase = async () => {
    try {
      setIsRefreshing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsRefreshing(false);
        return null;
      }
      
      // Check if profile exists first
      const { profileExists } = await checkUserProfile(user.id);
      
      // If profile doesn't exist, create it with basic info
      if (!profileExists) {
        console.log("Profile doesn't exist, creating one");
        
        // Get email from user object
        const email = user.email || '';
        
        // Find or create a company
        const { companyId, error } = await findOrCreateCompany(user.id);
        
        if (error || !companyId) {
          setIsRefreshing(false);
          return null;
        }
        
        // Create profile with the company ID
        const { success } = await createUserProfile(user.id, email, companyId);
        
        if (!success) {
          setIsRefreshing(false);
          return null;
        }
        
        // Mark setup as complete
        localStorage.setItem('maintenease_setup_complete', 'true');
        onCompanyFound(companyId);
        setIsRefreshing(false);
        return companyId;
      }
      
      // Now check for company association
      const { profile } = await getUserProfileWithCompany(user.id);
      
      console.log("Direct database check for profile:", profile);
      
      if (profile?.company_id) {
        // If company_id exists, mark setup as complete
        localStorage.setItem('maintenease_setup_complete', 'true');
        onCompanyFound(profile.company_id);
        setIsRefreshing(false);
        return profile.company_id;
      }
      
      setIsRefreshing(false);
      return null;
    } catch (error) {
      console.error("Error checking user profile directly:", error);
      setIsRefreshing(false);
      return null;
    }
  };

  const handleRefreshCompanyAssociation = async () => {
    try {
      setIsRefreshing(true);
      
      // Check the database directly
      const companyId = await checkUserCompanyInDatabase();
      
      // Use the extracted notification function
      showCompanyAssociationNotification(!!companyId);
      
      if (companyId) {
        onCompanyFound(companyId);
      }
      
      setIsRefreshing(false);
    } catch (error) {
      console.error("Error checking company association:", error);
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing,
    handleRefreshCompanyAssociation
  };
}
