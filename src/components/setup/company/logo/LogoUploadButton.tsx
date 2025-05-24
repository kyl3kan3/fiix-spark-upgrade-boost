
import React from "react";
import { Button } from "@/components/ui/button";

interface LogoUploadButtonProps {
  hasLogo: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LogoUploadButton: React.FC<LogoUploadButtonProps> = ({ 
  hasLogo, 
  onFileSelect 
}) => {
  return (
    <div className="flex justify-center">
      <label className="cursor-pointer">
        <Button variant="outline" type="button" className="w-full">
          {hasLogo ? "Change Logo" : "Upload Logo"}
        </Button>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileSelect}
        />
      </label>
    </div>
  );
};
