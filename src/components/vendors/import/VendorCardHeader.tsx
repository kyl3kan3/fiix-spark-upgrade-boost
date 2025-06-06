
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Move } from "lucide-react";

interface VendorCardHeaderProps {
  index: number;
  vendorType: string;
  onVendorTypeChange: (value: string) => void;
  onRemoveVendor: () => void;
  isDragging: boolean;
}

const vendorTypeOptions = [
  { value: "service", label: "Service Provider" },
  { value: "supplier", label: "Supplier" },
  { value: "contractor", label: "Contractor" },
  { value: "consultant", label: "Consultant" },
];

export const VendorCardHeader: React.FC<VendorCardHeaderProps> = ({
  index,
  vendorType,
  onVendorTypeChange,
  onRemoveVendor,
  isDragging,
}) => {
  return (
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4 text-gray-400 cursor-move" />
          <CardTitle className="text-base">Vendor {index + 1}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <div className="min-w-[140px]">
            <Select value={vendorType} onValueChange={onVendorTypeChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vendorTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemoveVendor}
            className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};
