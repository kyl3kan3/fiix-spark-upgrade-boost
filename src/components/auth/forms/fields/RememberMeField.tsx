
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AUTH_FIELD_LABELS } from "@/constants/authConstants";
import { CheckboxFieldProps } from "@/types/forms";

export const RememberMeField: React.FC<CheckboxFieldProps> = ({ 
  checked, 
  onChange,
  disabled,
  label = AUTH_FIELD_LABELS.REMEMBER_ME,
  id = "remember-me"
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(checked) => onChange(!!checked)}
        disabled={disabled}
      />
      <Label 
        htmlFor={id} 
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </Label>
    </div>
  );
};
