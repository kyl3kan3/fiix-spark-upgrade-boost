
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "../types";
import { toast } from "@/hooks/use-toast";

export function useProfileUpdates(
  profileData: ProfileData | null,
  setProfileData: (profile: ProfileData | null) => void
) {
  const [isSaving, setIsSaving] = useState(false);

  const updateProfile = async (updatedData: Partial<ProfileData>) => {
    if (!profileData) return false;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updatedData)
        .eq("id", profileData.id);
        
      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Update local state with new data
      setProfileData(prev => prev ? { ...prev, ...updatedData } : null);
      return true;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateAvatar = async (avatar: string | null) => {
    const success = await updateProfile({ avatar_url: avatar });
    
    if (success) {
      toast({
        title: "Avatar updated!",
        description: "Profile picture updated successfully.",
      });
    }
    
    return success;
  };

  return {
    isSaving,
    updateProfile,
    updateAvatar
  };
}
