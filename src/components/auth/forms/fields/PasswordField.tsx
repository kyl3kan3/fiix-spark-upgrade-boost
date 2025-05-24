
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ 
  value, 
  onChange, 
  label = "Password",
  autoComplete = "current-password",
  disabled 
}) => {
  return (
    <div>
      <Label htmlFor="password">{label}</Label>
      <Input
        id="password"
        name="password"
        type="password"
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        className="mt-1"
        disabled={disabled}
      />
    </div>
  );
};
