
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { Checklist, ChecklistItem } from "@/types/checklists";
import { toast } from "sonner";
import { format } from "date-fns";

interface ChecklistSubmissionFormProps {
  checklist: Checklist;
  onSubmitSuccess: () => void;
}

interface FormResponse {
  item_id: string;
  response_value?: string;
  is_checked?: boolean;
  notes?: string;
}

const ChecklistSubmissionForm: React.FC<ChecklistSubmissionFormProps> = ({
  checklist,
  onSubmitSuccess
}) => {
  const [responses, setResponses] = useState<Record<string, FormResponse>>({});
  const [submissionNotes, setSubmissionNotes] = useState("");
  const queryClient = useQueryClient();

  // Initialize responses for all items
  React.useEffect(() => {
    if (checklist.items) {
      const initialResponses: Record<string, FormResponse> = {};
      checklist.items.forEach(item => {
        initialResponses[item.id] = {
          item_id: item.id,
          response_value: "",
          is_checked: item.item_type === "checkbox" ? false : undefined,
          notes: ""
        };
      });
      setResponses(initialResponses);
    }
  }, [checklist.items]);

  const submitMutation = useMutation({
    mutationFn: (data: { items: FormResponse[]; notes?: string }) =>
      checklistService.submitChecklist(checklist.id, data.items, data.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-submissions"] });
      toast.success("Checklist submitted successfully");
      onSubmitSuccess();
    },
    onError: (error: any) => {
      toast.error("Failed to submit checklist", {
        description: error.message
      });
    }
  });

  const updateResponse = (itemId: string, field: keyof FormResponse, value: any) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredItems = checklist.items?.filter(item => item.is_required) || [];
    const missingRequired = requiredItems.filter(item => {
      const response = responses[item.id];
      if (item.item_type === "checkbox") {
        return !response?.is_checked;
      }
      return !response?.response_value?.trim();
    });

    if (missingRequired.length > 0) {
      toast.error("Please fill in all required fields", {
        description: `Missing: ${missingRequired.map(item => item.title).join(", ")}`
      });
      return;
    }

    // Prepare submission data
    const submissionItems = Object.values(responses);
    submitMutation.mutate({
      items: submissionItems,
      notes: submissionNotes.trim() || undefined
    });
  };

  const renderItemInput = (item: ChecklistItem) => {
    const response = responses[item.id];
    if (!response) return null;

    switch (item.item_type) {
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`item-${item.id}`}
              checked={response.is_checked || false}
              onCheckedChange={(checked) => 
                updateResponse(item.id, "is_checked", checked)
              }
            />
            <Label htmlFor={`item-${item.id}`} className="text-sm font-normal">
              Mark as completed
            </Label>
          </div>
        );

      case "text":
        return (
          <Input
            value={response.response_value || ""}
            onChange={(e) => updateResponse(item.id, "response_value", e.target.value)}
            placeholder="Enter text response"
            required={item.is_required}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={response.response_value || ""}
            onChange={(e) => updateResponse(item.id, "response_value", e.target.value)}
            placeholder="Enter number"
            required={item.is_required}
          />
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {response.response_value
                  ? format(new Date(response.response_value), "PPP")
                  : "Pick a date"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={response.response_value ? new Date(response.response_value) : undefined}
                onSelect={(date) =>
                  updateResponse(item.id, "response_value", date?.toISOString())
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return null;
    }
  };

  if (!checklist.items || checklist.items.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No items to fill out
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            This checklist doesn't have any items to complete.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Checklist Items</h2>
        
        <div className="space-y-6">
          {checklist.items
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((item, index) => (
              <div key={item.id} className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-300">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{item.title}</h3>
                      {item.is_required && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.item_type}
                      </Badge>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <Label>Response {item.is_required && "*"}</Label>
                      {renderItemInput(item)}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`notes-${item.id}`}>Notes (optional)</Label>
                      <Textarea
                        id={`notes-${item.id}`}
                        value={responses[item.id]?.notes || ""}
                        onChange={(e) => updateResponse(item.id, "notes", e.target.value)}
                        placeholder="Add any additional notes or comments"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Submission Notes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
        <div className="space-y-2">
          <Label htmlFor="submission-notes">General notes about this submission (optional)</Label>
          <Textarea
            id="submission-notes"
            value={submissionNotes}
            onChange={(e) => setSubmissionNotes(e.target.value)}
            placeholder="Add any general comments about this checklist submission"
            rows={3}
          />
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={submitMutation.isPending}
          className="min-w-32"
        >
          {submitMutation.isPending ? "Submitting..." : "Submit Checklist"}
        </Button>
      </div>
    </form>
  );
};

export default ChecklistSubmissionForm;
