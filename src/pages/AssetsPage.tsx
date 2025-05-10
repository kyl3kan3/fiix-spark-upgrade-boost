
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
import { Package, Search, Plus } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

// Sample data - would be replaced with real data from Supabase
const sampleAssets = [
  { id: "A-001", name: "Air Compressor", model: "AC-5000", location: "Building A", status: "Operational" },
  { id: "A-002", name: "Packaging Machine", model: "PM-200", location: "Production Line 1", status: "Maintenance Required" },
  { id: "A-003", name: "Forklift", model: "FL-X3", location: "Warehouse", status: "Operational" },
  { id: "A-004", name: "CNC Machine", model: "CNC-M2", location: "Production Line 2", status: "Offline" },
  { id: "A-005", name: "Generator", model: "GEN-10KW", location: "Building B", status: "Operational" }
];

const AssetsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredAssets = sampleAssets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAsset = () => {
    navigate('/assets/new');
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Asset Management</h1>
              <Button 
                onClick={handleAddAsset}
                className="bg-fiix-500 hover:bg-fiix-600 text-white"
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
              
              {filteredAssets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => (
                      <TableRow key={asset.id} className="hover:bg-gray-50">
                        <TableCell>{asset.id}</TableCell>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>{asset.model}</TableCell>
                        <TableCell>{asset.location}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            asset.status === "Operational" ? "bg-green-100 text-green-800" :
                            asset.status === "Maintenance Required" ? "bg-yellow-100 text-yellow-800" :
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
                  <Button onClick={handleAddAsset} className="bg-fiix-500 hover:bg-fiix-600">
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
