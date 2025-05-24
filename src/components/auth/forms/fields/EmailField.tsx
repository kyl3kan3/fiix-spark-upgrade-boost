
import React from "react";
import { FormField } from "./FormField";
import { AUTH_FIELD_LABELS, AUTH_PLACEHOLDERS, AUTH_AUTOCOMPLETE } from "@/constants/authConstants";
import { BaseFormFieldProps } from "@/types/forms";

export const EmailField: React.FC<BaseFormFieldProps> = ({ value, onChange, disabled }) => {
  return (
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
};
