
import React from "react";
import { FormField } from "./FormField";

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
  label = "Password",
  autoComplete = "current-password",
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
      placeholder="••••••••"
      autoComplete={autoComplete}
      required
      disabled={disabled}
    />
  );
};
