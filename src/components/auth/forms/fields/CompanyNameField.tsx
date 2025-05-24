
import React from "react";
import { FormField } from "./FormField";
import { AUTH_FIELD_LABELS, AUTH_PLACEHOLDERS } from "@/constants/authConstants";

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
      label={AUTH_FIELD_LABELS.COMPANY_NAME}
      value={value}
      onChange={onChange}
      placeholder={AUTH_PLACEHOLDERS.COMPANY_NAME}
      required
      disabled={disabled}
    />
  );
};
