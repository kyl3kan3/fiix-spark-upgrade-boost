
import React from "react";
import { VendorFormData } from "@/services/vendorService";
import { Card } from "@/components/ui/card";
import { Draggable } from "@/components/ui/draggable";
import { VendorCardHeader } from "./VendorCardHeader";
import { VendorCardFields } from "./VendorCardFields";

interface VendorCardProps {
  vendor: VendorFormData;
  index: number;
  isDragging: boolean;
  onFieldChange: (field: keyof VendorFormData, value: any) => void;
  onRemoveVendor: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
}

export const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  index,
  isDragging,
  onFieldChange,
  onRemoveVendor,
  onDragStart,
  onDragEnd,
  onDragOver,
}) => {
  return (
    <Draggable onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <Card 
        className={`relative transition-all duration-200 ${
          isDragging ? 'opacity-50 transform rotate-2' : 'hover:shadow-md'
        }`}
        onDragOver={onDragOver}
      >
        <VendorCardHeader
          index={index}
          vendorType={vendor.vendor_type}
          onVendorTypeChange={(value) => onFieldChange("vendor_type", value)}
          onRemoveVendor={onRemoveVendor}
          isDragging={isDragging}
        />
        <VendorCardFields
          vendor={vendor}
          index={index}
          onFieldChange={onFieldChange}
        />
      </Card>
    </Draggable>
  );
};
