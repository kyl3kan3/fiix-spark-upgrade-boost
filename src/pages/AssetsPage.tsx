
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, Plus, Search, List, Grid3X3, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllAssets, getAssetHierarchy } from "@/services/assetService";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { AssetHierarchyView } from "@/components/workOrders/assets/AssetHierarchyView";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AssetsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "hierarchy">("grid");
  const [assetCategories, setAssetCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
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
    queryFn: getAllAssets
  });

  // Fetch hierarchical data
  const { data: hierarchyData, isLoading: hierarchyLoading, error: hierarchyError } = useQuery({
    queryKey: ["assetHierarchy"],
    queryFn: getAssetHierarchy
  });
  
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

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <BackToDashboard />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assets</h1>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search assets..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {assetCategories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="whitespace-nowrap">
                    <Filter className="mr-2 h-4 w-4" />
                    Categories
                    {selectedCategories.length > 0 && (
                      <Badge variant="secondary" className="ml-2 rounded-full">
                        {selectedCategories.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {assetCategories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Link to="/assets/new">
              <Button className="whitespace-nowrap bg-blue-500 hover:bg-blue-600 text-white font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </Link>
          </div>
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
            {assetsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <Skeleton className="h-6 w-3/4 mb-4 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-1/2 mb-2 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700" />
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-red-500 dark:text-red-400">Error loading assets.</p>
              </div>
            ) : filteredAssets?.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No assets found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery || selectedCategories.length > 0 
                    ? "Try adjusting your search or filters." 
                    : "Get started by creating a new asset."}
                </p>
                <div className="mt-6">
                  <Link to="/assets/new">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium">
                      <Plus className="mr-2 h-4 w-4" />
                      New Asset
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets?.map((asset) => (
                  <Link to={`/assets/edit/${asset.id}`} key={asset.id} className="block">
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start">
                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
                          <Package className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{asset.name}</h3>
                          {asset.location && (
                            <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <p className="text-sm">{asset.location}</p>
                            </div>
                          )}
                          
                          {/* Temporarily removed category badge since it doesn't exist in the asset type */}
                          
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              asset.status === "operational" ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" :
                              asset.status === "maintenance" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100" :
                              "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                            }`}>
                              {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="hierarchy" className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mt-4">
            <AssetHierarchyView assets={hierarchyData || []} isLoading={hierarchyLoading} />
          </TabsContent>
        </Tabs>
        
        {/* Fixed position Add Asset button */}
        <div className="fixed bottom-8 right-8 z-40">
          <Link to="/assets/new">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssetsPage;
