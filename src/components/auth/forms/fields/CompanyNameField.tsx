
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompanyNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const CompanyNameField: React.FC<CompanyNameFieldProps> = ({ value, onChange, disabled }) => {
  return (
    <div>
      <Label htmlFor="company-name">Company Name</Label>
      <Input
        id="company-name"
        name="companyName"
        type="text"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Acme Corp"
        className="mt-1"
        disabled={disabled}
      />
    </div>
  );
};
