
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { getAllAssets, getAssetHierarchy } from "@/services/assetService";

const AssetsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
  
  // Get all assets for search
  const { data: allAssets, isLoading: loadingAssets } = useQuery({
    queryKey: ["assets"],
    queryFn: getAllAssets
  });

  // Get hierarchical structure
  const { data: hierarchicalAssets, isLoading: loadingHierarchy } = useQuery({
    queryKey: ["assetHierarchy"],
    queryFn: getAssetHierarchy
  });
  
  const filteredAssets = allAssets?.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.location && asset.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (asset.model && asset.model.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleAddAsset = () => {
    navigate('/assets/new');
  };

  const toggleAssetExpand = (assetId: string) => {
    const newExpanded = new Set(expandedAssets);
    if (expandedAssets.has(assetId)) {
      newExpanded.delete(assetId);
    } else {
      newExpanded.add(assetId);
    }
    setExpandedAssets(newExpanded);
  };

  // Recursive component for rendering the asset hierarchy
  const renderAssetRow = (asset: any, depth = 0) => {
    const hasChildren = asset.children && asset.children.length > 0;
    const isExpanded = expandedAssets.has(asset.id);
    
    return (
      <React.Fragment key={asset.id}>
        <TableRow className="hover:bg-gray-50">
          <TableCell className="pl-4">
            <div className="flex items-center" style={{ paddingLeft: `${depth * 20}px` }}>
              {hasChildren ? (
                <button 
                  onClick={() => toggleAssetExpand(asset.id)}
                  className="mr-2 p-1 rounded hover:bg-gray-100"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              ) : (
                <div className="w-6"></div> 
              )}
              {asset.name}
            </div>
          </TableCell>
          <TableCell>{asset.model || "-"}</TableCell>
          <TableCell>{asset.location || "-"}</TableCell>
          <TableCell>
            <span className={`px-2 py-1 text-xs rounded-full ${
              asset.status === "active" ? "bg-green-100 text-green-800" :
              asset.status === "maintenance" ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }`}>
              {asset.status}
            </span>
          </TableCell>
          <TableCell>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/assets/edit/${asset.id}`)}
            >
              Edit
            </Button>
          </TableCell>
        </TableRow>
        
        {/* Render children if expanded */}
        {isExpanded && hasChildren && asset.children.map((child: any) => renderAssetRow(child, depth + 1))}
      </React.Fragment>
    );
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8 mt-20">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Asset Management</h1>
              <Button 
                onClick={handleAddAsset}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 text-lg flex items-center shadow-md"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Asset
              </Button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {loadingAssets || loadingHierarchy ? (
                <div className="text-center py-10">Loading assets...</div>
              ) : searchTerm ? (
                /* Show flat list when searching */
                filteredAssets.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssets.map((asset) => (
                        <TableRow key={asset.id} className="hover:bg-gray-50">
                          <TableCell>{asset.name}</TableCell>
                          <TableCell>{asset.model || "-"}</TableCell>
                          <TableCell>{asset.location || "-"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              asset.status === "active" ? "bg-green-100 text-green-800" :
                              asset.status === "maintenance" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {asset.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/assets/edit/${asset.id}`)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No assets found</h3>
                    <p className="text-gray-500 mb-4">No assets match your search criteria.</p>
                    <Button onClick={handleAddAsset} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Asset
                    </Button>
                  </div>
                )
              ) : hierarchicalAssets && hierarchicalAssets.length > 0 ? (
                /* Show hierarchical view */
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hierarchicalAssets.map((asset) => renderAssetRow(asset))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No assets found</h3>
                  <p className="text-gray-500 mb-4">Your asset inventory is empty.</p>
                  <Button onClick={handleAddAsset} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Asset
                  </Button>
                </div>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AssetsPage;
