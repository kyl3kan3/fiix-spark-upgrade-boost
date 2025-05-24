
import { useCallback } from "react";

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function usePasswordValidation() {
  const validatePassword = useCallback((password: string, isSignUp: boolean = false): ValidationResult => {
    if (!password.trim()) {
      return { isValid: false, error: "Password is required" };
    }
    
    if (isSignUp && password.length < 6) {
      return { isValid: false, error: "Password must be at least 6 characters long" };
    }
    
    return { isValid: true };
  }, []);

  return { validatePassword };
}
