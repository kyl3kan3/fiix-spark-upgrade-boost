
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";

interface VendorSelectAllHeaderProps {
  vendorsCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

const VendorSelectAllHeader: React.FC<VendorSelectAllHeaderProps> = ({
  vendorsCount,
  selectedCount,
  onSelectAll,
  onClearSelection,
}) => {
  const { currentUserRole } = useUserRolePermissions();
  const canDelete = currentUserRole === 'administrator';

  if (!canDelete || vendorsCount === 0) {
    return null;
  }

  const allSelected = vendorsCount > 0 && selectedCount === vendorsCount;
  const someSelected = selectedCount > 0 && selectedCount < vendorsCount;

  return (
    <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <Checkbox
        checked={allSelected}
        ref={(el: HTMLButtonElement | null) => {
          if (el) {
            const input = el.querySelector('input') as HTMLInputElement;
            if (input) input.indeterminate = someSelected;
          }
        }}
        onCheckedChange={(checked) => {
          if (checked) {
            onSelectAll();
          } else {
            onClearSelection();
          }
        }}
      />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
      </span>
      {selectedCount > 0 && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({selectedCount} selected)
        </span>
      )}
    </div>
  );
};

export default VendorSelectAllHeader;
