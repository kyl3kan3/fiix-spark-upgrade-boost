
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllVendors } from "@/services/vendorService";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useVendorActions } from "@/hooks/vendors/useVendorActions";
import { useVendorSelection } from "@/hooks/vendors/useVendorSelection";
import { useVendorBulkActions } from "@/hooks/vendors/useVendorBulkActions";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";
import VendorPageHeader from "@/components/vendors/VendorPageHeader";
import VendorFilters from "@/components/vendors/VendorFilters";
import VendorPageActions from "@/components/vendors/VendorPageActions";
import VendorSelectionControls from "@/components/vendors/VendorSelectionControls";
import VendorBulkActions from "@/components/vendors/VendorBulkActions";
import VendorContentTabs from "@/components/vendors/VendorContentTabs";
import AddVendorButton from "@/components/vendors/AddVendorButton";
import { toast } from "sonner";

const VendorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { isDeleting, handleDeleteVendor } = useVendorActions();
  const { currentUserRole } = useUserRolePermissions();
  const {
    selectedVendors,
    handleVendorSelection,
    handleSelectAll,
    clearSelection,
    isAllSelected
  } = useVendorSelection();
  const {
    isBulkDeleting,
    handleBulkDelete,
    handleBulkStatusChange,
    handleBulkExport
  } = useVendorBulkActions();
  
  const canAdd = currentUserRole === 'administrator' || currentUserRole === 'manager';
  const canDelete = currentUserRole === 'administrator'; // Only administrators can delete
  
  // Fetch vendors
  const { data: vendors, isLoading, error } = useQuery({
    queryKey: ["vendors"],
    queryFn: getAllVendors
  });
  
  // Filter handlers
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

  // Filtered vendors calculation
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
    console.error("Error loading vendors:", error);
    toast.error("Failed to load vendors", { 
      description: "There was an error loading the vendor data."
    });
  }

  const hasFilters = searchQuery !== "" || selectedStatus.length > 0 || selectedTypes.length > 0;
  const statusOptions = ["active", "inactive", "suspended"];
  const typeOptions = ["service", "supplier", "contractor", "consultant"];
  const allSelected = isAllSelected(filteredVendors);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <VendorPageHeader />
        
        {/* Filters and actions */}
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
          
          <VendorPageActions
            onExport={() => handleBulkExport(vendors, selectedVendors)}
          />
        </div>

        {/* Select All and Bulk Actions */}
        <VendorSelectionControls
          filteredVendors={filteredVendors}
          selectedVendors={selectedVendors}
          allSelected={allSelected}
          onSelectAll={() => handleSelectAll(filteredVendors)}
          onBulkDelete={() => handleBulkDelete(selectedVendors, clearSelection)}
          canDelete={canDelete}
          isDeleting={isDeleting}
          isBulkDeleting={isBulkDeleting}
        />

        {/* Bulk actions */}
        <VendorBulkActions
          selectedCount={selectedVendors.length}
          onBulkDelete={() => handleBulkDelete(selectedVendors, clearSelection)}
          onBulkStatusChange={(status) => handleBulkStatusChange(status, selectedVendors, clearSelection)}
          onBulkExport={() => handleBulkExport(vendors, selectedVendors)}
          onClearSelection={clearSelection}
        />

        {/* Content tabs */}
        <VendorContentTabs
          viewMode={viewMode}
          onViewModeChange={(value) => setViewMode(value as "grid" | "list")}
          filteredVendors={filteredVendors}
          isLoading={isLoading}
          error={error}
          hasFilters={hasFilters}
          isDeleting={isDeleting}
          onDeleteVendor={handleDeleteVendor}
          selectedVendors={selectedVendors}
          onVendorSelection={handleVendorSelection}
          isBulkDeleting={isBulkDeleting}
        />
        
        {/* Fixed position Add Vendor button */}
        <AddVendorButton canAdd={canAdd} />
      </div>
    </DashboardLayout>
  );
};

export default VendorsPage;
