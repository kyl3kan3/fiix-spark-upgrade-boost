
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface VendorPreviewHeaderProps {
  vendorCount: number;
  onAddVendor: () => void;
}

export const VendorPreviewHeader: React.FC<VendorPreviewHeaderProps> = ({
  vendorCount,
  onAddVendor,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h4 className="font-medium">Review and Edit Vendors ({vendorCount} found)</h4>
        <p className="text-sm text-gray-500 mt-1">Drag vendors to reorder, change categories, or edit details</p>
      </div>
      <Button onClick={onAddVendor} size="sm" className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Vendor
      </Button>
    </div>
  );
};
