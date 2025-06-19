
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TreePine, List, BarChart3, Package } from "lucide-react";
import { LocationImportExport } from "@/components/locations/LocationImportExport";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface LocationsHeaderProps {
  viewMode: "hierarchy" | "list" | "analytics" | "bulk";
  setViewMode: (mode: "hierarchy" | "list" | "analytics" | "bulk") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsAddDialogOpen: (open: boolean) => void;
  onImportComplete?: () => void;
}

export const LocationsHeader: React.FC<LocationsHeaderProps> = ({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  setIsAddDialogOpen,
  onImportComplete
}) => {
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600 mt-1">Manage your facility locations and hierarchy</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Dialog open={isImportExportOpen} onOpenChange={setIsImportExportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Package className="h-4 w-4 mr-2" />
                Import/Export
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import/Export Locations</DialogTitle>
              </DialogHeader>
              <LocationImportExport 
                onImportComplete={() => {
                  onImportComplete?.();
                  setIsImportExportOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-maintenease-600 hover:bg-maintenease-700 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <Input
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full lg:max-w-sm"
        />
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "hierarchy" | "list" | "analytics" | "bulk")}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="hierarchy" className="flex items-center gap-2">
              <TreePine className="h-4 w-4" />
              <span className="hidden sm:inline">Hierarchy</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Bulk</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
