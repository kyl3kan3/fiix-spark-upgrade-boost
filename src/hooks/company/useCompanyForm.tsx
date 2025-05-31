
import { useState, useEffect } from "react";
import { useCompanyFormCore } from "./useCompanyFormCore";
import { useCompanyData } from "./useCompanyData";
import { useUserProfile } from "./useUserProfile";
import { useCompanySubmit } from "./useCompanySubmit";
import { useCompanyFormSubmit } from "./useCompanyFormSubmit";

export const useCompanyForm = (initialData: any, onUpdate: (data: any) => void) => {
  console.log("=== useCompanyForm initialized ===");
  console.log("Initial data:", initialData);
  
  const { form, logoPreview, handleLogoChange, setLogoPreview, isInitialized } = useCompanyFormCore(initialData, onUpdate);
  const { companyId: dataCompanyId, isLoading: isDataLoading } = useCompanyData(form, setLogoPreview);
  const { checkAndFixUserProfile } = useUserProfile();
  const { isSubmitting, handleSubmit: submitCompany } = useCompanySubmit(checkAndFixUserProfile);
  
  // Manage company ID state with proper synchronization
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Sync company ID when data loads
  useEffect(() => {
    if (dataCompanyId !== companyId) {
      console.log("Syncing company ID:", dataCompanyId);
      setCompanyId(dataCompanyId);
    }
  }, [dataCompanyId, companyId]);

  const { handleSubmit } = useCompanyFormSubmit(
    submitCompany, 
    logoPreview, 
    companyId, 
    onUpdate, 
    setCompanyId
  );

  console.log("=== useCompanyForm state ===");
  console.log("Company ID:", companyId);
  console.log("Is submitting:", isSubmitting);
  console.log("Is data loading:", isDataLoading);
  console.log("Is initialized:", isInitialized);

  return {
    form,
    logoPreview,
    companyId,
    isSubmitting,
    isLoading: isDataLoading,
    handleLogoChange,
    handleSubmit
  };
};
