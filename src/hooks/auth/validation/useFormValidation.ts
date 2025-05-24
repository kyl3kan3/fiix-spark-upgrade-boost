
import { useState, useCallback } from "react";
import { useEmailValidation } from "./useEmailValidation";
import { usePasswordValidation } from "./usePasswordValidation";
import { useNameValidation } from "./useNameValidation";

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { validateEmail } = useEmailValidation();
  const { validatePassword } = usePasswordValidation();
  const { validateName, validateCompanyName } = useNameValidation();

  const validateSignInForm = useCallback((email: string, password: string): ValidationResult => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return emailValidation;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }
    
    return { isValid: true };
  }, [validateEmail, validatePassword]);

  const validateSignUpForm = useCallback((
    email: string, 
    password: string, 
    name: string, 
    companyName: string
  ): ValidationResult => {
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return nameValidation;
    }
    
    const companyValidation = validateCompanyName(companyName);
    if (!companyValidation.isValid) {
      return companyValidation;
    }
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return emailValidation;
    }
    
    const passwordValidation = validatePassword(password, true);
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }
    
    return { isValid: true };
  }, [validateEmail, validatePassword, validateName, validateCompanyName]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  return {
    errors,
    validateSignInForm,
    validateSignUpForm,
    clearErrors,
    setFieldError
  };
}
