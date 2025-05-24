
import { useCallback } from "react";
import { AUTH_VALIDATION } from "@/constants/authConstants";
import { ValidationResult } from "@/types/forms";
import { validateRequired, validateMinLength, createValidationResult } from "@/utils/validation";

export function usePasswordValidation() {
  const validatePassword = useCallback((password: string, isSignUp: boolean = false): ValidationResult => {
    const requiredCheck = validateRequired(password, "Password");
    if (!requiredCheck.isValid) return requiredCheck;
    
    if (isSignUp) {
      const lengthCheck = validateMinLength(password, AUTH_VALIDATION.MIN_PASSWORD_LENGTH, "Password");
      if (!lengthCheck.isValid) return lengthCheck;
    }
    
    return createValidationResult(true);
  }, []);

  return { validatePassword };
}
