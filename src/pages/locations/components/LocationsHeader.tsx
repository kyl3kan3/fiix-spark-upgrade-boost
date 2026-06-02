
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TreePine, List, BarChart3, Package, Search } from "lucide-react";
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
     {/* Title row */}
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
       <div>
         <h1 className="font-headline text-2xl sm:text-3xl font-bold text-foreground leading-tight">
           Facilities
         </h1>
         <p className="text-muted-foreground mt-1 text-sm">
           Manage your facility locations and site hierarchy
         </p>
       </div>

       <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
           className="bg-primary hover:bg-primary-variant text-primary-foreground w-full sm:w-auto"
         >
           <Plus className="h-4 w-4 mr-2" />
           Add Location
         </Button>
       </div>
     </div>

     {/* Search + tabs row */}
     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
       <div className="relative w-full lg:max-w-sm">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
         <Input
           placeholder="Search locations..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="pl-10 rounded-lg bg-card border-border"
         />
       </div>

       <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "hierarchy" | "list" | "analytics" | "bulk")}>
         <TabsList className="grid w-full grid-cols-4 lg:w-auto bg-muted/60">
           <TabsTrigger value="hierarchy" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
             <TreePine className="h-4 w-4" />
             <span className="hidden sm:inline">Hierarchy</span>
           </TabsTrigger>
           <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
             <List className="h-4 w-4" />
             <span className="hidden sm:inline">List</span>
           </TabsTrigger>
           <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
             <BarChart3 className="h-4 w-4" />
             <span className="hidden sm:inline">Analytics</span>
           </TabsTrigger>
           <TabsTrigger value="bulk" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
             <Package className="h-4 w-4" />
             <span className="hidden sm:inline">Bulk</span>
           </TabsTrigger>
         </TabsList>
       </Tabs>
     </div>
   </div>
 );
};
