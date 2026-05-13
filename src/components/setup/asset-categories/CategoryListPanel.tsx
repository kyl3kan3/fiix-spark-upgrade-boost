import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AssetCategory } from "./types";

interface Props {
  categories: AssetCategory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddCategoryClick: () => void;
}

export const CategoryListPanel: React.FC<Props> = ({
  categories,
  selectedId,
  onSelect,
  onAddCategoryClick,
}) => (
  <div className="border rounded-md divide-y">
    {categories.length > 0 ? (
      categories.map((category) => (
        <div
          key={category.id}
          className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedId === category.id ? "bg-gray-50 border-l-4 border-l-maintenease-600" : ""}`}
          onClick={() => onSelect(category.id)}
        >
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{category.name}</h4>
            <Badge variant="outline" className="ml-2">
              {category.customFields.length} {category.customFields.length === 1 ? "field" : "fields"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{category.description}</p>
        </div>
      ))
    ) : (
      <div className="p-6 text-center text-muted-foreground">
        <p>No categories defined</p>
        <Button variant="link" onClick={onAddCategoryClick} className="mt-2">
          Add your first category
        </Button>
      </div>
    )}
  </div>
);
