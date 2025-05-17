
import { useState } from "react";
import { useCompanyFormCore } from "./useCompanyFormCore";
import { useCompanyData } from "./useCompanyData";
import { useUserProfile } from "./useUserProfile";
import { useCompanySubmit } from "./useCompanySubmit";
import { CompanyInfoFormValues } from "@/components/setup/company/companyInfoSchema";

export const useCompanyForm = (initialData: any, onUpdate: (data: any) => void) => {
  const { form, logoPreview, handleLogoChange, setLogoPreview } = useCompanyFormCore(initialData, onUpdate);
  const { companyId } = useCompanyData(form, setLogoPreview);
  const { checkAndFixUserProfile } = useUserProfile();
  const { isSubmitting, handleSubmit: submitCompany } = useCompanySubmit(checkAndFixUserProfile);

  const handleSubmit = async (values: CompanyInfoFormValues) => {
    const newCompanyId = await submitCompany(values, logoPreview, companyId, onUpdate);
    if (newCompanyId) {
      // This is needed to update the companyId state if a new company was created
      // This is used in the UI to show the correct button text (Create vs Update)
      setCompanyId(newCompanyId);
    }
  };

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
