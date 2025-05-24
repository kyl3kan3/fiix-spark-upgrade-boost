
import { useCallback } from "react";
import { ValidationResult } from "@/types/forms";
import { validateRequired, validateEmail, createValidationResult } from "@/utils/validation";

export function useEmailValidation() {
  const validateEmailField = useCallback((email: string): ValidationResult => {
    const requiredCheck = validateRequired(email, "Email");
    if (!requiredCheck.isValid) return requiredCheck;
    
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) return emailCheck;
    
    return createValidationResult(true);
  }, []);

  return { validateEmail: validateEmailField };
}
