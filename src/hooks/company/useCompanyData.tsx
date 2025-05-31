
import { useState, useEffect, useCallback } from "react";
import { fetchUserCompany, mapCompanyToCompanyInfo } from "@/services/company";

export const useCompanyData = (form: any, setLogoPreview: (logo: string | null) => void) => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedEditData, setHasLoadedEditData] = useState(false);

  // Load stored edit data from session storage (only once)
  const loadStoredEditData = useCallback(() => {
    if (hasLoadedEditData) return null;
    
    const editData = sessionStorage.getItem('edit_company_info');
    if (editData) {
      try {
        const parsedEditData = JSON.parse(editData);
        console.log("Loading stored edit data:", parsedEditData);
        
        if (parsedEditData && Object.keys(parsedEditData).length > 0) {
          setHasLoadedEditData(true);
          sessionStorage.removeItem('edit_company_info');
          return parsedEditData;
        }
      } catch (e) {
        console.error("Error parsing edit company data:", e);
        sessionStorage.removeItem('edit_company_info');
      }
    }
    return null;
  }, [hasLoadedEditData]);

  // Load existing company data from database
  const loadCompanyData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Loading company data from database...");
      
      const company = await fetchUserCompany();
      if (company) {
        console.log("Found existing company:", company);
        setCompanyId(company.id);
        
        const companyInfo = mapCompanyToCompanyInfo(company);
        form.reset(companyInfo);
        
        if (company.logo) {
          setLogoPreview(company.logo);
        }
        
        return companyInfo;
      } else {
        console.log("No existing company found");
      }
    } catch (error) {
      console.error("Error loading company data:", error);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [form, setLogoPreview]);

  useEffect(() => {
    const initializeData = async () => {
      // First check for edit data
      const editData = loadStoredEditData();
      if (editData) {
        console.log("Using edit data, skipping database load");
        form.reset(editData);
        if (editData.logo) {
          setLogoPreview(editData.logo);
        }
        setIsLoading(false);
        return;
      }
      
      // If no edit data, load from database
      await loadCompanyData();
    };
    
    initializeData();
  }, [loadStoredEditData, loadCompanyData, form, setLogoPreview]);

  return { companyId, isLoading };
};
