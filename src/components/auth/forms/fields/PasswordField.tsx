
import React from "react";
import { FormField } from "./FormField";
import { AUTH_FIELD_LABELS, AUTH_PLACEHOLDERS, AUTH_AUTOCOMPLETE } from "@/constants/authConstants";
import { BaseFormFieldProps } from "@/types/forms";

interface PasswordFieldProps extends BaseFormFieldProps {
  label?: string;
  autoComplete?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ 
  value, 
  onChange, 
  disabled,
  label = AUTH_FIELD_LABELS.PASSWORD,
  autoComplete = AUTH_AUTOCOMPLETE.CURRENT_PASSWORD
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
