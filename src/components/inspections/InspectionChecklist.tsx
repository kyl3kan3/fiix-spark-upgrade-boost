
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { InspectionItem } from "@/types/inspections";

interface InspectionChecklistProps {
  items: InspectionItem[];
  isCompleted: boolean;
  handleItemPassChange: (itemId: string, passed: boolean) => void;
  handleNoteChange: (itemId: string, notes: string) => void;
  handleSaveChecklist: () => void;
}

const InspectionChecklist: React.FC<InspectionChecklistProps> = ({
  items,
  isCompleted,
  handleItemPassChange,
  handleNoteChange,
  handleSaveChecklist,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inspection Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Item</TableHead>
              <TableHead className="w-[100px] text-center">Pass/Fail</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Checkbox
                        id={`${item.id}-pass`}
                        checked={item.passed === true}
                        disabled={isCompleted}
                        onCheckedChange={() => handleItemPassChange(item.id, true)}
                      />
                      <label htmlFor={`${item.id}-pass`} className="text-sm text-green-600">Pass</label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Checkbox
                        id={`${item.id}-fail`}
                        checked={item.passed === false}
                        disabled={isCompleted}
                        onCheckedChange={() => handleItemPassChange(item.id, false)}
                      />
                      <label htmlFor={`${item.id}-fail`} className="text-sm text-red-600">Fail</label>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Textarea
                    value={item.notes}
                    disabled={isCompleted}
                    onChange={(e) => handleNoteChange(item.id, e.target.value)}
                    placeholder="Enter notes"
                    className="h-20 min-h-0"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {!isCompleted && items.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveChecklist}>Save Checklist</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InspectionChecklist;
