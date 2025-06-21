
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, ArrowLeft } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { ChecklistTypes, ChecklistFrequencies } from "@/types/checklists";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface ChecklistFormProps {
  mode: "create" | "edit";
}

interface ChecklistItemForm {
  id?: string;
  title: string;
  description: string;
  item_type: "checkbox" | "text" | "number" | "date";
  is_required: boolean;
  sort_order: number;
}

interface ChecklistFormData {
  name: string;
  description: string;
  type: string;
  frequency: string;
  is_active: boolean;
  items: ChecklistItemForm[];
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ChecklistFormData>({
    name: "",
    description: "",
    type: "general",
    frequency: "one-time",
    is_active: true,
    items: []
  });

  // Load existing checklist for edit mode
  const { data: checklist, isLoading } = useQuery({
    queryKey: ["checklist", id],
    queryFn: () => checklistService.getChecklistById(id!),
    enabled: mode === "edit" && !!id,
  });

  useEffect(() => {
    if (checklist && mode === "edit") {
      setFormData({
        name: checklist.name,
        description: checklist.description || "",
        type: checklist.type,
        frequency: checklist.frequency,
        is_active: checklist.is_active,
        items: checklist.items?.map((item, index) => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          item_type: item.item_type,
          is_required: item.is_required,
          sort_order: item.sort_order || index
        })) || []
      });
    }
  }, [checklist, mode]);

  const createMutation = useMutation({
    mutationFn: async (data: ChecklistFormData) => {
      // Create checklist first
      const newChecklist = await checklistService.createChecklist({
        name: data.name,
        description: data.description,
        type: data.type,
        frequency: data.frequency,
        is_active: data.is_active
      });

      // Then create items
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        await checklistService.createChecklistItem({
          checklist_id: newChecklist.id,
          title: item.title,
          description: item.description,
          item_type: item.item_type,
          is_required: item.is_required,
          sort_order: i
        });
      }

      return newChecklist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist created successfully");
      navigate("/checklists");
    },
    onError: (error: any) => {
      toast.error("Failed to create checklist", {
        description: error.message
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ChecklistFormData) => {
      if (!id) throw new Error("No checklist ID");

      // Update checklist
      await checklistService.updateChecklist(id, {
        name: data.name,
        description: data.description,
        type: data.type,
        frequency: data.frequency,
        is_active: data.is_active
      });

      // Get existing items to determine what to update/create/delete
      const existingItems = checklist?.items || [];
      const newItems = data.items;

      // Update or create items
      for (let i = 0; i < newItems.length; i++) {
        const item = newItems[i];
        if (item.id) {
          // Update existing item
          await checklistService.updateChecklistItem(item.id, {
            title: item.title,
            description: item.description,
            item_type: item.item_type,
            is_required: item.is_required,
            sort_order: i
          });
        } else {
          // Create new item
          await checklistService.createChecklistItem({
            checklist_id: id,
            title: item.title,
            description: item.description,
            item_type: item.item_type,
            is_required: item.is_required,
            sort_order: i
          });
        }
      }

      // Delete removed items
      const newItemIds = newItems.filter(item => item.id).map(item => item.id);
      const itemsToDelete = existingItems.filter(item => !newItemIds.includes(item.id));
      
      for (const item of itemsToDelete) {
        await checklistService.deleteChecklistItem(item.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", id] });
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist updated successfully");
      navigate("/checklists");
    },
    onError: (error: any) => {
      toast.error("Failed to update checklist", {
        description: error.message
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter a checklist name");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Please add at least one checklist item");
      return;
    }

    if (mode === "create") {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          title: "",
          description: "",
          item_type: "checkbox",
          is_required: false,
          sort_order: prev.items.length
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof ChecklistItemForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formData.items.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newItems = [...formData.items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    setFormData(prev => ({ ...prev, items: newItems }));
  };

  if (mode === "edit" && isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">Loading checklist...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/checklists")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Checklists
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            {mode === "create" ? "Create New Checklist" : "Edit Checklist"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter checklist name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ChecklistTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ChecklistFrequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, is_active: !!checked }))
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter checklist description"
                  rows={3}
                />
              </div>
            </Card>

            {/* Checklist Items */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Checklist Items</h2>
                <Button type="button" onClick={addItem} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No items added yet. Click "Add Item" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Item {index + 1}</span>
                          {item.is_required && (
                            <Badge variant="outline">Required</Badge>
                          )}
                          <Badge variant="outline" className="capitalize">
                            {item.item_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => moveItem(index, "up")}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => moveItem(index, "down")}
                            disabled={index === formData.items.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => updateItem(index, "title", e.target.value)}
                            placeholder="Enter item title"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={item.item_type}
                            onValueChange={(value) => updateItem(index, "item_type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                          placeholder="Enter item description (optional)"
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required-${index}`}
                          checked={item.is_required}
                          onCheckedChange={(checked) => 
                            updateItem(index, "is_required", !!checked)
                          }
                        />
                        <Label htmlFor={`required-${index}`}>Required field</Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/checklists")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="min-w-32"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : mode === "create"
                  ? "Create Checklist"
                  : "Update Checklist"
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChecklistForm;
