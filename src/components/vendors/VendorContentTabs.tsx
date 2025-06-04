
import React from "react";
import { Grid3X3, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VendorGridView from "./VendorGridView";
import VendorListView from "./VendorListView";
import { type Vendor } from "@/services/vendorService";

interface VendorContentTabsProps {
  viewMode: "grid" | "list";
  onViewModeChange: (value: "grid" | "list") => void;
  filteredVendors: Vendor[] | undefined;
  isLoading: boolean;
  error: any;
  hasFilters: boolean;
  isDeleting: boolean;
  onDeleteVendor: (vendorId: string) => void;
  selectedVendors: string[];
  onVendorSelection: (vendorId: string, selected: boolean) => void;
  isBulkDeleting: boolean;
}

const VendorContentTabs: React.FC<VendorContentTabsProps> = ({
  viewMode,
  onViewModeChange,
  filteredVendors,
  isLoading,
  error,
  hasFilters,
  isDeleting,
  onDeleteVendor,
  selectedVendors,
  onVendorSelection,
  isBulkDeleting,
}) => {
  return (
    <Tabs value={viewMode} onValueChange={onViewModeChange} className="w-full">
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
          isDeleting={isDeleting || isBulkDeleting}
          onDeleteVendor={onDeleteVendor}
          selectedVendors={selectedVendors}
          onVendorSelection={onVendorSelection}
        />
      </TabsContent>
      
      <TabsContent value="list" className="mt-4">
        <VendorListView
          vendors={filteredVendors}
          isLoading={isLoading}
          error={error}
          hasFilters={hasFilters}
          isDeleting={isDeleting || isBulkDeleting}
          onDeleteVendor={onDeleteVendor}
          selectedVendors={selectedVendors}
          onVendorSelection={onVendorSelection}
        />
      </TabsContent>
    </Tabs>
  );
};

export default VendorContentTabs;
