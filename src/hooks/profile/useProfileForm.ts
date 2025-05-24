
import { useState, useCallback } from "react";
import { ProfileFormData, ProfileData } from "@/components/profile/types";
import { useProfileFormValidation } from "./validation/useProfileFormValidation";
import { toast } from "sonner";

interface UseProfileFormProps {
  initialData: ProfileData | null;
  onSave: (data: Partial<ProfileData>) => Promise<ProfileData>;
}

export function useProfileForm({ initialData, onSave }: UseProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    phone_number: initialData?.phone_number || "",
    email: initialData?.email || "",
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { validateProfileForm } = useProfileFormValidation();

  // Update form data when initialData changes
  const resetForm = useCallback(() => {
    setFormData({
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      phone_number: initialData?.phone_number || "",
      email: initialData?.email || "",
    });
    setErrors({});
  }, [initialData]);

  // Reset form when initialData changes
  useState(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        phone_number: initialData.phone_number || "",
        email: initialData.email || "",
      });
    }
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof ProfileFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateProfileForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to update profile");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [formData, validateProfileForm, onSave]);

  return {
    formData,
    errors,
    isSaving,
    handleInputChange,
    handleSubmit,
    resetForm
  };
}
