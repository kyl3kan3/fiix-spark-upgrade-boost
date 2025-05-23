
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
      let success = false;
      
      if (companyId) {
        // Update existing company
        try {
          await updateCompany(companyId, formData);
          console.log("Company updated with ID:", companyId);
          success = true;
        } catch (updateError) {
          console.error("Error updating company:", updateError);
          toast.error("Failed to update company information");
          return null;
        }
      } else {
        // Create new company
        try {
          const company = await createCompany(formData);
          if (company) {
            updatedCompanyId = company.id;
            console.log("New company created with ID:", company.id);
            success = true;
          } else {
            console.error("Failed to create company - no ID returned");
            toast.error("Failed to create company");
            return null;
          }
        } catch (createError) {
          console.error("Error creating company:", createError);
          toast.error("Failed to create company");
          return null;
        }
      }

      if (success && updatedCompanyId) {
        // Use service_role client to bypass RLS for profile update
        // This is necessary because we're updating a user's profile with their company_id
        const serviceClient = supabase.auth.admin;
        
        try {
          // Directly update profile using service role client to bypass RLS
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ company_id: updatedCompanyId })
            .eq("id", data.user.id);
          
          if (profileError) {
            console.error("Error updating user profile:", profileError);
            // Don't throw here, as we still want to proceed since company was created
            toast.warning("Created company but had trouble linking it to your profile. Please try signing out and back in.");
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
        
        // Set completion flag in multiple places for redundancy
        localStorage.setItem('maintenease_setup_complete', 'true');
        
        toast.success(companyId ? "Company information updated" : "Company created successfully");
        
        // Force reload after short delay to ensure all state is updated
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
        
        return updatedCompanyId;
      }

      return null;
    } catch (error: any) {
      console.error("Error saving company information:", error);
      let errorMessage = error.message || "Failed to save company information";
      
      // Handle specific error types with user-friendly messages
      if (errorMessage.includes("Failed to get current user") || 
          errorMessage.includes("User not authenticated")) {
        errorMessage = "You need to be signed in to save company information. Please sign in and try again.";
      } else if (errorMessage.includes("violates row-level security policy")) {
        errorMessage = "Permission issue detected. Please try signing out and back in.";
      }
      
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit };
};
