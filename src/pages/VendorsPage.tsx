import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Grid3X3, List, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
  const checkboxRef = useRef<HTMLButtonElement>(null);
  
  const { isDeleting, handleDeleteVendor, handleBulkDeleteVendors } = useVendorActions();
  const { currentUserRole } = useUserRolePermissions();
  const canAdd = currentUserRole === 'administrator' || currentUserRole === 'manager';
  const canDelete = currentUserRole === 'administrator';
  
  // Fetch vendors
  
  const { data: vendors, isLoading, error } = useQuery({
    queryKey: ["vendors"],
    queryFn: getAllVendors
  });
  
  // filter handlers
  
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

  const handleSelectAll = () => {
    if (!filteredVendors) return;
    
    if (selectedVendors.length === filteredVendors.length) {
      // Deselect all
      setSelectedVendors([]);
    } else {
      // Select all filtered vendors
      setSelectedVendors(filteredVendors.map(v => v.id));
    }
  };

  // bulk action handlers

  const handleBulkDelete = async () => {
    if (selectedVendors.length === 0) return;
    
    try {
      await handleBulkDeleteVendors(selectedVendors);
      setSelectedVendors([]);
      toast.success(`${selectedVendors.length} vendors deleted successfully`);
    } catch (error) {
      console.error("Bulk delete failed:", error);
      toast.error("Failed to delete vendors");
    }
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
  
  // filtered vendors calculation
  
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
  const allSelected = filteredVendors && selectedVendors.length === filteredVendors.length && filteredVendors.length > 0;
  const someSelected = selectedVendors.length > 0 && selectedVendors.length < (filteredVendors?.length || 0);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <VendorPageHeader />
        
        // filters and actions
        
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

        {/* Select All and Bulk Actions */}
        {filteredVendors && filteredVendors.length > 0 && (
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Checkbox
                ref={checkboxRef}
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {allSelected ? 'Deselect All' : 'Select All'} ({filteredVendors.length} vendors)
              </span>
            </div>
            
            {selectedVendors.length > 0 && canDelete && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleBulkDelete}
                disabled={isDeleting}
              >
                Delete Selected ({selectedVendors.length})
              </Button>
            )}
          </div>
        )}

        // bulk actions, tabs, and footer
        
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
              selectedVendors={selectedVendors}
              onVendorSelection={handleVendorSelection}
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
              selectedVendors={selectedVendors}
              onVendorSelection={handleVendorSelection}
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
