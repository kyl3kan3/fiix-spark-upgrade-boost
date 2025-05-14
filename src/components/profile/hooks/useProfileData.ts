
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData, ProfileFormData } from "../types";
import { toast } from "@/hooks/use-toast";

export function useProfileData() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      setProfileData(data);
      setForm({
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        phone_number: data.phone_number ?? "",
        email: data.email ?? "",
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateProfile = async (updatedData: Partial<ProfileData>) => {
    if (!profileData) return false;
    
    setIsSaving(true);
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
      setIsSaving(false);
      return false;
    }
    
    // Update local state with new data
    setProfileData(prev => prev ? { ...prev, ...updatedData } : null);
    setIsSaving(false);
    return true;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData) return;
    
    const toUpdate = {
      first_name: form.first_name,
      last_name: form.last_name,
      phone_number: form.phone_number,
      email: form.email,
    };
    
    const success = await updateProfile(toUpdate);
    
    if (success) {
      toast({
        title: "Profile Updated",
        description: "Your profile changes have been saved.",
      });
    }
    
    return success;
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
    profileData,
    isLoading,
    isSaving,
    form,
    handleFormChange,
    handleProfileUpdate,
    updateAvatar,
  };
}
