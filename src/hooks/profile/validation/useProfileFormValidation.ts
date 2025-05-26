
import { ProfileFormData } from "@/components/profile/types";

interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof ProfileFormData, string>>;
}

export function useProfileFormValidation() {
  const validateProfileForm = (data: Partial<ProfileFormData>): ValidationResult => {
    const errors: Partial<Record<keyof ProfileFormData, string>> = {};

    // Validate first name
    if (!data.first_name?.trim()) {
      errors.first_name = "First name is required";
    }

    // Validate last name
    if (!data.last_name?.trim()) {
      errors.last_name = "Last name is required";
    }

    // Validate phone number (optional but must be valid if provided)
    if (data.phone_number && data.phone_number.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;
      if (!phoneRegex.test(data.phone_number)) {
        errors.phone_number = "Please enter a valid phone number";
      }
    }

    // Note: Email validation removed since email is read-only

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  return { validateProfileForm };
}
