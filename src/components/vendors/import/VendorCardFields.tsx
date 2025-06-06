
import React from "react";
import { VendorFormData } from "@/services/vendorService";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VendorCardFieldsProps {
  vendor: VendorFormData;
  index: number;
  onFieldChange: (field: keyof VendorFormData, value: any) => void;
}

export const VendorCardFields: React.FC<VendorCardFieldsProps> = ({
  vendor,
  index,
  onFieldChange,
}) => {
  return (
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`name-${index}`}>Company Name *</Label>
          <Input
            id={`name-${index}`}
            value={vendor.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            placeholder="Enter company name"
          />
        </div>
        <div>
          <Label htmlFor={`email-${index}`}>Email</Label>
          <Input
            id={`email-${index}`}
            type="email"
            value={vendor.email}
            onChange={(e) => onFieldChange("email", e.target.value)}
            placeholder="Enter email"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`phone-${index}`}>Phone</Label>
          <Input
            id={`phone-${index}`}
            value={vendor.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <Label htmlFor={`contact-${index}`}>Contact Person</Label>
          <Input
            id={`contact-${index}`}
            value={vendor.contact_person}
            onChange={(e) => onFieldChange("contact_person", e.target.value)}
            placeholder="Enter contact person"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`status-${index}`}>Status</Label>
          <Select
            value={vendor.status}
            onValueChange={(value) => onFieldChange("status", value)}
          >
            <SelectTrigger>
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
          <Label htmlFor={`contact-title-${index}`}>Contact Title</Label>
          <Input
            id={`contact-title-${index}`}
            value={vendor.contact_title}
            onChange={(e) => onFieldChange("contact_title", e.target.value)}
            placeholder="Enter contact title"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`address-${index}`}>Address</Label>
        <Input
          id={`address-${index}`}
          value={vendor.address}
          onChange={(e) => onFieldChange("address", e.target.value)}
          placeholder="Enter address"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor={`city-${index}`}>City</Label>
          <Input
            id={`city-${index}`}
            value={vendor.city}
            onChange={(e) => onFieldChange("city", e.target.value)}
            placeholder="Enter city"
          />
        </div>
        <div>
          <Label htmlFor={`state-${index}`}>State</Label>
          <Input
            id={`state-${index}`}
            value={vendor.state}
            onChange={(e) => onFieldChange("state", e.target.value)}
            placeholder="Enter state"
          />
        </div>
        <div>
          <Label htmlFor={`zip-${index}`}>ZIP Code</Label>
          <Input
            id={`zip-${index}`}
            value={vendor.zip_code}
            onChange={(e) => onFieldChange("zip_code", e.target.value)}
            placeholder="Enter ZIP"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`website-${index}`}>Website</Label>
        <Input
          id={`website-${index}`}
          value={vendor.website}
          onChange={(e) => onFieldChange("website", e.target.value)}
          placeholder="Enter website URL"
        />
      </div>

      <div>
        <Label htmlFor={`description-${index}`}>Description</Label>
        <Textarea
          id={`description-${index}`}
          value={vendor.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
          placeholder="Enter description"
          rows={3}
        />
      </div>
    </CardContent>
  );
};
