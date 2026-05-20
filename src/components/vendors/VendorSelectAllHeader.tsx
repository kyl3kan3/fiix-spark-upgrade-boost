
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
 
 // Default to allowing delete actions if role is not loaded yet or show for all users
 const canDelete = !currentUserRole || currentUserRole === 'administrator';

 // Show select all header if there are vendors, regardless of permissions
 if (vendorsCount === 0) {
 return null;
 }

 const allSelected = vendorsCount > 0 && selectedCount === vendorsCount;
 const someSelected = selectedCount > 0 && selectedCount < vendorsCount;

 return (
 <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted p-4 dark:border-border dark:bg-card sm:flex-nowrap">
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
 <span className="min-w-0 text-sm font-medium text-foreground dark:text-muted-foreground">
 {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
 </span>
 {selectedCount > 0 && (
 <span className="w-full text-sm text-muted-foreground dark:text-muted-foreground sm:w-auto">
 ({selectedCount} selected)
 </span>
 )}
 </div>
 );
};

export default VendorSelectAllHeader;
