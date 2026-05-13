import React, { useState } from "react";
import { Wrench, PenLine, PlusCircle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddCategoryDialog } from "./asset-categories/AddCategoryDialog";
import { AddFieldDialog } from "./asset-categories/AddFieldDialog";
import { CategoryListPanel } from "./asset-categories/CategoryListPanel";
import { CategoryFormPreview } from "./asset-categories/CategoryFormPreview";
import {
  defaultAssetCategories,
  fieldTypeOptions,
  type AssetCategory,
  type CustomField,
} from "./asset-categories/types";

interface AssetCategoriesSetupProps {
  data: { categories?: AssetCategory[] } | undefined;
  onUpdate: (data: { categories: AssetCategory[] }) => void;
}

const emptyCategory: AssetCategory = { id: "", name: "", description: "", customFields: [] };
const emptyField: CustomField = { id: "", name: "", type: "text", required: false };

const AssetCategoriesSetup: React.FC<AssetCategoriesSetupProps> = ({ data, onUpdate }) => {
  const [categories, setCategories] = useState<AssetCategory[]>(
    data?.categories || defaultAssetCategories,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    categories.length > 0 ? categories[0].id : null,
  );
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState<CustomField>(emptyField);
  const [newCategory, setNewCategory] = useState<AssetCategory>(emptyCategory);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState("");

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) ?? null;

  const persist = (next: AssetCategory[]) => {
    setCategories(next);
    onUpdate({ categories: next });
  };

  const handleAddCategory = () => {
    if (!newCategory.name) return;
    const category: AssetCategory = {
      ...newCategory,
      id: newCategory.name.toLowerCase().replace(/\s+/g, "_"),
    };
    const updated = [...categories, category];
    persist(updated);
    setSelectedCategoryId(category.id);
    setNewCategory(emptyCategory);
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updated = categories.filter((c) => c.id !== categoryId);
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(updated.length > 0 ? updated[0].id : null);
    }
    persist(updated);
  };

  const handleAddField = () => {
    if (!newField.name || !selectedCategory) return;
    const field: CustomField = {
      ...newField,
      id: newField.name.toLowerCase().replace(/\s+/g, "_"),
    };
    if (field.type === "dropdown" && dropdownOptions) {
      field.options = dropdownOptions.split(",").map((opt) => opt.trim()).filter(Boolean);
    }
    const updated = categories.map((c) =>
      c.id === selectedCategory.id
        ? { ...c, customFields: [...c.customFields, field] }
        : c,
    );
    persist(updated);
    setNewField(emptyField);
    setDropdownOptions("");
    setIsAddingField(false);
  };

  const handleDeleteField = (categoryId: string, fieldId: string) => {
    const updated = categories.map((c) =>
      c.id === categoryId
        ? { ...c, customFields: c.customFields.filter((f) => f.id !== fieldId) }
        : c,
    );
    persist(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Wrench className="h-6 w-6 text-maintenease-600" />
        <h2 className="text-xl font-semibold">Asset Categories</h2>
      </div>

      <p className="text-muted-foreground">
        Create categories for different types of assets and add custom fields for each category.
      </p>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="preview">Form Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Asset Categories</h3>
                <AddCategoryDialog
                  open={isAddingCategory}
                  onOpenChange={setIsAddingCategory}
                  value={newCategory}
                  onValueChange={setNewCategory}
                  onSubmit={handleAddCategory}
                />
              </div>

              <CategoryListPanel
                categories={categories}
                selectedId={selectedCategoryId}
                onSelect={setSelectedCategoryId}
                onAddCategoryClick={() => setIsAddingCategory(true)}
              />
            </div>

            <div className="md:col-span-3">
              {selectedCategory ? (
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle>{selectedCategory.name}</CardTitle>
                      <CardDescription className="mt-1.5">
                        {selectedCategory.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCategory(selectedCategory.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Custom Fields</h4>
                        <AddFieldDialog
                          open={isAddingField}
                          onOpenChange={setIsAddingField}
                          categoryName={selectedCategory.name}
                          value={newField}
                          onValueChange={setNewField}
                          dropdownOptions={dropdownOptions}
                          onDropdownOptionsChange={setDropdownOptions}
                          onSubmit={handleAddField}
                        />
                      </div>

                      {selectedCategory.customFields.length > 0 ? (
                        <div className="space-y-3">
                          {selectedCategory.customFields.map((field) => (
                            <div
                              key={field.id}
                              className="flex items-center justify-between border rounded-md p-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{field.name}</span>
                                  {field.required && (
                                    <span className="text-xs text-red-500">Required</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Badge variant="outline" className="font-normal">
                                    {fieldTypeOptions.find((t) => t.value === field.type)?.label ||
                                      field.type}
                                  </Badge>
                                  {field.type === "dropdown" && field.options && (
                                    <span className="text-xs">
                                      ({field.options.length} options)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteField(selectedCategory.id, field.id)}
                              >
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
                          <Button
                            variant="link"
                            onClick={() => setIsAddingField(true)}
                            className="mt-2"
                          >
                            Add your first field
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="border rounded-md p-8 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Wrench className="h-12 w-12 mb-4 opacity-20" />
                  <h3 className="text-lg font-medium">No Category Selected</h3>
                  <p className="mt-2 mb-4 max-w-xs">
                    Select a category from the list or create a new one to get started
                  </p>
                  <Button onClick={() => setIsAddingCategory(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Create Category
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="pt-4">
          <CategoryFormPreview category={selectedCategory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssetCategoriesSetup;
