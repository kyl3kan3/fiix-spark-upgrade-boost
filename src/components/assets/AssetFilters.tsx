
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
    <div className="flex items-center gap-3 w-full md:w-auto">
      <div className="relative flex-grow md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <Input
          type="search"
          placeholder="Search assets..."
          className="pl-8 w-full"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {assetCategories.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="whitespace-nowrap">
              <Filter className="mr-2 h-4 w-4" />
              Categories
              {selectedCategories.length > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-full">
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
