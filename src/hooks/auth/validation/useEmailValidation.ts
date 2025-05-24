
import { useCallback } from "react";
import { ValidationResult } from "@/types/forms";

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
