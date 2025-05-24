
import React from "react";
import { FormField } from "./FormField";
import { AUTH_FIELD_LABELS, AUTH_PLACEHOLDERS, AUTH_AUTOCOMPLETE } from "@/constants/authConstants";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ 
  value, 
  onChange, 
  label = AUTH_FIELD_LABELS.PASSWORD,
  autoComplete = AUTH_AUTOCOMPLETE.CURRENT_PASSWORD,
  disabled 
}) => {
  return (
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
};
