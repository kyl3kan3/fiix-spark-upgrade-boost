
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFieldProps } from "@/types/forms";

export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  type,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  disabled = false,
  className = "mt-1"
}) => {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
    </div>
  );
};
