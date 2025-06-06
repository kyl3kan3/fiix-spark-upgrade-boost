
import React, { useState } from "react";
import { VendorFormData } from "@/services/vendorService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditableVendorPreviewProps {
  parsedData: VendorFormData[];
  onDataChange: (updatedData: VendorFormData[]) => void;
}

const EditableVendorPreview: React.FC<EditableVendorPreviewProps> = ({
  parsedData,
  onDataChange,
}) => {
  const [vendors, setVendors] = useState<VendorFormData[]>(parsedData);

  const updateVendor = (index: number, field: keyof VendorFormData, value: any) => {
    const updatedVendors = [...vendors];
    updatedVendors[index] = { ...updatedVendors[index], [field]: value };
    setVendors(updatedVendors);
    onDataChange(updatedVendors);
  };

  const removeVendor = (index: number) => {
    const updatedVendors = vendors.filter((_, i) => i !== index);
    setVendors(updatedVendors);
    onDataChange(updatedVendors);
  };

  const addNewVendor = () => {
    const newVendor: VendorFormData = {
      name: "",
      email: "",
      phone: "",
      contact_person: "",
      contact_title: "",
      vendor_type: "service",
      status: "active",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      website: "",
      description: "",
      rating: null,
    };
    const updatedVendors = [...vendors, newVendor];
    setVendors(updatedVendors);
    onDataChange(updatedVendors);
  };

  if (vendors.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No vendors found</p>
        <Button onClick={addNewVendor} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Vendor Manually
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Review and Edit Vendors ({vendors.length} found)</h4>
        <Button onClick={addNewVendor} size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>
      
      <ScrollArea className="h-96">
        <div className="space-y-4 pr-4">
          {vendors.map((vendor, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">Vendor {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVendor(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${index}`}>Company Name *</Label>
                    <Input
                      id={`name-${index}`}
                      value={vendor.name}
                      onChange={(e) => updateVendor(index, "name", e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`email-${index}`}>Email</Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      value={vendor.email}
                      onChange={(e) => updateVendor(index, "email", e.target.value)}
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
                      onChange={(e) => updateVendor(index, "phone", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`contact-${index}`}>Contact Person</Label>
                    <Input
                      id={`contact-${index}`}
                      value={vendor.contact_person}
                      onChange={(e) => updateVendor(index, "contact_person", e.target.value)}
                      placeholder="Enter contact person"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`type-${index}`}>Vendor Type</Label>
                    <Select
                      value={vendor.vendor_type}
                      onValueChange={(value) => updateVendor(index, "vendor_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="consultant">Consultant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`status-${index}`}>Status</Label>
                    <Select
                      value={vendor.status}
                      onValueChange={(value) => updateVendor(index, "status", value)}
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
                </div>

                <div>
                  <Label htmlFor={`address-${index}`}>Address</Label>
                  <Input
                    id={`address-${index}`}
                    value={vendor.address}
                    onChange={(e) => updateVendor(index, "address", e.target.value)}
                    placeholder="Enter address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`city-${index}`}>City</Label>
                    <Input
                      id={`city-${index}`}
                      value={vendor.city}
                      onChange={(e) => updateVendor(index, "city", e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`state-${index}`}>State</Label>
                    <Input
                      id={`state-${index}`}
                      value={vendor.state}
                      onChange={(e) => updateVendor(index, "state", e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`zip-${index}`}>ZIP Code</Label>
                    <Input
                      id={`zip-${index}`}
                      value={vendor.zip_code}
                      onChange={(e) => updateVendor(index, "zip_code", e.target.value)}
                      placeholder="Enter ZIP"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`website-${index}`}>Website</Label>
                  <Input
                    id={`website-${index}`}
                    value={vendor.website}
                    onChange={(e) => updateVendor(index, "website", e.target.value)}
                    placeholder="Enter website URL"
                  />
                </div>

                <div>
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={vendor.description}
                    onChange={(e) => updateVendor(index, "description", e.target.value)}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EditableVendorPreview;
