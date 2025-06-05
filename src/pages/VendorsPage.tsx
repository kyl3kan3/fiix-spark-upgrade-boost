
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Grid3X3, List } from "lucide-react";
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
import { toast } from "sonner";

const VendorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  const { 
    isDeleting, 
    selectedVendors,
    handleDeleteVendor,
    handleBulkDelete,
    toggleVendorSelection,
    selectAllVendors,
    clearSelection
  } = useVendorActions();
  const { currentUserRole } = useUserRolePermissions();
  const canAdd = currentUserRole === 'administrator' || currentUserRole === 'manager';
  const canDelete = currentUserRole === 'administrator';
  
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
        </div>

        {/* Bulk Actions Bar */}
        {canDelete && selectedVendors.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800 dark:text-blue-200">
                {selectedVendors.length} vendor(s) selected
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Selected"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger 
              value="grid" 
              className="flex items-center text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-black dark:data-[state=active]:text-white"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Grid View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="mt-4">
            <VendorGridView
              vendors={filteredVendors}
              isLoading={isLoading}
              error={error}
              hasFilters={hasFilters}
              isDeleting={isDeleting}
              selectedVendors={selectedVendors}
              onDeleteVendor={handleDeleteVendor}
              onToggleSelection={toggleVendorSelection}
              onSelectAll={() => selectAllVendors(filteredVendors?.map(v => v.id) || [])}
              onClearSelection={clearSelection}
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
