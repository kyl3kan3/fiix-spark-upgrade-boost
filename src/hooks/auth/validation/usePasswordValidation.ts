
import { useCallback } from "react";
import { AUTH_VALIDATION } from "@/constants/authConstants";

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function usePasswordValidation() {
  const validatePassword = useCallback((password: string, isSignUp: boolean = false): ValidationResult => {
    if (!password.trim()) {
      return { isValid: false, error: "Password is required" };
    }
    
    if (isSignUp && password.length < AUTH_VALIDATION.MIN_PASSWORD_LENGTH) {
      return { isValid: false, error: `Password must be at least ${AUTH_VALIDATION.MIN_PASSWORD_LENGTH} characters long` };
    }
    
    return { isValid: true };
  }, []);

  return { validatePassword };
}
