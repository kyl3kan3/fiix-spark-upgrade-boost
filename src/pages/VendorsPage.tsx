
import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import VendorPageHeader from "@/components/vendors/VendorPageHeader";
import VendorFilters from "@/components/vendors/VendorFilters";
import VendorGridView from "@/components/vendors/VendorGridView";
import VendorEmptyState from "@/components/vendors/VendorEmptyState";
import { getAllVendors, deleteVendor } from "@/services/vendorService";

const VendorsPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    status: "all",
  });
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  const queryClient = useQueryClient();
  const { data: vendors = [], isLoading, error } = useQuery({
    queryKey: ["vendors"],
    queryFn: getAllVendors,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor deleted");
    },
    onError: (err: any) => {
      toast.error("Failed to delete vendor", { description: err?.message });
    },
  });

  const statusOptions = ["active", "inactive", "pending"];
  const typeOptions = ["supplier", "contractor", "service", "maintenance"];

  const filteredVendors = vendors.filter((vendor: any) => {
    const matchesSearch = !filters.search || 
      vendor.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(vendor.status);
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(vendor.vendor_type);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

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

  const handleToggleSelection = (vendorId: string) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSelectAll = () => {
    setSelectedVendors(vendors.map((v: any) => v.id));
  };

  const handleClearSelection = () => {
    setSelectedVendors([]);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 px-4 pb-6 pt-4 sm:space-y-6 md:px-6 lg:px-8">
          <BackToDashboard />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maintenease-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 px-4 pb-6 pt-4 sm:space-y-6 md:px-6 lg:px-8">
        <BackToDashboard />
        
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <VendorPageHeader />
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:justify-end">
            <Link to="/vendors/import" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                <span className="text-sm sm:text-base">Import</span>
              </Button>
            </Link>
            <Link to="/vendors/new" className="w-full sm:w-auto">
              <Button className="bg-maintenease-600 hover:bg-maintenease-700 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="text-sm sm:text-base">Add Vendor</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <VendorFilters 
            searchQuery={filters.search}
            onSearchChange={handleSearchChange}
            statusOptions={statusOptions}
            selectedStatus={selectedStatus}
            onStatusToggle={handleStatusToggle}
            typeOptions={typeOptions}
            selectedTypes={selectedTypes}
            onTypeToggle={handleTypeToggle}
          />
          
          {filteredVendors.length === 0 ? (
            <VendorEmptyState hasFilters={!!filters.search || selectedStatus.length > 0 || selectedTypes.length > 0} />
          ) : (
            <VendorGridView 
              vendors={filteredVendors}
              isLoading={false}
              error={error}
              hasFilters={!!filters.search || selectedStatus.length > 0 || selectedTypes.length > 0}
              isDeleting={deleteMutation.isPending}
              selectedVendors={selectedVendors}
              onDeleteVendor={(id) => deleteMutation.mutate(id)}
              onToggleSelection={handleToggleSelection}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorsPage;
