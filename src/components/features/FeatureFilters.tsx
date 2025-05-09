
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { categories, viewOptions } from "./FeaturesData";

interface FeatureFiltersProps {
  selectedCategory: string;
  viewType: string;
  onCategoryChange: (value: string) => void;
  onViewTypeChange: (value: string) => void;
}

const FeatureFilters: React.FC<FeatureFiltersProps> = ({
  selectedCategory,
  viewType,
  onCategoryChange,
  onViewTypeChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
      {/* Category filter */}
      <div className="min-w-[200px]">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full border-fiix-300 focus:ring-fiix-500">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* View type toggle */}
      <div className="flex justify-center">
        <ToggleGroup 
          type="single" 
          value={viewType} 
          onValueChange={(value) => value && onViewTypeChange(value)}
        >
          {viewOptions.map((option) => (
            <ToggleGroupItem 
              key={option.value} 
              value={option.value} 
              aria-label={option.label} 
              className="px-4"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
};

export default FeatureFilters;
