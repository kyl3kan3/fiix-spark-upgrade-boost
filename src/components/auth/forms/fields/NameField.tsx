
import React from "react";
import { FormField } from "./FormField";

interface NameFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const NameField: React.FC<NameFieldProps> = ({ value, onChange, disabled }) => {
  return (
    <FormField
      id="name"
      name="name"
      type="text"
      label="Full Name"
      value={value}
      onChange={onChange}
      placeholder="John Doe"
      required
      disabled={disabled}
    />
  );
};
