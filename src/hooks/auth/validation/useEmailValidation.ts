
import { useCallback } from "react";

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function useEmailValidation() {
  const validateEmail = useCallback((email: string): ValidationResult => {
    if (!email.trim()) {
      return { isValid: false, error: "Email is required" };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "Please enter a valid email address" };
    }
    
    return { isValid: true };
  }, []);

  return { validateEmail };
}
