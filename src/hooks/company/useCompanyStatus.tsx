import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/team/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { isSetupCompleted } from "@/services/setup";

export const useCompanyStatus = () => {
  const { profileData, isLoading: profileLoading, error: profileError } = useUserProfile(['role', 'company_id']);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [forceRefresh, setForceRefresh] = useState(0);

  // Effect to check for user profile changes
  useEffect(() => {
    const checkCompanyProfileLink = async () => {
      if (profileData?.company_id) {
        console.log("Profile data has company_id:", profileData.company_id);
        setSetupComplete(true);
        setCompanyId(profileData.company_id);
        localStorage.setItem('maintenease_setup_complete', 'true');
        setIsLoading(false);
        return;
      }
      
      // Only check setup status if we don't have a company_id
      const checkSetupStatus = async () => {
        try {
          // First check localStorage for immediate result
          const localSetupComplete = localStorage.getItem('maintenease_setup_complete') === 'true';
          
          // If localStorage indicates complete, use that result immediately
          if (localSetupComplete) {
            console.log("Setup marked as complete in localStorage");
            setSetupComplete(true);
            setIsLoading(false);
            return;
          }
          
          // Otherwise check database (this will also update localStorage if needed)
          const isComplete = await isSetupCompleted();
          setSetupComplete(isComplete);
          console.log("Setup completed status from check:", isComplete);
        } catch (error) {
          console.error("Error checking setup completion:", error);
          setSetupComplete(false);
        } finally {
          setIsLoading(false);
        }
      };

      checkSetupStatus();
    };

    checkCompanyProfileLink();
  }, [profileData, forceRefresh]);

  // Function to directly check the user's profile in the database
  const checkUserCompanyInDatabase = async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }
      
      // Check for company association
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Error fetching user profile:", fetchError);
        return null;
      }
        
      if (profile?.company_id) {
        // If company_id exists, mark setup as complete
        localStorage.setItem('maintenease_setup_complete', 'true');
        setCompanyId(profile.company_id);
        return profile.company_id;
      }
      
      return null;
    } catch (error) {
      console.error("Error checking user profile directly:", error);
      return null;
    }
  };

  const refreshCompanyStatus = () => {
    setForceRefresh(prev => prev + 1);
  };

  const handleCompanyFound = (newCompanyId: string) => {
    setCompanyId(newCompanyId);
    setSetupComplete(true);
    refreshCompanyStatus();
  };

  return {
    isLoading: isLoading || profileLoading,
    profileError,
    setupComplete,
    companyId: companyId || profileData?.company_id,
    refreshCompanyStatus,
    handleCompanyFound,
    checkUserCompanyInDatabase
  };
};
