
// Form-related type definitions
export interface BaseFormFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface FormFieldProps extends BaseFormFieldProps {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}

export interface CheckboxFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export interface FormSubmissionProps {
  onError: (message: string) => void;
}

export interface FormStateData {
  email: string;
  password: string;
  name: string;
  companyName: string;
  rememberMe: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export type ValidationFunction = (value: string, isSignUp?: boolean) => ValidationResult;
