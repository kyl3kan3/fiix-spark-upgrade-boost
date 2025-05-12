
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { InspectionItem } from "@/types/inspections";

// Mock data for daily checklist items
const defaultChecklistItems: InspectionItem[] = [
  { id: "daily-1", name: "Safety equipment check", passed: null, notes: "" },
  { id: "daily-2", name: "Fire extinguisher inspection", passed: null, notes: "" },
  { id: "daily-3", name: "Emergency exit paths clear", passed: null, notes: "" },
  { id: "daily-4", name: "First aid kit inventory", passed: null, notes: "" },
  { id: "daily-5", name: "Equipment startup procedure", passed: null, notes: "" }
];

const DailyChecklist: React.FC = () => {
  const [checklistItems, setChecklistItems] = useState<InspectionItem[]>(defaultChecklistItems);
  const [completedDate, setCompletedDate] = useState<string | null>(null);

  const handleItemCheck = (itemId: string, passed: boolean) => {
    const updatedItems = checklistItems.map(item => 
      item.id === itemId ? { ...item, passed } : item
    );
    setChecklistItems(updatedItems);
  };

  const allItemsChecked = checklistItems.every(item => item.passed !== null);
  
  const handleSubmit = () => {
    // In a real app, this would save to the database
    setCompletedDate(new Date().toISOString());
    toast.success("Daily checklist completed successfully");
  };

  const resetChecklist = () => {
    setChecklistItems(defaultChecklistItems);
    setCompletedDate(null);
  };

  return (
    <Card>
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-lg">Daily Safety Checklist</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {completedDate ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-md border border-green-200">
              <p className="text-green-700">
                Checklist completed on {new Date(completedDate).toLocaleDateString()} at{" "}
                {new Date(completedDate).toLocaleTimeString()}
              </p>
            </div>
            <div className="space-y-2">
              {checklistItems.map(item => (
                <div key={item.id} className="flex items-center">
                  <Checkbox 
                    id={item.id}
                    checked={item.passed === true}
                    disabled
                  />
                  <Label htmlFor={item.id} className="ml-2 text-muted-foreground">
                    {item.name}
                  </Label>
                </div>
              ))}
            </div>
            <Button onClick={resetChecklist} variant="outline" className="mt-4">
              Reset for Tomorrow
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Complete this safety checklist at the beginning of each workday.
            </p>
            <Separator />
            <div className="space-y-3">
              {checklistItems.map(item => (
                <div key={item.id} className="flex items-start space-x-6">
                  <div className="space-y-0.5">
                    <Label htmlFor={item.id}>{item.name}</Label>
                  </div>
                  <div className="flex items-center ml-auto gap-2">
                    <div className="flex items-center gap-1">
                      <Checkbox
                        id={`${item.id}-pass`}
                        checked={item.passed === true}
                        onCheckedChange={() => handleItemCheck(item.id, true)}
                      />
                      <Label 
                        htmlFor={`${item.id}-pass`} 
                        className="text-sm text-green-600"
                      >
                        Pass
                      </Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <Checkbox
                        id={`${item.id}-fail`}
                        checked={item.passed === false}
                        onCheckedChange={() => handleItemCheck(item.id, false)}
                      />
                      <Label 
                        htmlFor={`${item.id}-fail`}
                        className="text-sm text-red-600"
                      >
                        Fail
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={!allItemsChecked}
              className="w-full mt-4"
            >
              Complete Daily Checklist
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyChecklist;
