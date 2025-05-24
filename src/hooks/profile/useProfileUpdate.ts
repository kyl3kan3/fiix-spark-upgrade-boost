
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/components/profile/types";

export function useProfileUpdate() {
  const updateProfile = async (profileId: string, updates: Partial<ProfileData>) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profileId);
        
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Update failed", {
        description: error.message,
      });
      return false;
    }
  };

  return { updateProfile };
}
