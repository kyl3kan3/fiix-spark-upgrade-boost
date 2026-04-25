
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import AssetFilters from "@/components/assets/AssetFilters";
import AssetGridView from "@/components/assets/AssetGridView";
import AssetEmptyState from "@/components/assets/AssetEmptyState";

const AssetsPage = () => {
  const navigate = useNavigate();
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
        <PageHeader code="AST · INDEX" title="Assets" />
        <div className="flex items-center justify-center h-64 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Loading…
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        code="AST · INDEX"
        title="Assets"
        description="Equipment, vehicles, facilities, and tools — by location and status."
        actions={
          <Button variant="accent" size="sm" onClick={() => navigate("/assets/new")}>
            <Plus className="h-3.5 w-3.5" />Add Asset
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
