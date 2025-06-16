
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, List, TreePine, Upload, Download } from "lucide-react";
import { LocationImportExport } from "@/components/locations/LocationImportExport";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface LocationsHeaderProps {
  viewMode: "hierarchy" | "list";
  setViewMode: (mode: "hierarchy" | "list") => void;
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
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600">Manage your facility locations and hierarchy</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isImportExportOpen} onOpenChange={setIsImportExportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
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
          
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Input
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "hierarchy" | "list")}>
          <TabsList>
            <TabsTrigger value="hierarchy" className="flex items-center gap-2">
              <TreePine className="h-4 w-4" />
              Hierarchy
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
