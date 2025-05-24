
import { useState } from "react";
import { ProfileData, ProfileFormData } from "../types";

export function useProfileForm(profileData: ProfileData | null) {
  const [form, setForm] = useState<ProfileFormData>({
    first_name: profileData?.first_name || "",
    last_name: profileData?.last_name || "",
    phone_number: profileData?.phone_number || "",
    email: profileData?.email || "",
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Update form when profile data changes
  const updateFormFromProfile = (profile: ProfileData | null) => {
    if (profile) {
      setForm({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone_number: profile.phone_number || "",
        email: profile.email || "",
      });
    }
  };

  return {
    form,
    setForm,
    handleFormChange,
    updateFormFromProfile
  };
}
