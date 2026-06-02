
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
 <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
 <div className="relative w-full sm:w-96">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 type="search"
 placeholder="Search vendors..."
 className="w-full pl-10 bg-background border-border"
 value={searchQuery}
 onChange={(e) => onSearchChange(e.target.value)}
 />
 </div>

 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-accent hover:text-accent-foreground">
 <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
 Filters
 {totalFilters > 0 && (
 <Badge variant="secondary" className="ml-2 rounded-full bg-primary/10 text-primary">
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
