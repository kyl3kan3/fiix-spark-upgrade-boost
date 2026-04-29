
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import AssetFilters from "@/components/assets/AssetFilters";
import AssetGridView from "@/components/assets/AssetGridView";
import AssetEmptyState from "@/components/assets/AssetEmptyState";
import { getAllAssets } from "@/services/assets/assetQueries";

const AssetsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    location: "all",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { data: assets = [], isLoading, error } = useQuery({
    queryKey: ["assets"],
    queryFn: getAllAssets,
  });
  const assetCategories = ["Equipment", "Vehicles", "Facilities", "Tools"];

  const filteredAssets = assets.filter((asset: any) => {
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
        <PageHeader title="Equipment" />
        <div className="flex items-center justify-center h-64 text-sm font-semibold text-muted-foreground">
          Loading…
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Equipment"
        description="Everything you take care of — tools, vehicles, machines, and more."
        actions={
          <Button variant="accent" size="lg" onClick={() => navigate("/assets/new")}>
            <Plus className="h-5 w-5" />Add Equipment
          </Button>
        }
      />
      <div className="px-4 md:px-6 lg:px-8 py-6">
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
              error={error}
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
