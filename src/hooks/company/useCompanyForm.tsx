
import { useState, useEffect } from "react";
import { useCompanyFormCore } from "./useCompanyFormCore";
import { useCompanyData } from "./useCompanyData";
import { useUserProfile } from "./useUserProfile";
import { useCompanySubmit } from "./useCompanySubmit";
import { CompanyInfoFormValues } from "@/components/setup/company/companyInfoSchema";
import { useCompanyFormSubmit } from "./useCompanyFormSubmit";

export const useCompanyForm = (initialData: any, onUpdate: (data: any) => void) => {
  const { form, logoPreview, handleLogoChange, setLogoPreview } = useCompanyFormCore(initialData, onUpdate);
  const { companyId: dataCompanyId } = useCompanyData(form, setLogoPreview);
  const { checkAndFixUserProfile } = useUserProfile();
  const { isSubmitting, handleSubmit: submitCompany } = useCompanySubmit(checkAndFixUserProfile);
  
  // Use a single state for company ID that syncs with the data
  const [companyId, setCompanyId] = useState<string | null>(dataCompanyId);

  // Sync the company ID state when the data changes
  useEffect(() => {
    if (dataCompanyId !== companyId) {
      setCompanyId(dataCompanyId);
    }
  }, [dataCompanyId]);

  const { handleSubmit } = useCompanyFormSubmit(
    submitCompany, 
    logoPreview, 
    companyId, 
    onUpdate, 
    setCompanyId
  );

  return {
    form,
    logoPreview,
    companyId,
    isSubmitting,
    handleLogoChange,
    handleSubmit
  };
};
