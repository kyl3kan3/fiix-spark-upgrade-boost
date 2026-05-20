
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
 <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
 <div className="relative w-full sm:flex-1 sm:min-w-0 sm:max-w-xl">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
 <Input
 type="search"
 placeholder="Search vendors..."
 className="w-full pl-8"
 value={searchQuery}
 onChange={(e) => onSearchChange(e.target.value)}
 />
 </div>
 
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="outline" className="w-full whitespace-nowrap sm:w-auto sm:px-4">
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
