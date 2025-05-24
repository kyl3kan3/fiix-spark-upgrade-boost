
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, Image } from "lucide-react";

interface AvatarSectionProps {
  currentAvatarUrl: string | null;
  preview: string | null;
  isUploading: boolean;
  onFileSelect: (file: File | null) => void;
  "aria-label"?: string;
}

export const AvatarSection: React.FC<AvatarSectionProps> = ({
  currentAvatarUrl,
  preview,
  isUploading,
  onFileSelect,
  "aria-label": ariaLabel,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const displayUrl = preview || currentAvatarUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-muted flex items-center justify-center overflow-hidden shadow cursor-pointer"
        onClick={handleClick}
        role="button"
        aria-label={ariaLabel || "Change profile picture"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
      >
        {displayUrl ? (
          <img src={displayUrl} alt="User avatar" className="w-24 h-24 object-cover" />
        ) : (
          <Image className="w-12 h-12 text-gray-400" />
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center">
            <svg className="animate-spin h-8 w-8 text-maintenease-700" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}
      </div>
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={handleClick}
        disabled={isUploading}
      >
        <Upload className="w-4 h-4 mr-1" />
        Change Avatar
      </Button>
    </div>
  );
};
