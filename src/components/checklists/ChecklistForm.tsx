
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { ChecklistTypes, ChecklistFrequencies, ChecklistItem } from "@/types/checklists";
import { toast } from "sonner";

interface ChecklistFormProps {
  mode: "create" | "edit";
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [frequency, setFrequency] = useState("one-time");
  const [items, setItems] = useState<Omit<ChecklistItem, "id" | "created_at" | "checklist_id">[]>([]);

  // Fetch existing checklist if editing
  const { data: checklist, isLoading } = useQuery({
    queryKey: ["checklist", id],
    queryFn: () => checklistService.getChecklistById(id!),
    enabled: mode === "edit" && !!id,
  });

  // Load checklist data when editing
  useEffect(() => {
    if (checklist && mode === "edit") {
      setName(checklist.name);
      setDescription(checklist.description || "");
      setType(checklist.type);
      setFrequency(checklist.frequency || "one-time");
      if (checklist.items) {
        setItems(checklist.items.map(item => ({
          title: item.title,
          description: item.description,
          item_type: item.item_type,
          is_required: item.is_required,
          sort_order: item.sort_order,
        })));
      }
    }
  }, [checklist, mode]);

  // Create checklist mutation
  const createMutation = useMutation({
    mutationFn: checklistService.createChecklist,
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

  // Update checklist mutation
  const updateMutation = useMutation({
    mutationFn: (updates: any) => checklistService.updateChecklist(id!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      queryClient.invalidateQueries({ queryKey: ["checklist", id] });
      toast.success("Checklist updated successfully");
      navigate("/checklists");
    },
    onError: (error: any) => {
      toast.error("Failed to update checklist", {
        description: error.message
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !type || !frequency) {
      toast.error("Please fill in all required fields");
      return;
    }

    const checklistData = {
      name: name.trim(),
      description: description.trim(),
      type,
      frequency,
      is_active: true,
    };

    if (mode === "create") {
      createMutation.mutate(checklistData);
    } else {
      updateMutation.mutate(checklistData);
    }
  };

  const addItem = () => {
    setItems([...items, {
      title: "",
      description: "",
      item_type: "text",
      is_required: false,
      sort_order: items.length,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  if (mode === "edit" && isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Loading checklist...</div>
      </div>
    );
  }

  return (
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter checklist name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select checklist type" />
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

              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {ChecklistFrequencies.map(freq => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
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
                placeholder="Enter checklist description"
                rows={3}
              />
            </div>
          </Card>

          {/* Checklist Items */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Checklist Items</h2>
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
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Title *</Label>
                            <Input
                              value={item.title}
                              onChange={(e) => updateItem(index, "title", e.target.value)}
                              placeholder="Enter item title"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label>Type</Label>
                            <Select 
                              value={item.item_type} 
                              onValueChange={(value) => updateItem(index, "item_type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
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
                            placeholder="Enter item description"
                            rows={2}
                          />
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.is_required}
                              onChange={(e) => updateItem(index, "is_required", e.target.checked)}
                            />
                            <span className="text-sm">Required</span>
                          </label>
                          
                          {item.is_required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
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

          {/* Actions */}
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
            >
              {mode === "create" ? "Create Checklist" : "Update Checklist"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChecklistForm;
