
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";

interface LogoUploadButtonProps {
  hasLogo: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LogoUploadButton: React.FC<LogoUploadButtonProps> = ({ 
  hasLogo, 
  onFileSelect 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex justify-center">
      <Button 
        variant="outline" 
        type="button" 
        className="w-full"
        onClick={handleButtonClick}
      >
        {hasLogo ? "Change Logo" : "Upload Logo"}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelect}
      />
    </div>
  );
};
