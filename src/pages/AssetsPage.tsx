
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import AssetPageHeader from "@/components/assets/AssetPageHeader";
import AssetFilters from "@/components/assets/AssetFilters";
import AssetGridView from "@/components/assets/AssetGridView";
import AssetEmptyState from "@/components/assets/AssetEmptyState";

const AssetsPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    location: "all",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Mock data for now - will be replaced with actual query
  const assets: any[] = [];
  const isLoading = false;
  const assetCategories = ["Equipment", "Vehicles", "Facilities", "Tools"];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = !filters.search || 
      asset.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      asset.serial_number?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === "all" || asset.status === filters.status;
    const matchesCategory = filters.category === "all" || asset.category === filters.category;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

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
          <AssetPageHeader />
          <Link to="/assets/new">
            <Button className="bg-maintenease-600 hover:bg-maintenease-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Add Asset</span>
            </Button>
          </Link>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <AssetFilters 
            searchQuery={filters.search}
            onSearchChange={handleSearchChange}
            assetCategories={assetCategories}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
          />
          
          {filteredAssets.length === 0 ? (
            <AssetEmptyState hasFilters={!!filters.search || selectedCategories.length > 0} />
          ) : (
            <AssetGridView 
              assets={filteredAssets}
              isLoading={false}
              error={null}
              hasFilters={!!filters.search || selectedCategories.length > 0}
              isDeleting={false}
              onDeleteAsset={() => {}}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssetsPage;
