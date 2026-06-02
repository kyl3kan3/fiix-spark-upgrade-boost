import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, PlusCircle } from "lucide-react";
import { AddCategoryDialog } from "./asset-categories/AddCategoryDialog";
import { CategoryDetailCard } from "./asset-categories/CategoryDetailCard";
import { CategoryFormPreview } from "./asset-categories/CategoryFormPreview";
import {
  defaultAssetCategories,
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
      c.id === selectedCategory.id ? { ...c, customFields: [...c.customFields, field] } : c,
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
        <Wrench className="h-6 w-6 text-primary" />
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

              <div className="border rounded-md divide-y">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className={`p-3 cursor-pointer hover:bg-muted ${selectedCategoryId === category.id ? "bg-muted border-l-4 border-l-primary" : ""}`}
                      onClick={() => setSelectedCategoryId(category.id)}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{category.name}</h4>
                        <Badge variant="outline" className="ml-2">
                          {category.customFields.length} {category.customFields.length === 1 ? "field" : "fields"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {category.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <p>No categories defined</p>
                    <Button variant="link" onClick={() => setIsAddingCategory(true)} className="mt-2">
                      Add your first category
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-3">
              {selectedCategory ? (
                <CategoryDetailCard
                  category={selectedCategory}
                  onDelete={() => handleDeleteCategory(selectedCategory.id)}
                  onDeleteField={(fieldId) => handleDeleteField(selectedCategory.id, fieldId)}
                  isAddingField={isAddingField}
                  onAddingFieldChange={setIsAddingField}
                  newField={newField}
                  onNewFieldChange={setNewField}
                  dropdownOptions={dropdownOptions}
                  onDropdownOptionsChange={setDropdownOptions}
                  onAddField={handleAddField}
                />
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
