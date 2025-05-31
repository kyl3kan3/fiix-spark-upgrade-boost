
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
    console.log("=== COMPANY SUBMIT START ===");
    console.log("Values:", values);
    console.log("Company ID:", companyId);
    console.log("Logo Preview:", logoPreview ? "Present" : "None");
    
    // Prepare form data with logo
    const formData = { ...values, logo: logoPreview };
    onUpdate(formData);
    
    setIsSubmitting(true);
    try {
      // Check if user is logged in first
      const { data, error: authError } = await supabase.auth.getUser();
      
      if (authError || !data.user) {
        console.error("Authentication error:", authError || "No user found");
        toast.error("You must be signed in to save company information");
        return null;
      }
      
      console.log("User authenticated:", data.user.id);
      
      let updatedCompanyId = companyId;
      let success = false;
      
      if (companyId) {
        // Update existing company
        console.log("Updating existing company...");
        try {
          const updatedCompany = await updateCompany(companyId, formData);
          console.log("Company updated successfully:", updatedCompany);
          success = true;
          toast.success("Company information updated successfully!");
        } catch (updateError: any) {
          console.error("Error updating company:", updateError);
          toast.error(updateError.message || "Failed to update company information");
          return null;
        }
      } else {
        // Create new company
        console.log("Creating new company...");
        try {
          const company = await createCompany(formData);
          if (company) {
            updatedCompanyId = company.id;
            console.log("New company created with ID:", company.id);
            success = true;
            toast.success("Company created successfully!");
          } else {
            console.error("Failed to create company - no data returned");
            toast.error("Failed to create company");
            return null;
          }
        } catch (createError: any) {
          console.error("Error creating company:", createError);
          toast.error(createError.message || "Failed to create company");
          return null;
        }
      }

      if (success && updatedCompanyId) {
        console.log("Linking profile to company:", updatedCompanyId);
        
        try {
          // Update profile with company_id
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ company_id: updatedCompanyId })
            .eq("id", data.user.id);
          
          if (profileError) {
            console.error("Error updating user profile:", profileError);
            toast.warning("Company saved but had trouble linking it to your profile. Please try signing out and back in.");
          } else {
            console.log("Successfully linked profile to company");
          }
          
          // Also run the provided profile fixer as a backup
          const profileFixed = await checkAndFixUserProfile(updatedCompanyId);
          console.log("Profile fix attempt result:", profileFixed);
        } catch (profileError) {
          console.error("Error in profile update process:", profileError);
          // Continue since company was created/updated
        }
        
        // Set completion flag in localStorage
        localStorage.setItem('maintenease_setup_complete', 'true');
        
        // Force reload after short delay to ensure all state is updated
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
        
        return updatedCompanyId;
      }

      return null;
    } catch (error: any) {
      console.error("=== COMPANY SUBMIT ERROR ===");
      console.error("Unexpected error:", error);
      
      let errorMessage = "Failed to save company information";
      
      // Handle specific error types with user-friendly messages
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
      console.log("=== COMPANY SUBMIT END ===");
    }
  };

  return { isSubmitting, handleSubmit };
};
