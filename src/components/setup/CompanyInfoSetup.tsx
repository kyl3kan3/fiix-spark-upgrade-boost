
import React from "react";
import { Building2 } from "lucide-react";

import CompanyLogoUploader from "./company/CompanyLogoUploader";
import CompanyForm from "./company/CompanyForm";
import { useCompanyForm } from "@/hooks/company/useCompanyForm";

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
    handleLogoChange,
    handleSubmit
  } = useCompanyForm(data, onUpdate);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-maintenease-600" />
        <h2 className="text-xl font-semibold">Company Information</h2>
      </div>
      
      <p className="text-muted-foreground">
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
          <CompanyLogoUploader 
            initialLogo={logoPreview} 
            onLogoChange={handleLogoChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoSetup;
