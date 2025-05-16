
import { useState, useEffect } from "react";
import { CompanyInfo } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchUserCompany, updateCompany, createCompany, mapCompanyToCompanyInfo } from "@/services/companyService";

export const useCompanyInfo = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
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

      // Fetch company from Supabase
      const company = await fetchUserCompany();
      
      if (company) {
        console.log("Retrieved company from Supabase:", company);
        setCompanyId(company.id);
        setCompanyInfo(mapCompanyToCompanyInfo(company));
        return;
      }
      
      // Fallback to localStorage if not found in Supabase
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
          console.error("Error parsing localStorage company info:", error);
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
      
      // Then update in Supabase database
      if (companyId) {
        // Update existing company
        await updateCompany(companyId, data);
      } else {
        // Create new company
        const company = await createCompany(data);
        if (company) {
          setCompanyId(company.id);
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
    companyId,
    isLoading, 
    error,
    setupCompleted,
    updateCompanyInfo,
    fetchCompanyInfo
  };
};
