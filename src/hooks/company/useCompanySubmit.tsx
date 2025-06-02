
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
  ): Promise<string | null> => {
    console.log("=== COMPANY SUBMIT START ===");
    console.log("Values:", values);
    console.log("Company ID:", companyId);
    console.log("Logo Preview:", logoPreview ? "Present" : "None");
    
    // Validate required fields
    if (!values.name?.trim()) {
      toast.error("Company name is required");
      return null;
    }
    
    // Prepare form data with logo
    const formData = { ...values, logo: logoPreview };
    
    // Update parent component state
    if (typeof onUpdate === 'function') {
      try {
        onUpdate(formData);
      } catch (error) {
        console.error("Error updating parent state:", error);
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Check authentication
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error("Authentication error:", authError || "No user found");
        toast.error("You must be signed in to save company information");
        return null;
      }
      
      console.log("User authenticated:", authData.user.id);
      
      let resultCompanyId = companyId;
      let operationSuccess = false;
      
      if (companyId) {
        // Update existing company
        console.log("Updating existing company with ID:", companyId);
        try {
          const updatedCompany = await updateCompany(companyId, formData);
          console.log("Company updated successfully:", updatedCompany);
          operationSuccess = true;
          toast.success("Company information updated successfully!");
        } catch (updateError: any) {
          console.error("Update error:", updateError);
          toast.error(updateError.message || "Failed to update company information");
          return null;
        }
      } else {
        // Create new company
        console.log("Creating new company...");
        try {
          const company = await createCompany(formData);
          if (company?.id) {
            resultCompanyId = company.id;
            console.log("New company created with ID:", company.id);
            operationSuccess = true;
            toast.success("Company created successfully!");
          } else {
            console.error("Failed to create company - no ID returned");
            toast.error("Failed to create company");
            return null;
          }
        } catch (createError: any) {
          console.error("Create error:", createError);
          toast.error(createError.message || "Failed to create company");
          return null;
        }
      }

      // Handle post-operation tasks
      if (operationSuccess && resultCompanyId) {
        console.log("Linking profile to company:", resultCompanyId);
        
        try {
          // Update user profile with company_id
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ company_id: resultCompanyId })
            .eq("id", authData.user.id);
          
          if (profileError) {
            console.error("Profile update error:", profileError);
            toast.warning("Company saved but had trouble linking it to your profile. Please try signing out and back in.");
          } else {
            console.log("Profile successfully linked to company");
          }
          
          // Run additional profile checks
          try {
            const profileFixed = await checkAndFixUserProfile(resultCompanyId);
            console.log("Profile check result:", profileFixed);
          } catch (profileCheckError) {
            console.error("Profile check error:", profileCheckError);
            // Don't fail the whole operation for this
          }
        } catch (profileError) {
          console.error("Error in profile linking process:", profileError);
          // Continue since the main operation succeeded
        }
        
        // Mark setup as complete
        try {
          localStorage.setItem('maintenease_setup_complete', 'true');
        } catch (storageError) {
          console.error("Error setting setup complete flag:", storageError);
        }
        
        // Redirect after delay
        setTimeout(() => {
          try {
            window.location.href = "/dashboard";
          } catch (redirectError) {
            console.error("Error redirecting:", redirectError);
            // Fallback navigation
            window.location.reload();
          }
        }, 1000);
        
        return resultCompanyId;
      }

      return null;
    } catch (error: any) {
      console.error("=== COMPANY SUBMIT ERROR ===");
      console.error("Unexpected error:", error);
      
      let errorMessage = "Failed to save company information";
      
      if (error?.message) {
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
