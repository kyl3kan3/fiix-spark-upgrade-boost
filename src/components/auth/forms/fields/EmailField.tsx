
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const EmailField: React.FC<EmailFieldProps> = ({ value, onChange, disabled }) => {
  return (
    <div>
      <Label htmlFor="email-address">Email address</Label>
      <Input
        id="email-address"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="your@email.com"
        className="mt-1"
        disabled={disabled}
      />
    </div>
  );
};
