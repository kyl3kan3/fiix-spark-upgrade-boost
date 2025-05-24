
import { useCallback, useState } from "react";
import { useProfileActions } from "./useProfileActions";
import { toast } from "sonner";

export function useAvatarUpload(profileId: string | undefined) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { updateAvatar } = useProfileActions();

  const handleFileUpload = useCallback(async (file: File | null) => {
    if (!profileId) return null;

    setIsUploading(true);
    try {
      const updatedProfile = await updateAvatar(profileId, file);
      
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        toast.success("Avatar updated successfully");
      } else {
        setPreview(null);
        toast.success("Avatar removed successfully");
      }
      
      return updatedProfile;
    } catch (error) {
      console.error("Avatar upload failed:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [profileId, updateAvatar]);

  const setPreviewUrl = useCallback((url: string | null) => {
    setPreview(url);
  }, []);

  return {
    isUploading,
    preview,
    setPreviewUrl,
    handleFileUpload
  };
}
