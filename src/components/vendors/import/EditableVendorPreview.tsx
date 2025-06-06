
import React, { useState } from "react";
import { VendorFormData } from "@/services/vendorService";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VendorCard } from "./VendorCard";
import { VendorPreviewHeader } from "./VendorPreviewHeader";

interface EditableVendorPreviewProps {
  parsedData: VendorFormData[];
  onDataChange: (updatedData: VendorFormData[]) => void;
}

const EditableVendorPreview: React.FC<EditableVendorPreviewProps> = ({
  parsedData,
  onDataChange,
}) => {
  const [vendors, setVendors] = useState<VendorFormData[]>(parsedData);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const updateVendor = (index: number, field: keyof VendorFormData, value: any) => {
    const updatedVendors = [...vendors];
    updatedVendors[index] = { ...updatedVendors[index], [field]: value };
    setVendors(updatedVendors);
    onDataChange(updatedVendors);
  };

  const handleFieldRemap = (index: number, fromField: keyof VendorFormData, toField: keyof VendorFormData, value: string) => {
    const updatedVendors = [...vendors];
    const vendor = { ...updatedVendors[index] };
    
    // Clear the old field
    (vendor as any)[fromField] = "";
    
    // Set the new field, combining with existing value if any
    const existingValue = (vendor as any)[toField] || "";
    const newValue = existingValue ? `${existingValue}, ${value}` : value;
    (vendor as any)[toField] = newValue;
    
    updatedVendors[index] = vendor;
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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newVendors = [...vendors];
    const draggedVendor = newVendors[draggedIndex];
    
    newVendors.splice(draggedIndex, 1);
    newVendors.splice(index, 0, draggedVendor);
    
    setVendors(newVendors);
    onDataChange(newVendors);
    setDraggedIndex(index);
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
      <VendorPreviewHeader
        vendorCount={vendors.length}
        onAddVendor={addNewVendor}
      />
      
      <ScrollArea className="h-96">
        <div className="space-y-4 pr-4">
          {vendors.map((vendor, index) => (
            <VendorCard
              key={index}
              vendor={vendor}
              index={index}
              isDragging={draggedIndex === index}
              onFieldChange={(field, value) => updateVendor(index, field, value)}
              onFieldRemap={(fromField, toField, value) => handleFieldRemap(index, fromField, toField, value)}
              onRemoveVendor={() => removeVendor(index)}
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EditableVendorPreview;
