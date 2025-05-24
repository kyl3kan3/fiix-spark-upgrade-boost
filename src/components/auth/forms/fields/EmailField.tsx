
import React from "react";
import { FormField } from "./FormField";

interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const EmailField: React.FC<EmailFieldProps> = ({ value, onChange, disabled }) => {
  return (
    <FormField
      id="email"
      name="email"
      type="email"
      label="Email"
      value={value}
      onChange={onChange}
      placeholder="you@example.com"
      autoComplete="email"
      required
      disabled={disabled}
    />
  );
};
