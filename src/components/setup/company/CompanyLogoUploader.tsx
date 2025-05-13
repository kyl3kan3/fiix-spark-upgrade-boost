
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface CompanyLogoUploaderProps {
  initialLogo?: string | null;
  onLogoChange: (logoData: string | null) => void;
}

const CompanyLogoUploader: React.FC<CompanyLogoUploaderProps> = ({ 
  initialLogo,
  onLogoChange 
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Initialize with existing logo if available
  useEffect(() => {
    if (initialLogo) {
      setLogoPreview(initialLogo);
    }
  }, [initialLogo]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        onLogoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border rounded-md p-4">
      <p className="font-medium mb-2">Company Logo</p>
      <div 
        className="border-2 border-dashed rounded-md flex items-center justify-center flex-col h-40 bg-gray-50 mb-4"
      >
        {logoPreview ? (
          <img 
            src={logoPreview} 
            alt="Company logo preview" 
            className="max-h-36 max-w-full object-contain" 
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Upload className="h-10 w-10 mb-2" />
            <p className="text-sm">Upload company logo</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-center">
        <label className="cursor-pointer">
          <Button variant="outline" type="button" className="w-full">
            {logoPreview ? "Change Logo" : "Upload Logo"}
          </Button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
        </label>
      </div>
    </div>
  );
};

export default CompanyLogoUploader;
