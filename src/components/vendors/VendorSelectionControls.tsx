
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { type Vendor } from "@/services/vendorService";

interface VendorSelectionControlsProps {
  filteredVendors: Vendor[] | undefined;
  selectedVendors: string[];
  allSelected: boolean;
  onSelectAll: () => void;
  onBulkDelete: () => void;
  canDelete: boolean;
  isDeleting: boolean;
  isBulkDeleting: boolean;
}

const VendorSelectionControls: React.FC<VendorSelectionControlsProps> = ({
  filteredVendors,
  selectedVendors,
  allSelected,
  onSelectAll,
  onBulkDelete,
  canDelete,
  isDeleting,
  isBulkDeleting,
}) => {
  if (!filteredVendors || filteredVendors.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onSelectAll}
        />
        <span className="text-sm font-medium">
          {allSelected ? 'Deselect All' : 'Select All'} ({filteredVendors.length} vendors)
        </span>
        {selectedVendors.length > 0 && (
          <span className="text-sm text-blue-600">
            ({selectedVendors.length} selected)
          </span>
        )}
      </div>
      
      {selectedVendors.length > 0 && canDelete && (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onBulkDelete}
          disabled={isDeleting || isBulkDeleting}
        >
          {isBulkDeleting ? "Deleting..." : `Delete Selected (${selectedVendors.length})`}
        </Button>
      )}
    </div>
  );
};

export default VendorSelectionControls;
