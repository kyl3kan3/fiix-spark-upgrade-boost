
import { useState } from "react";
import { toast } from "sonner";
import { CompanyInfoFormValues } from "@/components/setup/company/companyInfoSchema";
import { createCompany, updateCompany } from "@/services/company";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

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
 logger.log("=== COMPANY SUBMIT START ===");
 logger.log("Values:", values);
 logger.log("Company ID:", companyId);
 logger.log("Logo Preview:", logoPreview ? "Present" : "None");
 
 // Validate required fields
 if (!values.name?.trim()) {
 toast.error("Company name is required");
 return null;
 }
 
 // Prepare form data with logo
 const formData = { ...values, logo: logoPreview };
 const companyInfo = {
 companyName: values.name,
 industry: values.industry,
 address: values.address,
 city: values.city,
 state: values.state,
 zipCode: values.zipCode,
 phone: values.phone,
 email: values.email,
 website: values.website,
 timezone: values.timezone,
 logo: logoPreview,
 };
 
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
 
 logger.log("User authenticated:", authData.user.id);
 
 let resultCompanyId = companyId;
 let operationSuccess = false;
 
 if (companyId) {
 // Update existing company
 logger.log("Updating existing company with ID:", companyId);
 try {
 const updatedCompany = await updateCompany(companyId, companyInfo);
 logger.log("Company updated successfully:", updatedCompany);
 operationSuccess = true;
 toast.success("Company information updated successfully!");
 } catch (updateError: any) {
 console.error("Update error:", updateError);
 toast.error(updateError.message || "Failed to update company information");
 return null;
 }
 } else {
 // Create new company
 logger.log("Creating new company...");
 try {
 const company = await createCompany(companyInfo);
 if (company?.id) {
 resultCompanyId = company.id;
 logger.log("New company created with ID:", company.id);
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
 try {
 const profileFixed = await checkAndFixUserProfile(resultCompanyId);
 logger.log("Profile check result:", profileFixed);
 if (!profileFixed) {
 toast.warning("Company saved, but the profile association could not be verified. Please refresh and try again.");
 }
 } catch (profileCheckError) {
 console.error("Profile check error:", profileCheckError);
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
 logger.log("=== COMPANY SUBMIT END ===");
 }
 };

 return { isSubmitting, handleSubmit };
};
