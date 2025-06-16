
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
  // Get unique parent locations for filter dropdown
  const parentLocations = locations.filter(loc => 
    locations.some(child => child.parent_id === loc.id)
  );

  const hasActiveFilters = searchQuery || parentFilter !== "all" || dateFilter !== "all";

  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search locations by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Parent Filter */}
        <div className="w-full sm:w-48">
          <Select value={parentFilter} onValueChange={setParentFilter}>
            <SelectTrigger>
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
        <div className="w-full sm:w-48">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
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
            variant="outline"
            onClick={onClearFilters}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              Search: "{searchQuery}"
            </div>
          )}
          {parentFilter !== "all" && (
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              Parent: {parentFilter === "root" ? "Root only" : 
                parentLocations.find(loc => loc.id === parentFilter)?.name || "Unknown"}
            </div>
          )}
          {dateFilter !== "all" && (
            <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
              Date: {dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
