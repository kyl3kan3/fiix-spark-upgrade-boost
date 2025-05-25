
import React from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface LocationsHeaderProps {
  viewMode: "hierarchy" | "list";
  setViewMode: (mode: "hierarchy" | "list") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsAddDialogOpen: (open: boolean) => void;
}

export const LocationsHeader: React.FC<LocationsHeaderProps> = ({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  setIsAddDialogOpen
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        {/* View Mode Toggle */}
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "hierarchy" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("hierarchy")}
            className="rounded-r-none"
          >
            Hierarchy
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-l-none"
          >
            List
          </Button>
        </div>

        {viewMode === "list" && (
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search locations..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="whitespace-nowrap bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </div>
  );
};
