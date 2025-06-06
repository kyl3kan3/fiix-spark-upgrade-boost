
import React from "react";
import { VendorFormData } from "@/services/vendorService";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldMapper } from "./FieldMapper";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VendorCardFieldsProps {
  vendor: VendorFormData;
  index: number;
  onFieldChange: (field: keyof VendorFormData, value: any) => void;
  onFieldRemap?: (fromField: keyof VendorFormData, toField: keyof VendorFormData, value: string) => void;
}

export const VendorCardFields: React.FC<VendorCardFieldsProps> = ({
  vendor,
  index,
  onFieldChange,
  onFieldRemap,
}) => {
  const [isFieldMappingOpen, setIsFieldMappingOpen] = React.useState(false);

  const handleFieldRemap = (currentField: keyof VendorFormData, newField: keyof VendorFormData, value: string) => {
    if (onFieldRemap) {
      onFieldRemap(currentField, newField, value);
    }
  };

  const clearField = (field: keyof VendorFormData) => {
    onFieldChange(field, "");
  };

  const mappableFields = Object.entries(vendor).filter(([field, value]) => {
    return typeof value === "string" && value.trim() && field !== "vendor_type" && field !== "status";
  });

  return (
    <CardContent className="space-y-3 p-4">
      {/* Field Mapping Section - Collapsible */}
      {onFieldRemap && mappableFields.length > 0 && (
        <Collapsible open={isFieldMappingOpen} onOpenChange={setIsFieldMappingOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between p-2 h-auto">
              <span className="text-sm font-medium">Field Mapping ({mappableFields.length} fields)</span>
              {isFieldMappingOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-2">
            <div className="max-h-32 overflow-y-auto space-y-1">
              {mappableFields.map(([field, value]) => (
                <FieldMapper
                  key={field}
                  fieldValue={value}
                  currentField={field as keyof VendorFormData}
                  onFieldChange={(newField, val) => handleFieldRemap(field as keyof VendorFormData, newField, val)}
                  onClearField={() => clearField(field as keyof VendorFormData)}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Regular Form Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`name-${index}`} className="text-xs">Company Name *</Label>
          <Input
            id={`name-${index}`}
            value={vendor.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            placeholder="Enter company name"
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor={`email-${index}`} className="text-xs">Email</Label>
          <Input
            id={`email-${index}`}
            type="email"
            value={vendor.email}
            onChange={(e) => onFieldChange("email", e.target.value)}
            placeholder="Enter email"
            className="h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`phone-${index}`} className="text-xs">Phone</Label>
          <Input
            id={`phone-${index}`}
            value={vendor.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            placeholder="Enter phone number"
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor={`contact-${index}`} className="text-xs">Contact Person</Label>
          <Input
            id={`contact-${index}`}
            value={vendor.contact_person}
            onChange={(e) => onFieldChange("contact_person", e.target.value)}
            placeholder="Enter contact person"
            className="h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`status-${index}`} className="text-xs">Status</Label>
          <Select
            value={vendor.status}
            onValueChange={(value) => onFieldChange("status", value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={`contact-title-${index}`} className="text-xs">Contact Title</Label>
          <Input
            id={`contact-title-${index}`}
            value={vendor.contact_title}
            onChange={(e) => onFieldChange("contact_title", e.target.value)}
            placeholder="Enter contact title"
            className="h-8"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`address-${index}`} className="text-xs">Address</Label>
        <Input
          id={`address-${index}`}
          value={vendor.address}
          onChange={(e) => onFieldChange("address", e.target.value)}
          placeholder="Enter address"
          className="h-8"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor={`city-${index}`} className="text-xs">City</Label>
          <Input
            id={`city-${index}`}
            value={vendor.city}
            onChange={(e) => onFieldChange("city", e.target.value)}
            placeholder="Enter city"
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor={`state-${index}`} className="text-xs">State</Label>
          <Input
            id={`state-${index}`}
            value={vendor.state}
            onChange={(e) => onFieldChange("state", e.target.value)}
            placeholder="Enter state"
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor={`zip-${index}`} className="text-xs">ZIP Code</Label>
          <Input
            id={`zip-${index}`}
            value={vendor.zip_code}
            onChange={(e) => onFieldChange("zip_code", e.target.value)}
            placeholder="Enter ZIP"
            className="h-8"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`website-${index}`} className="text-xs">Website</Label>
        <Input
          id={`website-${index}`}
          value={vendor.website}
          onChange={(e) => onFieldChange("website", e.target.value)}
          placeholder="Enter website URL"
          className="h-8"
        />
      </div>

      <div>
        <Label htmlFor={`description-${index}`} className="text-xs">Description</Label>
        <Textarea
          id={`description-${index}`}
          value={vendor.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
          placeholder="Enter description"
          rows={2}
          className="text-sm"
        />
      </div>
    </CardContent>
  );
};
