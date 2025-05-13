
import { useState, useEffect } from "react";
import { CompanyInfo } from "./types";
import { toast } from "sonner";
import { useAdminStatus } from "@/hooks/team/useAdminStatus";

export const useCompanyInfo = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const { companyName } = useAdminStatus();

  useEffect(() => {
    // Check if setup is completed
    const isSetupComplete = localStorage.getItem('maintenease_setup_complete') === 'true';
    setSetupCompleted(isSetupComplete);

    // Retrieve company information from local storage
    const setupData = localStorage.getItem('maintenease_setup');
    console.log("Raw setup data:", setupData);
    
    if (setupData) {
      try {
        const parsedData = JSON.parse(setupData);
        console.log("Parsed setup data:", parsedData);
        
        // Check both companyInfo (correct key) and companyinfo (lowercase key)
        let companyInfoData = null;
        if (parsedData && parsedData.companyInfo && Object.keys(parsedData.companyInfo).length > 0) {
          console.log("Company info found in companyInfo:", parsedData.companyInfo);
          companyInfoData = parsedData.companyInfo;
        } else if (parsedData && parsedData.companyinfo && Object.keys(parsedData.companyinfo).length > 0) {
          console.log("Company info found in companyinfo:", parsedData.companyinfo);
          companyInfoData = parsedData.companyinfo;
        }
        
        if (companyInfoData) {
          setCompanyInfo(companyInfoData);
        } else if (companyName) {
          // If no data in localStorage but we have company name from Supabase profile
          console.log("Using company name from Supabase profile:", companyName);
          setCompanyInfo({ 
            companyName: companyName
          });
        } else {
          console.warn("No company info found in parsed data:", parsedData);
          setCompanyInfo(null);
        }
      } catch (error) {
        console.error("Error parsing company information:", error);
        toast.error("There was an error loading company information");
        
        // Still try to use the company name from Supabase profile if available
        if (companyName) {
          setCompanyInfo({ 
            companyName: companyName
          });
        } else {
          setCompanyInfo(null);
        }
      }
    } else {
      // If no setup data in local storage, check if we have company name from Supabase profile
      if (companyName) {
        setCompanyInfo({ 
          companyName: companyName
        });
      } else {
        console.warn("No setup data found in localStorage and no company name in profile");
        setCompanyInfo(null);
      }
    }
    
    setIsLoading(false);
  }, [companyName]);

  return { companyInfo, isLoading, setupCompleted };
};
