
import React from "react";
import { Trash2, Archive, Mail, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VendorBulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: string) => void;
  onBulkExport: () => void;
  onClearSelection: () => void;
}

const VendorBulkActions: React.FC<VendorBulkActionsProps> = ({
  selectedCount,
  onBulkDelete,
  onBulkStatusChange,
  onBulkExport,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} vendor{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <Button variant="outline" size="sm" onClick={onClearSelection}>
            Clear
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Change Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onBulkStatusChange("active")}>
                Set as Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkStatusChange("inactive")}>
                Set as Inactive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkStatusChange("suspended")}>
                Set as Suspended
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={onBulkExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="destructive" size="sm" onClick={onBulkDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendorBulkActions;
