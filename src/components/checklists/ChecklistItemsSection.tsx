
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ChecklistItemForm from "./ChecklistItemForm";

interface ChecklistItemFormType {
  id?: string;
  title: string;
  description: string;
  item_type: "checkbox" | "text" | "number" | "date";
  is_required: boolean;
  sort_order: number;
}

interface ChecklistItemsSectionProps {
  items: ChecklistItemFormType[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: keyof ChecklistItemFormType, value: any) => void;
  onMoveItem: (index: number, direction: "up" | "down") => void;
}

const ChecklistItemsSection: React.FC<ChecklistItemsSectionProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onMoveItem
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Checklist Items</h2>
        <Button type="button" onClick={onAddItem} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No items added yet. Click "Add Item" to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <ChecklistItemForm
              key={index}
              item={item}
              index={index}
              totalItems={items.length}
              onUpdate={(field, value) => onUpdateItem(index, field, value)}
              onRemove={() => onRemoveItem(index)}
              onMove={(direction) => onMoveItem(index, direction)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default ChecklistItemsSection;
