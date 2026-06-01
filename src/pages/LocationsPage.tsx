
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageContainer from "@/components/shell/PageContainer";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { LocationsHeader } from "@/pages/locations/components/LocationsHeader";
import { LocationsTabContent } from "@/pages/locations/components/LocationsTabContent";
import { LocationDialogs } from "@/pages/locations/components/LocationDialogs";
import { useLocationPage } from "./locations/hooks/useLocationPage";
import { useLocationActions } from "./locations/hooks/useLocationActions";
import { TrendingUp } from "lucide-react";
import { Location } from "@/services/locationService";

const LocationsPage = () => {
 const {
   viewMode,
   setViewMode,
   searchQuery,
   setSearchQuery,
   parentFilter,
   setParentFilter,
   dateFilter,
   setDateFilter,
   hierarchyLocations,
   allLocations,
   filteredLocations,
   isLoading,
   handleClearFilters,
   handleImportComplete,
   handleOperationComplete,
 } = useLocationPage();

 const {
   isAddDialogOpen,
   setIsAddDialogOpen,
   isEditDialogOpen,
   selectedParentId,
   editingLocation,
   isCreating,
   isUpdating,
   isDeleting,
   handleAddLocation,
   handleEditLocation,
   handleDeleteLocation,
   handleAddSubLocation,
   handleEditLocationClick,
   handleDialogClose,
   handleEditDialogClose
 } = useLocationActions();

 if (isLoading) {
   return (
     <DashboardLayout>
       <PageContainer className="space-y-6">
         <BackToDashboard />
         <div className="flex items-center justify-center h-64">
           <div className="flex flex-col items-center gap-3">
             <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary" />
             <p className="text-sm text-muted-foreground">Loading locations…</p>
           </div>
         </div>
       </PageContainer>
     </DashboardLayout>
   );
 }

 const totalLocations = allLocations.length;
 const rootLocations = allLocations.filter((l: Location) => !l.parent_id).length;

 return (
   <DashboardLayout>
     <PageContainer className="space-y-8">
       <BackToDashboard />

       {/* Summary bento — only when data exists */}
       {totalLocations > 0 && (
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           <div className="surface-card rounded-lg p-5 flex flex-col justify-between min-h-[100px]">
             <span className="label-eyebrow mb-2">Total Facilities</span>
             <div>
               <p className="font-headline text-3xl font-bold text-foreground leading-none mb-1">
                 {totalLocations}
               </p>
               <div className="flex items-center text-secondary gap-1">
                 <TrendingUp className="h-3.5 w-3.5" />
                 <span className="text-xs font-semibold">{rootLocations} top-level sites</span>
               </div>
             </div>
           </div>

           <div className="surface-card rounded-lg p-5 flex flex-col justify-between min-h-[100px]">
             <span className="label-eyebrow mb-2">Site Hierarchy</span>
             <div>
               <p className="font-headline text-3xl font-bold text-foreground leading-none mb-1">
                 {rootLocations}
               </p>
               <div className="flex items-center text-muted-foreground gap-1">
                 <span className="text-xs font-medium">Root locations</span>
               </div>
             </div>
           </div>

           <div className="bg-primary text-primary-foreground rounded-xl p-5 flex items-center justify-between overflow-hidden relative min-h-[100px]">
             <div className="relative z-10">
               <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70 mb-2 block">
                 Network Health
               </span>
               <p className="font-headline text-2xl font-bold leading-none mb-1">
                 {totalLocations} Sites
               </p>
               <p className="text-xs text-primary-foreground/70">
                 Across all active facilities
               </p>
             </div>
             <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
           </div>
         </div>
       )}

       <LocationsHeader
         viewMode={viewMode}
         setViewMode={setViewMode}
         searchQuery={searchQuery}
         setSearchQuery={setSearchQuery}
         setIsAddDialogOpen={setIsAddDialogOpen}
         onImportComplete={handleImportComplete}
       />

       <LocationsTabContent
         viewMode={viewMode}
         hierarchyLocations={hierarchyLocations}
         allLocations={allLocations}
         filteredLocations={filteredLocations}
         isLoading={isLoading}
         searchQuery={searchQuery}
         setSearchQuery={setSearchQuery}
         parentFilter={parentFilter}
         setParentFilter={setParentFilter}
         dateFilter={dateFilter}
         setDateFilter={setDateFilter}
         onClearFilters={handleClearFilters}
         onAddSubLocation={handleAddSubLocation}
         setIsAddDialogOpen={setIsAddDialogOpen}
         onDeleteLocation={handleDeleteLocation}
         onEditLocationClick={handleEditLocationClick}
         onOperationComplete={handleOperationComplete}
         isDeleting={isDeleting}
       />

       <LocationDialogs
         isAddDialogOpen={isAddDialogOpen}
         onAddDialogClose={handleDialogClose}
         isEditDialogOpen={isEditDialogOpen}
         onEditDialogClose={handleEditDialogClose}
         selectedParentId={selectedParentId}
         editingLocation={editingLocation}
         allLocations={allLocations}
         onAddLocation={handleAddLocation}
         onEditLocation={handleEditLocation}
         isCreating={isCreating}
         isUpdating={isUpdating}
       />
     </PageContainer>
   </DashboardLayout>
 );
};

export default LocationsPage;
