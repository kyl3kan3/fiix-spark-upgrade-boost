
import { ValidationResult } from "@/types/forms";

export const createValidationResult = (isValid: boolean, error?: string): ValidationResult => ({
  isValid,
  error
});

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value.trim()) {
    return createValidationResult(false, `${fieldName} is required`);
  }
  return createValidationResult(true);
};

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return createValidationResult(false, "Please enter a valid email address");
  }
  return createValidationResult(true);
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): ValidationResult => {
  if (value.length < minLength) {
    return createValidationResult(false, `${fieldName} must be at least ${minLength} characters long`);
  }
  return createValidationResult(true);
};
