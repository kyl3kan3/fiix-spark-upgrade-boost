
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function useFormValidation() {
  const validateEmail = (email: string): ValidationResult => {
    if (!email) {
      return { isValid: false, error: "Email is required" };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "Please enter a valid email address" };
    }
    
    return { isValid: true };
  };

  const validatePassword = (password: string): ValidationResult => {
    if (!password) {
      return { isValid: false, error: "Password is required" };
    }
    
    if (password.length < 6) {
      return { isValid: false, error: "Password must be at least 6 characters long" };
    }
    
    return { isValid: true };
  };

  const validateName = (name: string): ValidationResult => {
    if (!name.trim()) {
      return { isValid: false, error: "Name is required" };
    }
    
    return { isValid: true };
  };

  const validateCompanyName = (companyName: string): ValidationResult => {
    if (!companyName.trim()) {
      return { isValid: false, error: "Company name is required" };
    }
    
    return { isValid: true };
  };

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
    
    const passwordValidation = validatePassword(password);
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
