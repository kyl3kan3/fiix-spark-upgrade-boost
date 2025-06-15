import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, List, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllAssets, getAssetHierarchy } from "@/services/assetService";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { AssetHierarchyView } from "@/components/workOrders/assets/AssetHierarchyView";
import { useAssetActions } from "@/hooks/assets/useAssetActions";
import { toast } from "sonner";
import AssetPageHeader from "@/components/assets/AssetPageHeader";
import AssetFilters from "@/components/assets/AssetFilters";
import AssetGridView from "@/components/assets/AssetGridView";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";

const AssetsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "hierarchy">("grid");
  const [assetCategories, setAssetCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const { isDeleting, handleDeleteAsset } = useAssetActions();
  const { currentUserRole } = useUserRolePermissions();
  const canAdd = currentUserRole === 'administrator' || currentUserRole === 'manager';
  
  // Load asset categories from setup data
  useEffect(() => {
    try {
      const setupData = localStorage.getItem('maintenease_setup');
      if (setupData) {
        const parsedData = JSON.parse(setupData);
        const categories = parsedData?.assetCategories?.categories || [];
        if (Array.isArray(categories) && categories.length > 0) {
          setAssetCategories(categories.map(cat => cat.name || cat));
        }
      }
    } catch (error) {
      console.error("Error loading asset categories from setup:", error);
    }
  }, []);
  
  // Fetch flat list of assets
  const { data: assets, isLoading: assetsLoading, error: assetsError } = useQuery({
    queryKey: ["assets"],
    queryFn: getAllAssets,
  });

  // Fetch hierarchical data
  const { data: hierarchyData, isLoading: hierarchyLoading, error: hierarchyError } = useQuery({
    queryKey: ["assetHierarchy"],
    queryFn: getAssetHierarchy,
  });

  console.log('🔍 AssetsPage render - assets:', assets);
  console.log('🔍 AssetsPage render - hierarchyData:', hierarchyData);
  
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };
  
  const filteredAssets = assets?.filter(asset => 
    (searchQuery === "" || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.location && asset.location.toLowerCase().includes(searchQuery.toLowerCase()))
    ) && 
    (selectedCategories.length === 0 || 
      // Since category doesn't exist in the asset type, we need to handle this differently
      // For now, we'll just include all assets if categories are selected
      // Later we can add a category field to the asset table in the database
      selectedCategories.length === 0
    )
  );

  const handleViewChange = (value: string) => {
    setViewMode(value as "grid" | "hierarchy");
  };

  const error = assetsError || hierarchyError;
  if (error) {
    toast.error("Failed to load assets", { 
      description: "There was an error loading the asset data."
    });
  }

  const hasFilters = searchQuery !== "" || selectedCategories.length > 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <AssetPageHeader />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <AssetFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            assetCategories={assetCategories}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
          />
        </div>

        <Tabs defaultValue="grid" className="w-full" onValueChange={handleViewChange}>
          <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger 
              value="grid" 
              className="flex items-center text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-black dark:data-[state=active]:text-white"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Grid View
            </TabsTrigger>
            <TabsTrigger 
              value="hierarchy" 
              className="flex items-center text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-black dark:data-[state=active]:text-white"
            >
              <List className="h-4 w-4 mr-2" />
              Hierarchy View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="mt-4">
            <AssetGridView
              assets={filteredAssets}
              isLoading={assetsLoading}
              error={error}
              hasFilters={hasFilters}
              isDeleting={isDeleting}
              onDeleteAsset={handleDeleteAsset}
            />
          </TabsContent>
          
          <TabsContent value="hierarchy" className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mt-4">
            <AssetHierarchyView 
              assets={hierarchyData || []} 
              isLoading={hierarchyLoading}
              isDeleting={isDeleting}
              onDeleteAsset={handleDeleteAsset}
            />
          </TabsContent>
        </Tabs>
        
        {/* Fixed position Add Asset button - only show for admins and managers */}
        {canAdd && (
          <div className="fixed bottom-8 right-8 z-40">
            <Link to="/assets/new">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg">
                <Plus className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssetsPage;
