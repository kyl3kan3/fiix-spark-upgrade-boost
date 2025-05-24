
import React from "react";
import { Upload } from "lucide-react";

interface LogoPreviewProps {
  logoUrl: string | null;
}

export const LogoPreview: React.FC<LogoPreviewProps> = ({ logoUrl }) => {
  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt="Company logo preview" 
        className="max-h-36 max-w-full object-contain" 
      />
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center text-gray-500">
      <Upload className="h-10 w-10 mb-2" />
      <p className="text-sm">Upload company logo</p>
    </div>
  );
};
