
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VendorPreviewHeaderProps {
  vendorCount: number;
  onAddVendor: () => void;
}

export const VendorPreviewHeader: React.FC<VendorPreviewHeaderProps> = ({
  vendorCount,
  onAddVendor,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Review & Edit Vendors</h3>
          <Badge variant="outline">{vendorCount} found</Badge>
        </div>
        <Button onClick={onAddVendor} size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Use the field mapping section in each vendor card to correct any misplaced information. 
          You can drag items between fields or manually edit the data.
        </AlertDescription>
      </Alert>
    </div>
  );
};
