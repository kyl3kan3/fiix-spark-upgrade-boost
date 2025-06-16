
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Square, Move, Trash2 } from "lucide-react";

interface BulkSelectionControlsProps {
  selectedCount: number;
  totalCount: number;
  onToggleAll: () => void;
  onMove: () => void;
  onDelete: () => void;
}

export const BulkSelectionControls: React.FC<BulkSelectionControlsProps> = ({
  selectedCount,
  totalCount,
  onToggleAll,
  onMove,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAll}
          className="flex items-center gap-2"
        >
          {selectedCount === totalCount ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          {selectedCount === totalCount ? "Deselect All" : "Select All"}
        </Button>
        
        {selectedCount > 0 && (
          <Badge variant="secondary">
            {selectedCount} selected
          </Badge>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onMove}
            className="flex items-center gap-2"
          >
            <Move className="h-4 w-4" />
            Move
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};
