
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NameFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const NameField: React.FC<NameFieldProps> = ({ value, onChange, disabled }) => {
  return (
    <div>
      <Label htmlFor="name">Full Name</Label>
      <Input
        id="name"
        name="name"
        type="text"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="John Doe"
        className="mt-1"
        disabled={disabled}
      />
    </div>
  );
};
