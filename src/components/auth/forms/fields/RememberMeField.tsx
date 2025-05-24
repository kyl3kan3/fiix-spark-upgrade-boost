
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RememberMeFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const RememberMeField: React.FC<RememberMeFieldProps> = ({ checked, onChange, disabled }) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="remember-me" 
        checked={checked}
        onCheckedChange={(checked) => onChange(checked as boolean)}
        disabled={disabled}
      />
      <Label htmlFor="remember-me" className="text-sm font-medium cursor-pointer">
        Stay logged in
      </Label>
    </div>
  );
};
