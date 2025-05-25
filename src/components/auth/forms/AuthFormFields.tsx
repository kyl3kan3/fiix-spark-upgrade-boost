
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AUTH_FIELD_LABELS, AUTH_PLACEHOLDERS, AUTH_AUTOCOMPLETE } from "@/constants/authConstants";

interface FormFieldProps {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  type,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
};

interface CheckboxFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({ 
  checked, 
  onChange, 
  disabled,
  label = AUTH_FIELD_LABELS.REMEMBER_ME,
  id = "remember-me"
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
      <Label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </Label>
    </div>
  );
};

// Specific field components for better reusability
export const EmailField: React.FC<{ value: string; onChange: (value: string) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => (
  <FormField
    id="email"
    name="email"
    type="email"
    label={AUTH_FIELD_LABELS.EMAIL}
    value={value}
    onChange={onChange}
    placeholder={AUTH_PLACEHOLDERS.EMAIL}
    autoComplete={AUTH_AUTOCOMPLETE.EMAIL}
    required
    disabled={disabled}
  />
);

export const PasswordField: React.FC<{ 
  value: string; 
  onChange: (value: string) => void; 
  disabled?: boolean;
  label?: string;
  autoComplete?: string;
}> = ({ value, onChange, disabled, label = AUTH_FIELD_LABELS.PASSWORD, autoComplete = AUTH_AUTOCOMPLETE.CURRENT_PASSWORD }) => (
  <FormField
    id="password"
    name="password"
    type="password"
    label={label}
    value={value}
    onChange={onChange}
    placeholder={AUTH_PLACEHOLDERS.PASSWORD}
    autoComplete={autoComplete}
    required
    disabled={disabled}
  />
);

export const NameField: React.FC<{ value: string; onChange: (value: string) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => (
  <FormField
    id="name"
    name="name"
    type="text"
    label={AUTH_FIELD_LABELS.FULL_NAME}
    value={value}
    onChange={onChange}
    placeholder={AUTH_PLACEHOLDERS.FULL_NAME}
    required
    disabled={disabled}
  />
);

export const CompanyNameField: React.FC<{ value: string; onChange: (value: string) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => (
  <FormField
    id="company-name"
    name="companyName"
    type="text"
    label={AUTH_FIELD_LABELS.COMPANY_NAME}
    value={value}
    onChange={onChange}
    placeholder={AUTH_PLACEHOLDERS.COMPANY_NAME}
    required
    disabled={disabled}
  />
);
