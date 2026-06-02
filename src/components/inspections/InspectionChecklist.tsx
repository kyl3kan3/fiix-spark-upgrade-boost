import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
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
    <div className="surface-card rounded-lg p-6">
      <h3 className="font-headline font-semibold text-lg text-foreground mb-4">Inspection Checklist</h3>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px] sm:w-[300px]">Item</TableHead>
              <TableHead className="w-[120px] text-center">Pass / Fail</TableHead>
              <TableHead className="hidden md:table-cell">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-4">
                    <div className="flex items-center gap-1">
                      <Checkbox
                        id={`${item.id}-pass`}
                        checked={item.passed === true}
                        disabled={isCompleted}
                        onCheckedChange={() => handleItemPassChange(item.id, true)}
                      />
                      <label htmlFor={`${item.id}-pass`} className="text-xs text-success font-medium cursor-pointer">
                        Pass
                      </label>
                    </div>
                    <div className="flex items-center gap-1">
                      <Checkbox
                        id={`${item.id}-fail`}
                        checked={item.passed === false}
                        disabled={isCompleted}
                        onCheckedChange={() => handleItemPassChange(item.id, false)}
                      />
                      <label htmlFor={`${item.id}-fail`} className="text-xs text-destructive font-medium cursor-pointer">
                        Fail
                      </label>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
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
      </div>

      {/* Mobile-only notes */}
      <div className="md:hidden mt-4 space-y-3">
        {items.map((item) => (
          <div key={`m-${item.id}`} className="space-y-1">
            <label className="label-eyebrow">Notes — {item.name}</label>
            <Textarea
              value={item.notes}
              disabled={isCompleted}
              onChange={(e) => handleNoteChange(item.id, e.target.value)}
              placeholder="Enter notes"
              className="h-16 min-h-0"
            />
          </div>
        ))}
      </div>

      {!isCompleted && items.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveChecklist}>Save Checklist</Button>
        </div>
      )}
    </div>
  );
};

export default InspectionChecklist;
