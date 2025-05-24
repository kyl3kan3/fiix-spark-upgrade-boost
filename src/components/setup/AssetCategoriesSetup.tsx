
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Draggable } from "@/components/ui/draggable";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Plus, X, PlusCircle, PenLine, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "boolean" | "dropdown";
  options?: string[];
  required: boolean;
}

interface AssetCategory {
  id: string;
  name: string;
  description: string;
  customFields: CustomField[];
}

interface AssetCategoriesSetupProps {
  data: any;
  onUpdate: (data: any) => void;
}

const defaultAssetCategories: AssetCategory[] = [
  {
    id: "equipment",
    name: "Equipment",
    description: "Machinery and equipment used in operations",
    customFields: [
      { id: "model_number", name: "Model Number", type: "text", required: true },
      { id: "manufacturer", name: "Manufacturer", type: "text", required: false },
      { id: "warranty_expiry", name: "Warranty Expiration", type: "date", required: false }
    ]
  },
  {
    id: "facility",
    name: "Facility",
    description: "Buildings and facility infrastructure",
    customFields: [
      { id: "square_footage", name: "Square Footage", type: "number", required: false },
      { id: "construction_year", name: "Year Constructed", type: "number", required: false }
    ]
  },
  {
    id: "vehicles",
    name: "Vehicles",
    description: "Company vehicles and mobile equipment",
    customFields: [
      { id: "license_plate", name: "License Plate", type: "text", required: true },
      { id: "vin", name: "VIN", type: "text", required: true },
      { id: "mileage", name: "Mileage", type: "number", required: false }
    ]
  }
];

const fieldTypeOptions = [
  { label: "Text", value: "text" },
  { label: "Number", value: "number" },
  { label: "Date", value: "date" },
  { label: "Checkbox", value: "boolean" },
  { label: "Dropdown", value: "dropdown" }
];

