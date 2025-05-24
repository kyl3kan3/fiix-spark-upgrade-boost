
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AUTH_FIELD_LABELS } from "@/constants/authConstants";

interface RememberMeFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const RememberMeField: React.FC<RememberMeFieldProps> = ({ 
  checked, 
  onChange,
  disabled 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="remember-me"
        checked={checked}
        onCheckedChange={(checked) => onChange(!!checked)}
        disabled={disabled}
      />
      <Label 
        htmlFor="remember-me" 
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {AUTH_FIELD_LABELS.REMEMBER_ME}
      </Label>
    </div>
  );
};
