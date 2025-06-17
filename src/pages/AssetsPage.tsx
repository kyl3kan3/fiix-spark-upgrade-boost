
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
import { useQuery } from "@tanstack/react-query";
import { assetQueries } from "@/services/assets";

const AssetsPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    location: "all",
  });

  const { data: assets = [], isLoading } = useQuery(assetQueries.list());

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = !filters.search || 
      asset.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      asset.serial_number?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === "all" || asset.status === filters.status;
    const matchesCategory = filters.category === "all" || asset.category === filters.category;
    
    return matchesSearch && matchesStatus && matchesCategory;
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
          <AssetPageHeader />
          <Link to="/assets/new">
            <Button className="bg-maintenease-600 hover:bg-maintenease-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Add Asset</span>
            </Button>
          </Link>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <AssetFilters filters={filters} setFilters={setFilters} />
          
          {filteredAssets.length === 0 ? (
            <AssetEmptyState hasAssets={assets.length > 0} />
          ) : (
            <AssetGridView assets={filteredAssets} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssetsPage;
