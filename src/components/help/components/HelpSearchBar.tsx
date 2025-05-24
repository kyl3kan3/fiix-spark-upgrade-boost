
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";

interface HelpSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

export const HelpSearchBar: React.FC<HelpSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Search help topics..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 max-w-full"
        />
      </div>
      <Button onClick={onClearSearch} variant="outline" className="whitespace-nowrap">
        Clear Search
      </Button>
    </div>
  );
};
