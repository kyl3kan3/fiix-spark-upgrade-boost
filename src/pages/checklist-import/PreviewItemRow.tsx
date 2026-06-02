import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DraftItem } from "./types";

interface PreviewItemRowProps {
  item: DraftItem;
  index: number;
  isEmpty: boolean;
  isDup: boolean;
  dupRow?: number;
  showSourceBadge: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onChange: (patch: Partial<DraftItem>) => void;
  onRemove: () => void;
}

export const PreviewItemRow: React.FC<PreviewItemRowProps> = ({
  item,
  isEmpty,
  isDup,
  dupRow,
  showSourceBadge,
  selected,
  onToggleSelect,
  onChange,
  onRemove,
}) => (
  <div
    className={cn(
      "flex items-start gap-2 border rounded-md p-2",
      isEmpty && "border-destructive/60 bg-destructive/5",
      !isEmpty && isDup && "border-warning/60 bg-warning/5",
    )}
  >
    <div className="flex flex-col items-center gap-2 pt-2">
      <Checkbox checked={selected} onCheckedChange={onToggleSelect} aria-label="Select row" />
      <Checkbox
        checked={item.is_required}
        onCheckedChange={(v) => onChange({ is_required: Boolean(v) })}
        title="Required"
        className="border-primary"
      />
    </div>
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-2">
        <Input
          value={item.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Item title"
          className={cn(isEmpty && "border-destructive")}
        />
        {isEmpty && <Badge variant="destructive">Empty</Badge>}
        {!isEmpty && isDup && (
          <Badge className="bg-warning text-warning hover:bg-warning">
            {dupRow !== undefined ? `Duplicate of row ${dupRow + 1}` : "Duplicate"}
          </Badge>
        )}
        {item.sourceFile && showSourceBadge && (
          <Badge variant="outline" className="text-xs">{item.sourceFile}</Badge>
        )}
      </div>
      <Input
        value={item.description ?? ""}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Description (optional)"
      />
    </div>
    <Button variant="ghost" size="icon" onClick={onRemove}>
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
);
