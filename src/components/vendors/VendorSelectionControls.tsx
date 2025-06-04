
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

  const handleBulkDelete = () => {
    console.log("Bulk delete triggered for vendors:", selectedVendors);
    onBulkDelete();
  };

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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm" 
              disabled={isDeleting || isBulkDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isBulkDeleting ? "Deleting..." : `Delete Selected (${selectedVendors.length})`}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Selected Vendors</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedVendors.length} vendor{selectedVendors.length !== 1 ? 's' : ''}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                disabled={isDeleting || isBulkDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isBulkDeleting ? "Deleting..." : `Delete ${selectedVendors.length} Vendor${selectedVendors.length !== 1 ? 's' : ''}`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default VendorSelectionControls;
