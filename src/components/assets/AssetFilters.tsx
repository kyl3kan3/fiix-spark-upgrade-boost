
import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuCheckboxItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AssetFiltersProps {
 searchQuery: string;
 onSearchChange: (value: string) => void;
 assetCategories: string[];
 selectedCategories: string[];
 onCategoryToggle: (category: string) => void;
}

const AssetFilters: React.FC<AssetFiltersProps> = ({
 searchQuery,
 onSearchChange,
 assetCategories,
 selectedCategories,
 onCategoryToggle,
}) => {
 return (
 <div className="flex items-center gap-3 w-full">
 <div className="relative flex-grow max-w-lg">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
 <Input
 type="search"
 placeholder="Search assets, maintenance logs..."
 className="pl-11 rounded-full bg-card border-border focus-visible:ring-primary h-11 text-sm"
 value={searchQuery}
 onChange={(e) => onSearchChange(e.target.value)}
 />
 </div>

 {assetCategories.length > 0 && (
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button
 variant="outline"
 className="whitespace-nowrap rounded-lg border-border text-muted-foreground hover:bg-muted hover:text-foreground h-11"
 >
 <SlidersHorizontal className="mr-2 h-4 w-4" />
 Filter
 {selectedCategories.length > 0 && (
 <Badge className="ml-2 rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0">
 {selectedCategories.length}
 </Badge>
 )}
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-56">
 {assetCategories.map((category) => (
 <DropdownMenuCheckboxItem
 key={category}
 checked={selectedCategories.includes(category)}
 onCheckedChange={() => onCategoryToggle(category)}
 >
 {category}
 </DropdownMenuCheckboxItem>
 ))}
 </DropdownMenuContent>
 </DropdownMenu>
 )}
 </div>
 );
};

export default AssetFilters;
