
import { useState, useEffect } from "react";
import { CompanyInfo } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCompanyInfo = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if setup is completed
      const isSetupComplete = localStorage.getItem('maintenease_setup_complete') === 'true';
      setSetupCompleted(isSetupComplete);

      // First try to get company info from Supabase profile
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('company_name')
          .eq('id', user.id)
          .single();
          
        if (!profileError && profileData && profileData.company_name) {
          console.log("Retrieved company name from Supabase profile:", profileData.company_name);
          
          // Check if we have more detailed company info in localStorage
          const setupData = localStorage.getItem('maintenease_setup');
          if (setupData) {
            try {
              const parsedData = JSON.parse(setupData);
              let companyInfoData = null;
              
              if (parsedData && parsedData.companyInfo && Object.keys(parsedData.companyInfo).length > 0) {
                companyInfoData = parsedData.companyInfo;
              } else if (parsedData && parsedData.companyinfo && Object.keys(parsedData.companyinfo).length > 0) {
                companyInfoData = parsedData.companyinfo;
              }
              
              if (companyInfoData) {
                // Combine data from localStorage with profile
                setCompanyInfo({
                  ...companyInfoData,
                  companyName: companyInfoData.companyName || profileData.company_name
                });
                return;
              }
            } catch (error) {
              console.error("Error parsing localStorage company info:", error);
            }
          }
          
          // If we only have company name from profile, use that
          setCompanyInfo({ 
            companyName: profileData.company_name 
          });
          return;
        }
      }
      
      // Fallback to localStorage if no data in Supabase
      const setupData = localStorage.getItem('maintenease_setup');
      
      if (setupData) {
        try {
          const parsedData = JSON.parse(setupData);
          let companyInfoData = null;
          
          if (parsedData && parsedData.companyInfo && Object.keys(parsedData.companyInfo).length > 0) {
            companyInfoData = parsedData.companyInfo;
          } else if (parsedData && parsedData.companyinfo && Object.keys(parsedData.companyinfo).length > 0) {
            companyInfoData = parsedData.companyinfo;
          }
          
          if (companyInfoData) {
            setCompanyInfo(companyInfoData);
            return;
          }
        } catch (error) {
          console.error("Error parsing company information:", error);
          setError("There was an error loading company information");
        }
      }
      
      // No company info found
      setCompanyInfo(null);
      
    } catch (error) {
      console.error("Error fetching company info:", error);
      setError("Failed to load company information");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompanyInfo = async (data: CompanyInfo): Promise<boolean> => {
    try {
      // First, update in localStorage for backward compatibility
      const setupData = localStorage.getItem('maintenease_setup') || '{}';
      let parsedData;
      
      try {
        parsedData = JSON.parse(setupData);
      } catch (e) {
        parsedData = {};
      }
      
      // Update the companyInfo field
      parsedData.companyInfo = data;
      localStorage.setItem('maintenease_setup', JSON.stringify(parsedData));
      
      // Then update company name in Supabase profile
      if (data.companyName) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ company_name: data.companyName })
            .eq('id', user.id);
            
          if (updateError) {
            console.error("Error updating company name in profile:", updateError);
            toast("Company name saved locally but couldn't be updated in your profile");
            // Don't return false, we still saved to localStorage
          }
        }
      }
      
      // Update local state
      setCompanyInfo(data);
      toast.success("Company information saved");
      return true;
    } catch (error) {
      console.error("Error saving company information:", error);
      toast.error("Failed to save company information");
      return false;
    }
  };

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  return { 
    companyInfo, 
    isLoading, 
    error,
    setupCompleted,
    updateCompanyInfo,
    fetchCompanyInfo
  };
};
