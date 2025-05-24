
import { useEmailValidation } from "./useEmailValidation";
import { usePasswordValidation } from "./usePasswordValidation";
import { useNameValidation } from "./useNameValidation";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function useFormValidation() {
  const { validateEmail } = useEmailValidation();
  const { validatePassword } = usePasswordValidation();
  const { validateName, validateCompanyName } = useNameValidation();

  const validateSignInForm = (email: string, password: string): ValidationResult => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) return emailValidation;
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) return passwordValidation;
    
    return { isValid: true };
  };

  const validateSignUpForm = (email: string, password: string, name: string, companyName: string): ValidationResult => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) return emailValidation;
    
    const passwordValidation = validatePassword(password, true);
    if (!passwordValidation.isValid) return passwordValidation;
    
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) return nameValidation;
    
    const companyValidation = validateCompanyName(companyName);
    if (!companyValidation.isValid) return companyValidation;
    
    return { isValid: true };
  };

  return {
    validateEmail,
    validatePassword,
    validateName,
    validateCompanyName,
    validateSignInForm,
    validateSignUpForm
  };
}
