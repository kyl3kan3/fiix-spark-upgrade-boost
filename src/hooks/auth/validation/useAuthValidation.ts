
import { useCallback } from "react";
import { AUTH_VALIDATION } from "@/constants/authConstants";
import { ValidationResult } from "@/types/forms";
import { validateRequired, validateEmail, validateMinLength, createValidationResult } from "@/utils/validation";

export function useAuthValidation() {
  // Email validation
  const validateEmailField = useCallback((email: string): ValidationResult => {
    const requiredCheck = validateRequired(email, "Email");
    if (!requiredCheck.isValid) return requiredCheck;
    
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) return emailCheck;
    
    return createValidationResult(true);
  }, []);

  // Password validation
  const validatePassword = useCallback((password: string, isSignUp: boolean = false): ValidationResult => {
    const requiredCheck = validateRequired(password, "Password");
    if (!requiredCheck.isValid) return requiredCheck;
    
    if (isSignUp) {
      const lengthCheck = validateMinLength(password, AUTH_VALIDATION.MIN_PASSWORD_LENGTH, "Password");
      if (!lengthCheck.isValid) return lengthCheck;
    }
    
    return createValidationResult(true);
  }, []);

  // Name validation
  const validateName = useCallback((name: string): ValidationResult => {
    return validateRequired(name, "Name");
  }, []);

  const validateCompanyName = useCallback((companyName: string): ValidationResult => {
    return validateRequired(companyName, "Company name");
  }, []);

  // Form validation
  const validateSignInForm = useCallback((email: string, password: string): ValidationResult => {
    const emailValidation = validateEmailField(email);
    if (!emailValidation.isValid) return emailValidation;
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) return passwordValidation;
    
    return { isValid: true };
  }, [validateEmailField, validatePassword]);

  const validateSignUpForm = useCallback((email: string, password: string, name: string, companyName: string): ValidationResult => {
    const emailValidation = validateEmailField(email);
    if (!emailValidation.isValid) return emailValidation;
    
    const passwordValidation = validatePassword(password, true);
    if (!passwordValidation.isValid) return passwordValidation;
    
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) return nameValidation;
    
    const companyValidation = validateCompanyName(companyName);
    if (!companyValidation.isValid) return companyValidation;
    
    return { isValid: true };
  }, [validateEmailField, validatePassword, validateName, validateCompanyName]);

  return {
    validateEmail: validateEmailField,
    validatePassword,
    validateName,
    validateCompanyName,
    validateSignInForm,
    validateSignUpForm
  };
}
