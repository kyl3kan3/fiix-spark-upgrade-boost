
import { CompanyInfoFormValues } from "@/components/setup/company/companyInfoSchema";

type SubmitCompanyFunction = (
  values: CompanyInfoFormValues,
  logoPreview: string | null,
  companyId: string | null,
  onUpdate: (data: any) => void
) => Promise<string | null>;

/**
 * A specialized hook that handles the form submission logic for company information
 */
export const useCompanyFormSubmit = (
  submitCompany: SubmitCompanyFunction,
  logoPreview: string | null,
  companyId: string | null,
  onUpdate: (data: any) => void,
  setCompanyId: (id: string | null) => void
) => {
  /**
   * Handles the submission of company information
   * Updates the company ID state if a new company was created
   */
  const handleSubmit = async (values: CompanyInfoFormValues) => {
    const newCompanyId = await submitCompany(values, logoPreview, companyId, onUpdate);
    if (newCompanyId) {
      // This is needed to update the companyId state if a new company was created
      // This is used in the UI to show the correct button text (Create vs Update)
      setCompanyId(newCompanyId);
    }
  };

  return { handleSubmit };
};
