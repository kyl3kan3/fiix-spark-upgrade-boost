
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageContainer from "@/components/shell/PageContainer";
import { LocationsHeader } from "@/pages/locations/components/LocationsHeader";
import { LocationsTabContent } from "@/pages/locations/components/LocationsTabContent";
import { LocationDialogs } from "@/pages/locations/components/LocationDialogs";
import { useLocationPage } from "./locations/hooks/useLocationPage";
import { useLocationActions } from "./locations/hooks/useLocationActions";
import { MaterialIcon } from "@/components/ui/material-icon";
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
       <div className="flex-1 flex flex-col md:flex-col overflow-hidden">
         <div className="p-container_padding md:p-8 flex-1 overflow-y-auto space-y-8">
           <div className="flex items-center justify-center h-64">
             <div className="flex flex-col items-center gap-3">
               <div className="animate-spin rounded-full h-8 w-8 border-2 border-outline-variant border-t-primary" />
               <p className="text-sm text-on-surface-variant">Loading locations…</p>
             </div>
           </div>
         </div>
       </div>
     </DashboardLayout>
   );
 }

 const totalLocations = allLocations.length;
 const rootLocations = allLocations.filter((l: Location) => !l.parent_id).length;
 const networkHealthPct = totalLocations > 0 ? 89 : 0;

 return (
   <DashboardLayout>
     <div className="flex-1 flex flex-col overflow-hidden">
       <div className="p-container_padding md:p-8 flex-1 overflow-y-auto space-y-8">

         {/* Hero / Map Overview */}
         <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Map Area */}
           <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden border border-transparent hover:border-primary/10 transition-colors duration-300 h-96 relative group">
             <div
               className="absolute inset-0 bg-surface-container-low"
               style={{
                 backgroundImage: "linear-gradient(135deg, #e5eeff 25%, #eff4ff 75%)",
                 backgroundSize: "cover",
                 backgroundPosition: "center",
               }}
             >
               {/* Glassmorphic Map Controls */}
               <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-surface/80 backdrop-blur-md p-2 rounded-lg border border-outline-variant/30 shadow-sm">
                 <button className="p-1 rounded text-on-surface hover:bg-surface-container">
                   <MaterialIcon name="add" />
                 </button>
                 <button className="p-1 rounded text-on-surface hover:bg-surface-container">
                   <MaterialIcon name="remove" />
                 </button>
                 <div className="h-px bg-outline-variant/30 my-1"></div>
                 <button className="p-1 rounded text-on-surface hover:bg-surface-container">
                   <MaterialIcon name="layers" />
                 </button>
               </div>
               {/* Map Markers */}
               <div className="absolute top-1/3 left-1/4 flex flex-col items-center group/marker cursor-pointer">
                 <div className="bg-success text-on-primary px-2 py-1 rounded shadow-sm font-label-sm text-label-sm mb-1 opacity-0 group-hover/marker:opacity-100 transition-opacity">Healthy: 98%</div>
                 <div className="w-4 h-4 bg-success rounded-full border-2 border-surface-container-lowest shadow-sm ring-4 ring-success/20"></div>
               </div>
               <div className="absolute top-1/2 left-2/3 flex flex-col items-center group/marker cursor-pointer">
                 <div className="bg-warning text-on-primary px-2 py-1 rounded shadow-sm font-label-sm text-label-sm mb-1 opacity-0 group-hover/marker:opacity-100 transition-opacity">Attention: 72%</div>
                 <div className="w-4 h-4 bg-warning rounded-full border-2 border-surface-container-lowest shadow-sm ring-4 ring-warning/20"></div>
               </div>
               {/* Map placeholder label */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center text-on-surface-variant/40">
                   <MaterialIcon name="map" className="text-[64px] block mx-auto mb-2" />
                   <p className="font-label-md text-label-md">Facility Map</p>
                 </div>
               </div>
             </div>
           </div>

           {/* High Level Stats Bento */}
           <div className="flex flex-col gap-6">
             <div className="bg-surface-container-lowest rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-card_padding border border-transparent hover:border-primary/10 transition-colors flex-1 flex flex-col justify-center">
               <p className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-2">Network Health</p>
               <div className="flex items-end gap-3">
                 <h3 className="font-display-lg text-display-lg text-primary">
                   {networkHealthPct}<span className="text-headline-md">%</span>
                 </h3>
                 <span className="text-success font-label-md flex items-center mb-2">
                   <MaterialIcon name="trending_up" className="text-sm" /> +2.1%
                 </span>
               </div>
               <p className="font-body-md text-secondary mt-2">Across {totalLocations} active facilities</p>
             </div>
             <div className="bg-surface-container-lowest rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-card_padding border border-transparent hover:border-primary/10 transition-colors flex-1 flex flex-col justify-center">
               <p className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-2">Active Incidents</p>
               <div className="flex items-end gap-3">
                 <h3 className="font-display-lg text-display-lg text-error">0</h3>
                 <span className="text-warning font-label-md flex items-center mb-2">0 Critical</span>
               </div>
             </div>
           </div>
         </section>

         {/* Hierarchical Facility List */}
         <section>
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
         </section>

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
       </div>
     </div>
   </DashboardLayout>
 );
};

export default LocationsPage;
