
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VendorFormData } from "@/services/vendorService";

interface FieldMapperProps {
  fieldValue: string;
  currentField: keyof VendorFormData;
  onFieldChange: (newField: keyof VendorFormData, value: string) => void;
  onClearField: () => void;
}

const fieldOptions = [
  { value: "name", label: "Company Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "contact_person", label: "Contact Person" },
  { value: "contact_title", label: "Contact Title" },
  { value: "address", label: "Address" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "zip_code", label: "ZIP Code" },
  { value: "website", label: "Website" },
  { value: "description", label: "Description" },
];

export const FieldMapper: React.FC<FieldMapperProps> = ({
  fieldValue,
  currentField,
  onFieldChange,
  onClearField,
}) => {
  const handleFieldTypeChange = (newFieldType: string) => {
    const newField = newFieldType as keyof VendorFormData;
    onFieldChange(newField, fieldValue);
    onClearField();
  };

  if (!fieldValue || !fieldValue.trim()) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded text-xs">
      <div className="flex-1 min-w-0">
        <span className="font-medium truncate block text-xs" title={fieldValue}>
          {fieldValue.length > 20 ? `${fieldValue.substring(0, 20)}...` : fieldValue}
        </span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-gray-500 text-xs">→</span>
        <Select value={currentField} onValueChange={handleFieldTypeChange}>
          <SelectTrigger className="w-24 h-6 text-xs p-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fieldOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
