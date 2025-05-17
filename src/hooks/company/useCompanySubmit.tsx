
import { useState } from "react";
import { toast } from "sonner";
import { CompanyInfoFormValues } from "@/components/setup/company/companyInfoSchema";
import { createCompany, updateCompany } from "@/services/company";

export const useCompanySubmit = (
  checkAndFixUserProfile: (companyId: string) => Promise<boolean>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    values: CompanyInfoFormValues, 
    logoPreview: string | null, 
    companyId: string | null,
    onUpdate: (data: any) => void
  ) => {
    const formData = { ...values, logo: logoPreview };
    onUpdate(formData);
    
    setIsSubmitting(true);
    try {
      let updatedCompanyId = companyId;
      
      if (companyId) {
        // Update existing company
        await updateCompany(companyId, formData);
        
        // Ensure user profile is linked to company
        await checkAndFixUserProfile(companyId);
        
        toast.success("Company information updated");
      } else {
        // Create new company
        const company = await createCompany(formData);
        if (company) {
          updatedCompanyId = company.id;
          
          // Make sure user profile is updated with the company ID
          await checkAndFixUserProfile(company.id);
          
          // Set completion flag
          localStorage.setItem('maintenease_setup_complete', 'true');
          
          toast.success("Company created successfully");
        }
      }

      return updatedCompanyId;
    } catch (error: any) {
      console.error("Error saving company information:", error);
      toast.error(error.message || "Failed to save company information");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit };
};
