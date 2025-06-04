
import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface VendorFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusOptions: string[];
  selectedStatus: string[];
  onStatusToggle: (status: string) => void;
  typeOptions: string[];
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
}

const VendorFilters: React.FC<VendorFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusOptions,
  selectedStatus,
  onStatusToggle,
  typeOptions,
  selectedTypes,
  onTypeToggle,
}) => {
  const totalFilters = selectedStatus.length + selectedTypes.length;

  return (
    <div className="flex items-center gap-3 w-full md:w-auto">
      <div className="relative flex-grow md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <Input
          type="search"
          placeholder="Search vendors..."
          className="pl-8 w-full"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="whitespace-nowrap">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {totalFilters > 0 && (
              <Badge variant="secondary" className="ml-2 rounded-full">
                {totalFilters}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {statusOptions.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={selectedStatus.includes(status)}
              onCheckedChange={() => onStatusToggle(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Type</DropdownMenuLabel>
          {typeOptions.map((type) => (
            <DropdownMenuCheckboxItem
              key={type}
              checked={selectedTypes.includes(type)}
              onCheckedChange={() => onTypeToggle(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default VendorFilters;
