
import { useCallback } from "react";
import { ValidationResult } from "@/types/forms";

export function useNameValidation() {
  const validateName = useCallback((name: string): ValidationResult => {
    if (!name.trim()) {
      return { isValid: false, error: "Name is required" };
    }
    
    return { isValid: true };
  }, []);

  const validateCompanyName = useCallback((companyName: string): ValidationResult => {
    if (!companyName.trim()) {
      return { isValid: false, error: "Company name is required" };
    }
    
    return { isValid: true };
  }, []);

  return { validateName, validateCompanyName };
}
