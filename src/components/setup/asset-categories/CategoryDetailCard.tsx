import React from "react";
import { PenLine, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddFieldDialog } from "./AddFieldDialog";
import { fieldTypeOptions, type AssetCategory, type CustomField } from "./types";

interface CategoryDetailCardProps {
  category: AssetCategory;
  onDelete: () => void;
  onDeleteField: (fieldId: string) => void;
  isAddingField: boolean;
  onAddingFieldChange: (open: boolean) => void;
  newField: CustomField;
  onNewFieldChange: (next: CustomField) => void;
  dropdownOptions: string;
  onDropdownOptionsChange: (next: string) => void;
  onAddField: () => void;
}

export const CategoryDetailCard: React.FC<CategoryDetailCardProps> = ({
  category,
  onDelete,
  onDeleteField,
  isAddingField,
  onAddingFieldChange,
  newField,
  onNewFieldChange,
  dropdownOptions,
  onDropdownOptionsChange,
  onAddField,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-start justify-between">
      <div>
        <CardTitle>{category.name}</CardTitle>
        <CardDescription className="mt-1.5">{category.description}</CardDescription>
      </div>
      <Button variant="destructive" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4 mr-1" /> Delete
      </Button>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Custom Fields</h4>
          <AddFieldDialog
            open={isAddingField}
            onOpenChange={onAddingFieldChange}
            categoryName={category.name}
            value={newField}
            onValueChange={onNewFieldChange}
            dropdownOptions={dropdownOptions}
            onDropdownOptionsChange={onDropdownOptionsChange}
            onSubmit={onAddField}
          />
        </div>

        {category.customFields.length > 0 ? (
          <div className="space-y-3">
            {category.customFields.map((field) => (
              <div key={field.id} className="flex items-center justify-between border rounded-md p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{field.name}</span>
                    {field.required && <span className="text-xs text-red-500">Required</span>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="font-normal">
                      {fieldTypeOptions.find((t) => t.value === field.type)?.label || field.type}
                    </Badge>
                    {field.type === "dropdown" && field.options && (
                      <span className="text-xs">({field.options.length} options)</span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onDeleteField(field.id)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground border border-dashed rounded-md">
            <PenLine className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p>No custom fields defined for this category</p>
            <Button variant="link" onClick={() => onAddingFieldChange(true)} className="mt-2">
              Add your first field
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);
