
import { useCallback } from "react";
import { ValidationResult } from "@/types/forms";
import { validateRequired } from "@/utils/validation";

export function useNameValidation() {
  const validateName = useCallback((name: string): ValidationResult => {
    return validateRequired(name, "Name");
  }, []);

  const validateCompanyName = useCallback((companyName: string): ValidationResult => {
    return validateRequired(companyName, "Company name");
  }, []);

  return { validateName, validateCompanyName };
}
