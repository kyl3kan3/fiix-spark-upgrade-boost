
import { useState, useEffect } from "react";
import { CompanyInfo } from "./types";
import { toast } from "sonner";

export const useCompanyInfo = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupCompleted, setSetupCompleted] = useState(false);

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
        } else {
          console.warn("No company info found in parsed data:", parsedData);
          setCompanyInfo(null);
        }
      } catch (error) {
        console.error("Error parsing company information:", error);
        toast.error("There was an error loading company information");
        setCompanyInfo(null);
      }
    } else {
      console.warn("No setup data found in localStorage");
      setCompanyInfo(null);
    }
    
    setIsLoading(false);
  }, []);

  return { companyInfo, isLoading, setupCompleted };
};
