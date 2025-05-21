
import { useState, useEffect } from "react";
import { fetchUserCompany, mapCompanyToCompanyInfo } from "@/services/company";

export const useCompanyData = (form: any, setLogoPreview: (logo: string | null) => void) => {
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Check if we have company data from profile edit
  useEffect(() => {
    const loadStoredEditData = () => {
      const editData = sessionStorage.getItem('edit_company_info');
      if (editData) {
        try {
          const parsedEditData = JSON.parse(editData);
          // Use this data to initialize form if available
          if (parsedEditData && Object.keys(parsedEditData).length > 0) {
            form.reset(parsedEditData);
            
            if (parsedEditData.logo) {
              setLogoPreview(parsedEditData.logo);
            }
          }
          // Clear session storage after use
          sessionStorage.removeItem('edit_company_info');
        } catch (e) {
          console.error("Error parsing edit company data:", e);
        }
      }
    };

    loadStoredEditData();
  }, [form, setLogoPreview]);
  
  // Load existing company data
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const company = await fetchUserCompany();
        if (company) {
          setCompanyId(company.id);
          const companyInfo = mapCompanyToCompanyInfo(company);
          form.reset(companyInfo);
          if (company.logo) {
            setLogoPreview(company.logo);
          }
        }
      } catch (error) {
        console.error("Error loading company data:", error);
      }
    };
    
    loadCompanyData();
  }, [form, setLogoPreview]);

  return { companyId };
};
