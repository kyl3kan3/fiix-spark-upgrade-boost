
import React from "react";
import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Vendor } from "@/services/vendorService";
import VendorCardInfo from "./VendorCardInfo";
import VendorCardActions from "./VendorCardActions";

interface VendorCardProps {
  vendor: Vendor;
  isDeleting: boolean;
  onDeleteVendor: (vendorId: string) => void;
  selectedVendors?: string[];
  onVendorSelection?: (vendorId: string, selected: boolean) => void;
}

const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  isDeleting,
  onDeleteVendor,
  selectedVendors = [],
  onVendorSelection,
}) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative group">
      {onVendorSelection && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={selectedVendors.includes(vendor.id)}
            onCheckedChange={(checked) => onVendorSelection(vendor.id, !!checked)}
          />
        </div>
      )}
      
      <div className="flex items-start">
        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
        </div>
        
        <VendorCardInfo vendor={vendor} />
        
        <VendorCardActions
          vendorId={vendor.id}
          vendorName={vendor.name}
          isDeleting={isDeleting}
          onDeleteVendor={onDeleteVendor}
        />
      </div>
    </Card>
  );
};

export default VendorCard;
