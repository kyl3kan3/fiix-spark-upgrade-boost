
import { useCallback } from "react";
import { ProfileFormData } from "@/components/profile/types";

interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof ProfileFormData, string>>;
}

export function useProfileFormValidation() {
  const validateProfileForm = useCallback((formData: ProfileFormData): ValidationResult => {
    const errors: Partial<Record<keyof ProfileFormData, string>> = {};

    // First name validation
    if (!formData.first_name?.trim()) {
      errors.first_name = "First name is required";
    }

    // Last name validation
    if (!formData.last_name?.trim()) {
      errors.last_name = "Last name is required";
    }

    // Email validation
    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    // Phone number validation (optional but format check if provided)
    if (formData.phone_number?.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone_number.replace(/[\s\-\(\)]/g, ''))) {
        errors.phone_number = "Please enter a valid phone number";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  return { validateProfileForm };
}
