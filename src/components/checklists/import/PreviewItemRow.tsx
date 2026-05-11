import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DraftItem } from "./parsers";

interface Props {
  item: DraftItem;
  index: number;
  isEmpty: boolean;
  isDuplicate: boolean;
  duplicateOf?: number;
  isSelected: boolean;
  showSourceBadge: boolean;
  onUpdate: (patch: Partial<DraftItem>) => void;
  onRemove: () => void;
  onToggleSelect: () => void;
}

export const PreviewItemRow: React.FC<Props> = ({
  item,
  isEmpty,
  isDuplicate,
  duplicateOf,
  isSelected,
  showSourceBadge,
  onUpdate,
  onRemove,
  onToggleSelect,
}) => (
  <div
    className={cn(
      "flex items-start gap-2 border rounded-md p-2",
      isEmpty && "border-destructive/60 bg-destructive/5",
      !isEmpty && isDuplicate && "border-yellow-500/60 bg-yellow-500/5",
    )}
  >
    <div className="flex flex-col items-center gap-2 pt-2">
      <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} aria-label="Select row" />
      <Checkbox
        checked={item.is_required}
        onCheckedChange={(v) => onUpdate({ is_required: Boolean(v) })}
        title="Required"
        className="border-primary"
      />
    </div>
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-2">
        <Input
          value={item.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Item title"
          className={cn(isEmpty && "border-destructive")}
        />
        {isEmpty && <Badge variant="destructive">Empty</Badge>}
        {!isEmpty && isDuplicate && (
          <Badge className="bg-yellow-500 text-yellow-50 hover:bg-yellow-500">
            {duplicateOf !== undefined ? `Duplicate of row ${duplicateOf + 1}` : "Duplicate"}
          </Badge>
        )}
        {item.sourceFile && showSourceBadge && (
          <Badge variant="outline" className="text-xs">{item.sourceFile}</Badge>
        )}
      </div>
      <Input
        value={item.description ?? ""}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Description (optional)"
      />
    </div>
    <Button variant="ghost" size="icon" onClick={onRemove}>
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
);
