
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Location } from "@/services/locationService";

interface LocationFiltersProps {
 searchQuery: string;
 setSearchQuery: (query: string) => void;
 parentFilter: string;
 setParentFilter: (parentId: string) => void;
 dateFilter: string;
 setDateFilter: (filter: string) => void;
 locations: Location[];
 onClearFilters: () => void;
}

export const LocationFilters: React.FC<LocationFiltersProps> = ({
 searchQuery,
 setSearchQuery,
 parentFilter,
 setParentFilter,
 dateFilter,
 setDateFilter,
 locations,
 onClearFilters
}) => {
 const parentLocations = locations.filter(loc =>
   locations.some(child => child.parent_id === loc.id)
 );

 const hasActiveFilters = searchQuery || parentFilter !== "all" || dateFilter !== "all";

 return (
   <div className="surface-card rounded-xl p-4 space-y-3 border border-border">
     <div className="flex flex-col sm:flex-row gap-3">
       {/* Search Input */}
       <div className="flex-1 relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
         <Input
           placeholder="Search locations by name or description..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="pl-10 bg-background border-border"
         />
       </div>

       {/* Parent Filter */}
       <div className="w-full sm:w-48">
         <Select value={parentFilter} onValueChange={setParentFilter}>
           <SelectTrigger className="border-border">
             <SelectValue placeholder="Filter by parent" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All Locations</SelectItem>
             <SelectItem value="root">Root Locations Only</SelectItem>
             {parentLocations.map((location) => (
               <SelectItem key={location.id} value={location.id}>
                 Children of {location.name}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>

       {/* Date Filter */}
       <div className="w-full sm:w-44">
         <Select value={dateFilter} onValueChange={setDateFilter}>
           <SelectTrigger className="border-border">
             <SelectValue placeholder="Filter by date" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All Time</SelectItem>
             <SelectItem value="today">Created Today</SelectItem>
             <SelectItem value="week">This Week</SelectItem>
             <SelectItem value="month">This Month</SelectItem>
           </SelectContent>
         </Select>
       </div>

       {/* Clear Filters */}
       {hasActiveFilters && (
         <Button
           variant="ghost"
           onClick={onClearFilters}
           className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
         >
           <X className="h-4 w-4 mr-1" />
           Clear
         </Button>
       )}
     </div>

     {/* Active filter chips */}
     {hasActiveFilters && (
       <div className="flex flex-wrap gap-2">
         {searchQuery && (
           <span className="inline-flex items-center gap-1.5 bg-primary/8 text-primary px-2.5 py-1 rounded-full text-xs font-medium border border-primary/20">
             Search: "{searchQuery}"
           </span>
         )}
         {parentFilter !== "all" && (
           <span className="inline-flex items-center gap-1.5 bg-secondary/8 text-secondary px-2.5 py-1 rounded-full text-xs font-medium border border-secondary/20">
             Parent: {parentFilter === "root" ? "Root only" :
               parentLocations.find(loc => loc.id === parentFilter)?.name || "Unknown"}
           </span>
         )}
         {dateFilter !== "all" && (
           <span className="inline-flex items-center gap-1.5 bg-accent/8 text-accent-foreground px-2.5 py-1 rounded-full text-xs font-medium border border-accent/20">
             Date: {dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}
           </span>
         )}
       </div>
     )}
   </div>
 );
};
