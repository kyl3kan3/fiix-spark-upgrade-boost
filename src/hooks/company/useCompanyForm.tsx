
import { useState, useEffect } from "react";
import { useCompanyFormCore } from "./useCompanyFormCore";
import { useCompanyData } from "./useCompanyData";
import { useUserProfile } from "./useUserProfile";
import { useCompanySubmit } from "./useCompanySubmit";
import { useCompanyFormSubmit } from "./useCompanyFormSubmit";
import { logger } from "@/lib/logger";

export const useCompanyForm = (initialData: any, onUpdate: (data: any) => void) => {
 logger.log("=== useCompanyForm initialized ===");
 logger.log("Initial data:", initialData);
 
 const { form, logoPreview, handleLogoChange, setLogoPreview, isInitialized } = useCompanyFormCore(initialData, onUpdate);
 const { companyId: dataCompanyId, isLoading: isDataLoading } = useCompanyData(form, setLogoPreview);
 const { checkAndFixUserProfile } = useUserProfile();
 const { isSubmitting, handleSubmit: submitCompany } = useCompanySubmit(checkAndFixUserProfile);
 
 // Manage company ID state with proper synchronization
 const [companyId, setCompanyId] = useState<string | null>(null);

 // Sync company ID when data loads
 useEffect(() => {
 if (dataCompanyId !== companyId) {
 logger.log("Syncing company ID:", dataCompanyId);
 setCompanyId(dataCompanyId);
 }
 }, [dataCompanyId, companyId]);

 const { handleSubmit } = useCompanyFormSubmit(
 submitCompany, 
 logoPreview, 
 companyId, 
 onUpdate, 
 setCompanyId
 );

 logger.log("=== useCompanyForm state ===");
 logger.log("Company ID:", companyId);
 logger.log("Is submitting:", isSubmitting);
 logger.log("Is data loading:", isDataLoading);
 logger.log("Is initialized:", isInitialized);

 return {
 form,
 logoPreview,
 companyId,
 isSubmitting,
 isLoading: isDataLoading,
 handleLogoChange,
 handleSubmit
 };
};
