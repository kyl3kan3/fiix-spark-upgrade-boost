
import { useState } from "react";
import { useCompanyFormCore } from "./useCompanyFormCore";
import { useCompanyData } from "./useCompanyData";
import { useUserProfile } from "./useUserProfile";
import { useCompanySubmit } from "./useCompanySubmit";
import { CompanyInfoFormValues } from "@/components/setup/company/companyInfoSchema";
import { useCompanyFormSubmit } from "./useCompanyFormSubmit";

export const useCompanyForm = (initialData: any, onUpdate: (data: any) => void) => {
  const { form, logoPreview, handleLogoChange, setLogoPreview } = useCompanyFormCore(initialData, onUpdate);
  const { companyId } = useCompanyData(form, setLogoPreview);
  const { checkAndFixUserProfile } = useUserProfile();
  const { isSubmitting, handleSubmit: submitCompany } = useCompanySubmit(checkAndFixUserProfile);

  const { handleSubmit } = useCompanyFormSubmit(
    submitCompany, 
    logoPreview, 
    companyId, 
    onUpdate, 
    setCompanyId
  );

  const [companyIdState, setCompanyId] = useState<string | null>(companyId);

  return {
    form,
    logoPreview,
    companyId: companyIdState || companyId, // Use state value if available, otherwise use the one from useCompanyData
    isSubmitting,
    handleLogoChange,
    handleSubmit
  };
};
