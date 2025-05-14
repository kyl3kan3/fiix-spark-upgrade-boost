
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Image } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AvatarUploaderProps {
  currentAvatarUrl: string | null;
  onAvatarChange: (url: string | null) => void;
  "aria-label"?: string;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  "aria-label": ariaLabel,
}) => {
  const [preview, setPreview] = useState(currentAvatarUrl);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulates upload, you should integrate with Supabase storage for real use
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      onAvatarChange(reader.result as string);
      toast({
        title: "Avatar updated!",
        description: "Your new avatar has been set.",
      });
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-muted flex items-center justify-center overflow-hidden shadow"
        onClick={() => inputRef.current?.click()}
        style={{ cursor: "pointer" }}
        title="Change avatar"
        role="button"
        aria-label={ariaLabel || "Change profile picture"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            inputRef.current?.click();
          }
        }}
      >
        {preview ? (
          <img src={preview} alt="User avatar" className="w-24 h-24 object-cover" />
        ) : (
          <Image className="w-12 h-12 text-gray-400" />
        )}
        {loading && (
          <span className="absolute inset-0 bg-white/70 flex justify-center items-center">
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
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={loading}
      />
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        <Upload className="w-4 h-4 mr-1" />
        Change Avatar
      </Button>
    </div>
  );
};

export default AvatarUploader;
