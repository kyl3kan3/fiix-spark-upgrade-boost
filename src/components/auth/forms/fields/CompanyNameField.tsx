
import React from "react";
import { FormField } from "./FormField";
import { AUTH_FIELD_LABELS, AUTH_PLACEHOLDERS } from "@/constants/authConstants";
import { BaseFormFieldProps } from "@/types/forms";

export const CompanyNameField: React.FC<BaseFormFieldProps> = ({ value, onChange, disabled }) => {
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
