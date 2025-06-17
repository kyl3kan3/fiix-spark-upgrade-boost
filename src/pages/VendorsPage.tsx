
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import VendorPageHeader from "@/components/vendors/VendorPageHeader";
import VendorFilters from "@/components/vendors/VendorFilters";
import VendorGridView from "@/components/vendors/VendorGridView";
import VendorEmptyState from "@/components/vendors/VendorEmptyState";
import { useQuery } from "@tanstack/react-query";
import { vendorService } from "@/services/vendorService";

const VendorsPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    status: "all",
  });

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendorService.getVendors,
  });

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = !filters.search || 
      vendor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = filters.category === "all" || vendor.category === filters.category;
    const matchesStatus = filters.status === "all" || vendor.status === filters.status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6">
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
      <div className="space-y-4 sm:space-y-6">
        <BackToDashboard />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <VendorPageHeader />
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
          <VendorFilters filters={filters} setFilters={setFilters} />
          
          {filteredVendors.length === 0 ? (
            <VendorEmptyState hasVendors={vendors.length > 0} />
          ) : (
            <VendorGridView vendors={filteredVendors} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorsPage;
