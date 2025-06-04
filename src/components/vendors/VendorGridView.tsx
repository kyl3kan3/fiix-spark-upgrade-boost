
import React from "react";
import { Vendor } from "@/services/vendorService";
import VendorEmptyState from "./VendorEmptyState";
import VendorCard from "./grid-view/VendorCard";
import VendorGridLoading from "./grid-view/VendorGridLoading";
import VendorGridError from "./grid-view/VendorGridError";

interface VendorGridViewProps {
  vendors?: Vendor[];
  isLoading: boolean;
  error: any;
  hasFilters: boolean;
  isDeleting: boolean;
  onDeleteVendor: (vendorId: string) => void;
  selectedVendors?: string[];
  onVendorSelection?: (vendorId: string, selected: boolean) => void;
}

const VendorGridView: React.FC<VendorGridViewProps> = ({
  vendors,
  isLoading,
  error,
  hasFilters,
  isDeleting,
  onDeleteVendor,
  selectedVendors = [],
  onVendorSelection,
}) => {
  if (isLoading) {
    return <VendorGridLoading />;
  }

  if (error) {
    return <VendorGridError />;
  }

  if (!vendors?.length) {
    return <VendorEmptyState hasFilters={hasFilters} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vendors.map((vendor) => (
        <VendorCard
          key={vendor.id}
          vendor={vendor}
          isDeleting={isDeleting}
          onDeleteVendor={onDeleteVendor}
          selectedVendors={selectedVendors}
          onVendorSelection={onVendorSelection}
        />
      ))}
    </div>
  );
};

export default VendorGridView;
