
import React from "react";
import VendorEmptyState from "./VendorEmptyState";
import VendorSelectAllHeader from "./VendorSelectAllHeader";
import VendorCard from "./VendorCard";
import VendorGridSkeleton from "./VendorGridSkeleton";
import { Vendor } from "@/services/vendorService";

interface VendorGridViewProps {
  vendors?: Vendor[];
  isLoading: boolean;
  error: any;
  hasFilters: boolean;
  isDeleting: boolean;
  selectedVendors: string[];
  onDeleteVendor: (vendorId: string) => void;
  onToggleSelection: (vendorId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

const VendorGridView: React.FC<VendorGridViewProps> = ({
  vendors,
  isLoading,
  error,
  hasFilters,
  isDeleting,
  selectedVendors,
  onDeleteVendor,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
}) => {
  if (isLoading) {
    return <VendorGridSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-red-500 dark:text-red-400">Error loading vendors.</p>
      </div>
    );
  }

  if (!vendors?.length) {
    return <VendorEmptyState hasFilters={hasFilters} />;
  }

  return (
    <div className="space-y-4">
      <VendorSelectAllHeader
        vendorsCount={vendors.length}
        selectedCount={selectedVendors.length}
        onSelectAll={onSelectAll}
        onClearSelection={onClearSelection}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            isSelected={selectedVendors.includes(vendor.id)}
            isDeleting={isDeleting}
            onDeleteVendor={onDeleteVendor}
            onToggleSelection={onToggleSelection}
          />
        ))}
      </div>
    </div>
  );
};

export default VendorGridView;
