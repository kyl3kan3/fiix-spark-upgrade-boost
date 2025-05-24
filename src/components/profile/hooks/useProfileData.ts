
import { useState, useEffect } from "react";
import { useProfileFetch } from "./useProfileFetch";
import { useProfileUpdates } from "./useProfileUpdates";
import { useProfileForm } from "./useProfileForm";
import { toast } from "sonner";

export function useProfileData() {
  const { profileData, setProfileData, isLoading, profileError, fetchProfileData } = useProfileFetch();
  const { isSaving, updateProfile, updateAvatar } = useProfileUpdates(profileData, setProfileData);
  const { form, handleFormChange, updateFormFromProfile } = useProfileForm(profileData);
  
  // Update form when profile data changes
  useEffect(() => {
    updateFormFromProfile(profileData);
  }, [profileData, updateFormFromProfile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData) return false;
    
    const toUpdate = {
      first_name: form.first_name,
      last_name: form.last_name,
      phone_number: form.phone_number,
      email: form.email,
    };
    
    const success = await updateProfile(toUpdate);
    
    if (success) {
      toast.success("Profile Updated", {
        description: "Your profile changes have been saved."
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
    refreshProfile: fetchProfileData
  };
}
