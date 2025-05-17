
import React from "react";
import { LogoPreview } from "./logo/LogoPreview";
import { LogoUploadButton } from "./logo/LogoUploadButton";
import { useCompanyLogo } from "@/hooks/company/useCompanyLogo";

interface CompanyLogoUploaderProps {
  initialLogo?: string | null;
  onLogoChange: (logoData: string | null) => void;
}

const CompanyLogoUploader: React.FC<CompanyLogoUploaderProps> = ({ 
  initialLogo,
  onLogoChange 
}) => {
  const { logoPreview, handleLogoChange } = useCompanyLogo(initialLogo);
  
  // Pass logo data to parent when it changes
  React.useEffect(() => {
    onLogoChange(logoPreview);
  }, [logoPreview, onLogoChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleLogoChange(e);
  };

  return (
    <div className="border rounded-md p-4">
      <p className="font-medium mb-2">Company Logo</p>
      <div 
        className="border-2 border-dashed rounded-md flex items-center justify-center flex-col h-40 bg-gray-50 mb-4"
      >
        <LogoPreview logoUrl={logoPreview} />
      </div>
      
      <LogoUploadButton 
        hasLogo={!!logoPreview} 
        onFileSelect={handleFileSelect} 
      />
    </div>
  );
};

export default CompanyLogoUploader;
