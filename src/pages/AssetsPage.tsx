
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, Plus, Search, List, Grid3X3, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllAssets, getAssetHierarchy } from "@/services/assetService";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { AssetHierarchyView } from "@/components/workOrders/assets/AssetHierarchyView";
import { toast } from "@/components/ui/use-toast";

const AssetsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "hierarchy">("grid");
  
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
  
  const filteredAssets = assets?.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (asset.location && asset.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleViewChange = (value: string) => {
    setViewMode(value as "grid" | "hierarchy");
  };

  const error = assetsError || hierarchyError;
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load assets. There was an error loading the asset data.",
      variant: "destructive",
    });
  }

  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search assets..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link to="/assets/new">
            <Button className="whitespace-nowrap bg-fiix-500 hover:bg-fiix-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full" onValueChange={handleViewChange}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="hierarchy" className="flex items-center">
              <List className="h-4 w-4 mr-2" />
              Hierarchy View
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="grid">
          {assetsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading assets.</p>
            </div>
          ) : filteredAssets?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No assets found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new asset.
              </p>
              <div className="mt-6">
                <Link to="/assets/new">
                  <Button className="bg-fiix-500 hover:bg-fiix-600">
                    <Plus className="mr-2 h-4 w-4" />
                    New Asset
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets?.map((asset) => (
                <Link to={`/assets/edit/${asset.id}`} key={asset.id}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                    <div className="flex items-start">
                      <div className="bg-fiix-100 p-3 rounded-lg mr-4">
                        <Package className="h-5 w-5 text-fiix-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{asset.name}</h3>
                        {asset.location && (
                          <div className="flex items-center text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <p className="text-sm">{asset.location}</p>
                          </div>
                        )}
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            asset.status === "operational" ? "bg-green-100 text-green-800" :
                            asset.status === "maintenance" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
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
        
        <TabsContent value="hierarchy">
          <AssetHierarchyView assets={hierarchyData || []} isLoading={hierarchyLoading} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AssetsPage;
