
import React from "react";
import { Building2, Loader2 } from "lucide-react";

import CompanyLogoUploader from "./company/CompanyLogoUploader";
import CompanyForm from "./company/CompanyForm";
import { useCompanyFormSimple } from "@/hooks/company/useCompanyFormSimple";

interface CompanyInfoSetupProps {
  data: any;
  onUpdate: (data: any) => void;
}

const CompanyInfoSetup: React.FC<CompanyInfoSetupProps> = ({ data, onUpdate }) => {
  const {
    form,
    logoPreview,
    companyId,
    isSubmitting,
    isLoading,
    handleLogoChange,
    handleSubmit
  } = useCompanyFormSimple(data, onUpdate);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-maintenease-600 dark:text-maintenease-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Company Information</h2>
        </div>
        
        <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-maintenease-600 dark:text-maintenease-400" />
            <p className="text-muted-foreground dark:text-gray-400">Loading company information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-maintenease-600 dark:text-maintenease-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Company Information</h2>
      </div>
      
      <p className="text-muted-foreground dark:text-gray-400">
        Set up your company profile to personalize your MaintenEase experience.
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <CompanyForm 
            form={form}
            isSubmitting={isSubmitting}
            companyId={companyId}
            onSubmit={handleSubmit}
          />
        </div>
        
        <div className="w-full md:w-1/3">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <CompanyLogoUploader 
              initialLogo={logoPreview} 
              onLogoChange={handleLogoChange} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoSetup;
