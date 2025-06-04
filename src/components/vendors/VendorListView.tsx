
import React from "react";
import { type Vendor } from "@/services/vendorService";
import VendorListCard from "./list-view/VendorListCard";
import VendorListLoading from "./list-view/VendorListLoading";
import VendorListError from "./list-view/VendorListError";
import VendorListEmptyState from "./list-view/VendorListEmptyState";

interface VendorListViewProps {
  vendors: Vendor[] | undefined;
  isLoading: boolean;
  error: any;
  hasFilters: boolean;
  isDeleting: boolean;
  onDeleteVendor: (vendorId: string) => void;
  selectedVendors?: string[];
  onVendorSelection?: (vendorId: string, selected: boolean) => void;
}

const VendorListView: React.FC<VendorListViewProps> = ({
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
    return <VendorListLoading />;
  }

  if (error) {
    return <VendorListError />;
  }

  if (!vendors || vendors.length === 0) {
    return <VendorListEmptyState hasFilters={hasFilters} />;
  }

  return (
    <div className="space-y-4">
      {vendors.map((vendor) => (
        <VendorListCard
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

export default VendorListView;
