
import { useState, useCallback } from "react";
import { ProfileFormData, ProfileData } from "@/components/profile/types";
import { useProfileFormValidation } from "./validation/useProfileFormValidation";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";

interface UseProfileFormProps {
  initialData: ProfileData | null;
  onSave: (data: Partial<ProfileData>) => Promise<ProfileData>;
}

export function useProfileForm({ initialData, onSave }: UseProfileFormProps) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    phone_number: initialData?.phone_number || "",
    email: user?.email || initialData?.email || "",
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
      email: user?.email || initialData?.email || "",
    });
    setErrors({});
  }, [initialData, user?.email]);

  // Reset form when initialData changes
  useState(() => {
    if (initialData || user?.email) {
      setFormData({
        first_name: initialData?.first_name || "",
        last_name: initialData?.last_name || "",
        phone_number: initialData?.phone_number || "",
        email: user?.email || initialData?.email || "",
      });
    }
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Don't allow email changes
    if (name === 'email') {
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof ProfileFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Exclude email from validation and submission data
    const dataToValidate = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone_number: formData.phone_number,
    };
    
    const validation = validateProfileForm(dataToValidate);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }

    setIsSaving(true);
    try {
      // Only submit fields that can be changed (exclude email)
      await onSave({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
      });
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
