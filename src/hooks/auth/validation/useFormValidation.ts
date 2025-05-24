
import { useState, useCallback } from "react";

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validatePassword = useCallback((password: string, isSignUp: boolean = false): ValidationResult => {
    if (!password.trim()) {
      return { isValid: false, error: "Password is required" };
    }
    
    if (isSignUp && password.length < 6) {
      return { isValid: false, error: "Password must be at least 6 characters long" };
    }
    
    return { isValid: true };
  }, []);

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
    if (!name.trim()) {
      return { isValid: false, error: "Full name is required" };
    }
    
    if (!companyName.trim()) {
      return { isValid: false, error: "Company name is required" };
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
  }, [validateEmail, validatePassword]);

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
