
import React from "react";
import { FormField } from "./FormField";
import { AUTH_FIELD_LABELS, AUTH_PLACEHOLDERS } from "@/constants/authConstants";
import { BaseFormFieldProps } from "@/types/forms";

export const NameField: React.FC<BaseFormFieldProps> = ({ value, onChange, disabled }) => {
  return (
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
};
