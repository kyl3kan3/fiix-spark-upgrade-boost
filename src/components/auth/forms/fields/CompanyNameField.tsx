
import React from "react";
import { FormField } from "./FormField";

interface CompanyNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const CompanyNameField: React.FC<CompanyNameFieldProps> = ({ value, onChange, disabled }) => {
  return (
    <FormField
      id="company-name"
      name="companyName"
      type="text"
      label="Company Name"
      value={value}
      onChange={onChange}
      placeholder="Acme Corp"
      required
      disabled={disabled}
    />
  );
};
