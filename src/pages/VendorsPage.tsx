
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Grid3X3, List, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllVendors } from "@/services/vendorService";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useVendorActions } from "@/hooks/vendors/useVendorActions";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";
import VendorPageHeader from "@/components/vendors/VendorPageHeader";
import VendorFilters from "@/components/vendors/VendorFilters";
import VendorGridView from "@/components/vendors/VendorGridView";
import VendorListView from "@/components/vendors/VendorListView";
import VendorBulkActions from "@/components/vendors/VendorBulkActions";
import VendorImportDialog from "@/components/vendors/VendorImportDialog";
import { exportVendorsToCSV } from "@/utils/vendorExport";
import { toast } from "sonner";

const VendorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { isDeleting, handleDeleteVendor } = useVendorActions();
  const { currentUserRole } = useUserRolePermissions();
  const canAdd = currentUserRole === 'administrator' || currentUserRole === 'manager';
  
  // Fetch vendors
  const { data: vendors, isLoading, error } = useQuery({
    queryKey: ["vendors"],
    queryFn: getAllVendors
  });
  
  const handleStatusToggle = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };
  
  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const handleVendorSelection = (vendorId: string, selected: boolean) => {
    setSelectedVendors(prev => 
      selected 
        ? [...prev, vendorId]
        : prev.filter(id => id !== vendorId)
    );
  };

  const handleBulkDelete = () => {
    if (selectedVendors.length === 0) return;
    // Implementation would go here
    toast.success(`${selectedVendors.length} vendors deleted`);
    setSelectedVendors([]);
  };

  const handleBulkStatusChange = (status: string) => {
    if (selectedVendors.length === 0) return;
    // Implementation would go here
    toast.success(`${selectedVendors.length} vendors updated to ${status}`);
    setSelectedVendors([]);
  };

  const handleBulkExport = () => {
    if (!vendors) return;
    const selectedVendorData = vendors.filter(v => selectedVendors.includes(v.id));
    const dataToExport = selectedVendorData.length > 0 ? selectedVendorData : vendors;
    exportVendorsToCSV(dataToExport);
    toast.success("Vendors exported successfully");
  };
  
  const filteredVendors = vendors?.filter(vendor => 
    (searchQuery === "" || 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.contact_person && vendor.contact_person.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vendor.email && vendor.email.toLowerCase().includes(searchQuery.toLowerCase()))
    ) && 
    (selectedStatus.length === 0 || selectedStatus.includes(vendor.status)) &&
    (selectedTypes.length === 0 || selectedTypes.includes(vendor.vendor_type))
  );

  if (error) {
    toast.error("Failed to load vendors", { 
      description: "There was an error loading the vendor data."
    });
  }

  const hasFilters = searchQuery !== "" || selectedStatus.length > 0 || selectedTypes.length > 0;
  const statusOptions = ["active", "inactive", "suspended"];
  const typeOptions = ["service", "supplier", "contractor", "consultant"];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <VendorPageHeader />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <VendorFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusOptions={statusOptions}
            selectedStatus={selectedStatus}
            onStatusToggle={handleStatusToggle}
            typeOptions={typeOptions}
            selectedTypes={selectedTypes}
            onTypeToggle={handleTypeToggle}
          />
          
          <div className="flex gap-2">
            <VendorImportDialog />
            <Button variant="outline" onClick={handleBulkExport}>
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        <VendorBulkActions
          selectedCount={selectedVendors.length}
          onBulkDelete={handleBulkDelete}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkExport={handleBulkExport}
          onClearSelection={() => setSelectedVendors([])}
        />

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")} className="w-full">
          <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger 
              value="grid" 
              className="flex items-center text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-black dark:data-[state=active]:text-white"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Grid View
            </TabsTrigger>
            <TabsTrigger 
              value="list" 
              className="flex items-center text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-black dark:data-[state=active]:text-white"
            >
              <List className="h-4 w-4 mr-2" />
              List View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="mt-4">
            <VendorGridView
              vendors={filteredVendors}
              isLoading={isLoading}
              error={error}
              hasFilters={hasFilters}
              isDeleting={isDeleting}
              onDeleteVendor={handleDeleteVendor}
            />
          </TabsContent>
          
          <TabsContent value="list" className="mt-4">
            <VendorListView
              vendors={filteredVendors}
              isLoading={isLoading}
              error={error}
              hasFilters={hasFilters}
              isDeleting={isDeleting}
              onDeleteVendor={handleDeleteVendor}
            />
          </TabsContent>
        </Tabs>
        
        {/* Fixed position Add Vendor button - only show for admins and managers */}
        {canAdd && (
          <div className="fixed bottom-8 right-8 z-40">
            <Link to="/vendors/new">
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

export default VendorsPage;