const AssetCategoriesSetup: React.FC<AssetCategoriesSetupProps> = ({ data, onUpdate }) => {
  const [categories, setCategories] = useState<AssetCategory[]>(
    data?.categories || defaultAssetCategories
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    categories.length > 0 ? categories[0].id : null
  );
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState<CustomField>({
    id: "",
    name: "",
    type: "text",
    required: false
  });
  const [newCategory, setNewCategory] = useState<AssetCategory>({
    id: "",
    name: "",
    description: "",
    customFields: []
  });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState<string>("");

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || null;

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleAddCategory = () => {
    if (!newCategory.name) return;

    const category: AssetCategory = {
      ...newCategory,
      id: newCategory.name.toLowerCase().replace(/\s+/g, '_')
    };

    const updated = [...categories, category];
    setCategories(updated);
    setSelectedCategoryId(category.id);
    setNewCategory({ id: "", name: "", description: "", customFields: [] });
    setIsAddingCategory(false);
    onUpdate({ categories: updated });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updated = categories.filter((c) => c.id !== categoryId);
    setCategories(updated);
    
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(updated.length > 0 ? updated[0].id : null);
    }
    
    onUpdate({ categories: updated });
  };

  const handleAddField = () => {
    if (!newField.name || !selectedCategory) return;

    const field: CustomField = {
      ...newField,
      id: newField.name.toLowerCase().replace(/\s+/g, '_')
    };

    if (field.type === "dropdown" && dropdownOptions) {
      field.options = dropdownOptions.split(",").map((opt) => opt.trim()).filter(Boolean);
    }

    const updatedCategory = {
      ...selectedCategory,
      customFields: [...selectedCategory.customFields, field]
    };

    const updated = categories.map((c) => 
      c.id === selectedCategory.id ? updatedCategory : c
    );

    setCategories(updated);
    setNewField({ id: "", name: "", type: "text", required: false });
    setDropdownOptions("");
    setIsAddingField(false);
    onUpdate({ categories: updated });
  };

  const handleDeleteField = (categoryId: string, fieldId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    const updatedCategory = {
      ...category,
      customFields: category.customFields.filter((f) => f.id !== fieldId)
    };

    const updated = categories.map((c) => 
      c.id === categoryId ? updatedCategory : c
    );

    setCategories(updated);
    onUpdate({ categories: updated });
  };

  const renderFieldValue = (field: CustomField) => {
    switch (field.type) {
      case "text":
        return <Input className="h-9" placeholder="Text value" disabled />;
      case "number":
        return <Input className="h-9" type="number" placeholder="0" disabled />;
      case "date":
        return <Input className="h-9" type="text" value={format(new Date(), "yyyy-MM-dd")} disabled />;
      case "boolean":
        return <Checkbox disabled />;
      case "dropdown":
        return (
          <select className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" disabled>
            <option>Select an option...</option>
            {field.options?.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
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
                <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Category</DialogTitle>
                      <DialogDescription>
                        Create a new category for your assets
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="name">Category Name*</Label>
                        <Input 
                          id="name"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                          placeholder="e.g. HVAC Systems"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                          placeholder="Description of this asset category"
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCategory} disabled={!newCategory.name}>
                        Add Category
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="border rounded-md divide-y">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <div 
                      key={category.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedCategoryId === category.id ? 'bg-gray-50 border-l-4 border-l-maintenease-600' : ''}`}
                      onClick={() => handleSelectCategory(category.id)}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{category.name}</h4>
                        <Badge variant="outline" className="ml-2">
                          {category.customFields.length} {category.customFields.length === 1 ? 'field' : 'fields'}
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
                    <Button 
                      variant="link" 
                      onClick={() => setIsAddingCategory(true)}
                      className="mt-2"
                    >
                      Add your first category
                    </Button>
                  </div>
                )}
              </div>
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
                        <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-1" /> Add Field
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Custom Field</DialogTitle>
                              <DialogDescription>
                                Add a custom field for {selectedCategory.name} assets
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-4 py-4">
                              <div>
                                <Label htmlFor="fieldName">Field Name*</Label>
                                <Input 
                                  id="fieldName"
                                  value={newField.name}
                                  onChange={(e) => setNewField({...newField, name: e.target.value})}
                                  placeholder="e.g. Serial Number"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="fieldType">Field Type*</Label>
                                <select
                                  id="fieldType"
                                  className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                  value={newField.type}
                                  onChange={(e) => setNewField({...newField, type: e.target.value as any})}
                                >
                                  {fieldTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              {newField.type === "dropdown" && (
                                <div>
                                  <Label htmlFor="options">Options (comma-separated)</Label>
                                  <Input 
                                    id="options"
                                    value={dropdownOptions}
                                    onChange={(e) => setDropdownOptions(e.target.value)}
                                    placeholder="Option 1, Option 2, Option 3"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Enter options separated by commas
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex items-start space-x-2">
                                <Checkbox 
                                  id="required"
                                  checked={newField.required}
                                  onCheckedChange={(checked) => 
                                    setNewField({...newField, required: checked === true})
                                  }
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <label
                                    htmlFor="required"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Required Field
                                  </label>
                                  <p className="text-sm text-muted-foreground">
                                    This field must be filled when creating assets
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddingField(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddField} disabled={!newField.name}>
                                Add Field
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
                                    {fieldTypeOptions.find(t => t.value === field.type)?.label || field.type}
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
          {selectedCategory ? (
            <Card>
              <CardHeader>
                <CardTitle>New {selectedCategory.name}</CardTitle>
                <CardDescription>
                  Enter the {selectedCategory.name.toLowerCase()} details below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Name*</Label>
                        <Input placeholder={`${selectedCategory.name} name`} />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea placeholder="Description of the asset" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input placeholder="Asset location" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {selectedCategory.customFields.length > 0 ? (
                        selectedCategory.customFields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label>
                              {field.name}
                              {field.required && <span className="text-red-500 ml-0.5">*</span>}
                            </Label>
                            {renderFieldValue(field)}
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-muted-foreground border border-dashed rounded-md">
                          <p>No custom fields defined for this category</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button disabled>Save Asset</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-md p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
              <Wrench className="h-12 w-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium">No Category Selected</h3>
              <p className="mt-2">
                Select a category to preview its form
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssetCategoriesSetup;
