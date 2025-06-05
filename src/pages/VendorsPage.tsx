
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllVendors } from "@/services/vendorService";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useVendorActions } from "@/hooks/vendors/useVendorActions";
import VendorPageHeader from "@/components/vendors/VendorPageHeader";
import VendorPageActions from "@/components/vendors/VendorPageActions";
import VendorFilters from "@/components/vendors/VendorFilters";
import VendorGridView from "@/components/vendors/VendorGridView";
import { toast } from "sonner";

const VendorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  const { 
    isDeleting, 
    selectedVendors,
    handleDeleteVendor,
    handleBulkDelete,
    toggleVendorSelection,
    selectAllVendors,
    clearSelection
  } = useVendorActions();
  
  // Fetch vendors
  const { data: vendors, isLoading, error } = useQuery({
    queryKey: ["vendors"],
    queryFn: getAllVendors
  });
  
  const handleStatusToggle = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };
  
  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const filteredVendors = vendors?.filter(vendor => 
    (searchQuery === "" || 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.contact_person && vendor.contact_person.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vendor.email && vendor.email.toLowerCase().includes(searchQuery.toLowerCase()))
    ) && 
    (selectedStatus.length === 0 || selectedStatus.includes(vendor.status)) &&
    (selectedTypes.length === 0 || selectedTypes.includes(vendor.vendor_type))
  );

  if (error) {
    toast.error("Failed to load vendors", { 
      description: "There was an error loading the vendor data."
    });
  }

  const hasFilters = searchQuery !== "" || selectedStatus.length > 0 || selectedTypes.length > 0;
  const statusOptions = ["active", "inactive", "suspended"];
  const typeOptions = ["service", "supplier", "contractor", "consultant"];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <VendorPageHeader />
        
        {/* Action Buttons */}
        <div className="mb-6">
          <VendorPageActions
            selectedCount={selectedVendors.length}
            onBulkDelete={handleBulkDelete}
            onClearSelection={clearSelection}
            isDeleting={isDeleting}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <VendorFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusOptions={statusOptions}
            selectedStatus={selectedStatus}
            onStatusToggle={handleStatusToggle}
            typeOptions={typeOptions}
            selectedTypes={selectedTypes}
            onTypeToggle={handleTypeToggle}
          />
        </div>

        {/* Vendor Grid */}
        <VendorGridView
          vendors={filteredVendors}
          isLoading={isLoading}
          error={error}
          hasFilters={hasFilters}
          isDeleting={isDeleting}
          selectedVendors={selectedVendors}
          onDeleteVendor={handleDeleteVendor}
          onToggleSelection={toggleVendorSelection}
          onSelectAll={() => selectAllVendors(filteredVendors?.map(v => v.id) || [])}
          onClearSelection={clearSelection}
        />
      </div>
    </DashboardLayout>
  );
};

export default VendorsPage;
