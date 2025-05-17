
import { useState } from "react";
import { toast } from "sonner";
import { CompanyInfoFormValues } from "@/components/setup/company/companyInfoSchema";
import { createCompany, updateCompany } from "@/services/company";
import { supabase } from "@/integrations/supabase/client";

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
      // Check if user is logged in first
      const { data, error: authError } = await supabase.auth.getUser();
      
      if (authError || !data.user) {
        console.error("Authentication error:", authError || "No user found");
        toast.error("You must be signed in to save company information");
        setIsSubmitting(false);
        return null;
      }
      
      let updatedCompanyId = companyId;
      
      if (companyId) {
        // Update existing company
        await updateCompany(companyId, formData);
        console.log("Company updated with ID:", companyId);
        
        // Ensure user profile is linked to company
        await checkAndFixUserProfile(companyId);
        
        toast.success("Company information updated");
      } else {
        // Create new company
        const company = await createCompany(formData);
        if (company) {
          updatedCompanyId = company.id;
          console.log("New company created with ID:", company.id);
          
          // Make sure user profile is updated with the company ID
          await checkAndFixUserProfile(company.id);
          
          // Set completion flag
          localStorage.setItem('maintenease_setup_complete', 'true');
          
          toast.success("Company created successfully");
        }
      }

      // Extra confirmation that setup is complete
      if (updatedCompanyId) {
        localStorage.setItem('maintenease_setup_complete', 'true');
        console.log("Setup marked as complete with company ID:", updatedCompanyId);
      }

      return updatedCompanyId;
    } catch (error: any) {
      console.error("Error saving company information:", error);
      let errorMessage = error.message || "Failed to save company information";
      
      // Handle specific error types with user-friendly messages
      if (errorMessage.includes("Failed to get current user") || 
          errorMessage.includes("User not authenticated")) {
        errorMessage = "You need to be signed in to save company information. Please sign in and try again.";
      }
      
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit };
};
