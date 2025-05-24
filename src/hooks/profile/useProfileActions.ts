
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/components/profile/types";
import { toast } from "sonner";

export function useProfileActions() {
  const saveProfile = useCallback(async (profileId: string, updates: Partial<ProfileData>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        description: "Please try again later"
      });
      throw error;
    }
  }, []);

  const updateAvatar = useCallback(async (profileId: string, file: File | null) => {
    try {
      if (!file) {
        // Remove avatar
        const { data, error } = await supabase
          .from('profiles')
          .update({ avatar_url: null })
          .eq('id', profileId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${profileId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update avatar", {
        description: "Please try again later"
      });
      throw error;
    }
  }, []);

  const createProfile = useCallback(async (userId: string, email: string | undefined) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email: email || '',
          first_name: '',
          last_name: '',
          phone_number: '',
          company_id: '',
          company_name: '',
          role: 'user',
          avatar_url: null
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile", {
        description: "Please try again later"
      });
      throw error;
    }
  }, []);

  return {
    saveProfile,
    updateAvatar,
    createProfile
  };
}
