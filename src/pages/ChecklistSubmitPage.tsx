
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { ChecklistTypes } from "@/types/checklists";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const ChecklistSubmitPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState("");

  const { data: checklist, isLoading } = useQuery({
    queryKey: ["checklist", id],
    queryFn: () => checklistService.getChecklistById(id!),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => checklistService.submitChecklist(data.checklistId, data.items, data.notes),
    onSuccess: () => {
      toast.success("Checklist submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["checklist-submissions"] });
      navigate("/checklists");
    },
    onError: () => {
      toast.error("Failed to submit checklist");
    },
  });

  const updateResponse = (itemId: string, field: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checklist) return;

    // Validate required items
    const requiredItems = checklist.items?.filter(item => item.is_required) || [];
    const missingRequired = requiredItems.filter(item => {
      const response = responses[item.id];
      if (item.item_type === 'checkbox') {
        return !response?.is_checked;
      }
      return !response?.response_value?.trim();
    });

    if (missingRequired.length > 0) {
      toast.error(`Please complete all required items: ${missingRequired.map(item => item.title).join(', ')}`);
      return;
    }

    // Prepare submission data
    const items = (checklist.items || []).map(item => ({
      item_id: item.id,
      response_value: responses[item.id]?.response_value || "",
      is_checked: responses[item.id]?.is_checked || false,
      notes: responses[item.id]?.notes || "",
    }));

    submitMutation.mutate({
      checklistId: id!,
      items,
      notes,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">Loading checklist...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!checklist) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Checklist not found
            </h3>
            <Button onClick={() => navigate("/checklists")}>
              Back to Checklists
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'safety': return 'bg-red-100 text-red-800';
      case 'equipment': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'quality': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/checklists")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Checklists
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {checklist.name}
            </h1>
            <Badge className={getTypeColor(checklist.type)}>
              {ChecklistTypes.find(t => t.value === checklist.type)?.label || checklist.type}
            </Badge>
          </div>
          
          {checklist.description && (
            <p className="text-gray-500 dark:text-gray-400">{checklist.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Checklist Items</h2>
            
            <div className="space-y-6">
              {(checklist.items || []).map((item, index) => (
                <div key={item.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-2 py-1 rounded">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <Label className="text-base font-medium">
                        {item.title}
                        {item.is_required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="ml-12 space-y-3">
                    {item.item_type === 'checkbox' && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={responses[item.id]?.is_checked || false}
                          onCheckedChange={(checked) => updateResponse(item.id, 'is_checked', checked)}
                        />
                        <Label htmlFor={`item-${item.id}`}>Completed</Label>
                      </div>
                    )}

                    {item.item_type === 'text' && (
                      <Input
                        value={responses[item.id]?.response_value || ""}
                        onChange={(e) => updateResponse(item.id, 'response_value', e.target.value)}
                        placeholder="Enter your response"
                      />
                    )}

                    {item.item_type === 'number' && (
                      <Input
                        type="number"
                        value={responses[item.id]?.response_value || ""}
                        onChange={(e) => updateResponse(item.id, 'response_value', e.target.value)}
                        placeholder="Enter a number"
                      />
                    )}

                    {item.item_type === 'date' && (
                      <Input
                        type="date"
                        value={responses[item.id]?.response_value || ""}
                        onChange={(e) => updateResponse(item.id, 'response_value', e.target.value)}
                      />
                    )}

                    <div>
                      <Label htmlFor={`notes-${item.id}`} className="text-sm">Notes (optional)</Label>
                      <Textarea
                        id={`notes-${item.id}`}
                        value={responses[item.id]?.notes || ""}
                        onChange={(e) => updateResponse(item.id, 'notes', e.target.value)}
                        placeholder="Add any additional notes or comments"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any overall notes or comments about this checklist submission"
              rows={4}
            />
          </Card>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" type="button" onClick={() => navigate("/checklists")}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Submit Checklist
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ChecklistSubmitPage;
