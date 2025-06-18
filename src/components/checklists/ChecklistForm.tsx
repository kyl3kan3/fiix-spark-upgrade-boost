
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { ChecklistTypes, ChecklistItem } from "@/types/checklists";

interface ChecklistFormProps {
  mode: 'create' | 'edit';
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("general");
  const [items, setItems] = useState<Partial<ChecklistItem>[]>([]);

  // Fetch existing checklist for edit mode
  const { data: checklist } = useQuery({
    queryKey: ["checklist", id],
    queryFn: () => checklistService.getChecklistById(id!),
    enabled: mode === 'edit' && !!id,
  });

  useEffect(() => {
    if (checklist) {
      setName(checklist.name);
      setDescription(checklist.description || "");
      setType(checklist.type);
      setItems(checklist.items || []);
    }
  }, [checklist]);

  const createMutation = useMutation({
    mutationFn: checklistService.createChecklist,
    onSuccess: () => {
      toast.success("Checklist created successfully");
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      navigate("/checklists");
    },
    onError: () => {
      toast.error("Failed to create checklist");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      checklistService.updateChecklist(id, updates),
    onSuccess: () => {
      toast.success("Checklist updated successfully");
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      navigate("/checklists");
    },
    onError: () => {
      toast.error("Failed to update checklist");
    },
  });

  const addItem = () => {
    setItems([...items, {
      title: "",
      description: "",
      item_type: "checkbox",
      is_required: false,
      sort_order: items.length,
    }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a checklist name");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one checklist item");
      return;
    }

    const checklistData = {
      name: name.trim(),
      description: description.trim(),
      type,
      is_active: true,
    };

    if (mode === 'create') {
      const newChecklist = await createMutation.mutateAsync(checklistData);
      
      // Create items
      for (const item of items) {
        if (item.title?.trim()) {
          await checklistService.createChecklistItem({
            checklist_id: newChecklist.id,
            title: item.title.trim(),
            description: item.description || "",
            item_type: item.item_type || "checkbox",
            is_required: item.is_required || false,
            sort_order: item.sort_order || 0,
          });
        }
      }
    } else {
      updateMutation.mutate({ id: id!, updates: checklistData });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {mode === 'create' ? 'Create New Checklist' : 'Edit Checklist'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {mode === 'create' ? 'Create a reusable checklist template' : 'Update checklist details and items'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Checklist Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Daily Safety Check"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ChecklistTypes.map(checklistType => (
                    <SelectItem key={checklistType.value} value={checklistType.value}>
                      {checklistType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose and scope of this checklist"
              rows={3}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Checklist Items</h2>
            <Button type="button" onClick={addItem} variant="outline">
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
                <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-start gap-4">
                    <GripVertical className="h-5 w-5 text-gray-400 mt-2" />
                    
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Item Title *</Label>
                          <Input
                            value={item.title || ""}
                            onChange={(e) => updateItem(index, "title", e.target.value)}
                            placeholder="e.g., Check fire extinguisher"
                          />
                        </div>
                        
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={item.item_type || "checkbox"}
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

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={item.description || ""}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                          placeholder="Additional details or instructions"
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required-${index}`}
                          checked={item.is_required || false}
                          onCheckedChange={(checked) => updateItem(index, "is_required", checked)}
                        />
                        <Label htmlFor={`required-${index}`}>Required item</Label>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" type="button" onClick={() => navigate("/checklists")}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {mode === 'create' ? 'Create Checklist' : 'Update Checklist'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChecklistForm;
