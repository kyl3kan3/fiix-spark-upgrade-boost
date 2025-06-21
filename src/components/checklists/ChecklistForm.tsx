import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BasicInformationSection from "./BasicInformationSection";
import ChecklistItemsSection from "./ChecklistItemsSection";

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

  const handleBasicInfoUpdate = (field: keyof Omit<ChecklistFormData, 'items'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <BasicInformationSection
              formData={formData}
              onUpdate={handleBasicInfoUpdate}
            />

            <ChecklistItemsSection
              items={formData.items}
              onAddItem={addItem}
              onRemoveItem={removeItem}
              onUpdateItem={updateItem}
              onMoveItem={moveItem}
            />

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
