
import React from "react";
import { Button } from "@/components/ui/button";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";

interface VendorPageActionsProps {
 selectedCount: number;
 onBulkDelete: () => void;
 onClearSelection: () => void;
 isDeleting: boolean;
}

const VendorPageActions: React.FC<VendorPageActionsProps> = ({
 selectedCount,
 onBulkDelete,
 onClearSelection,
 isDeleting
}) => {
 const { currentUserRole } = useUserRolePermissions();
 
 // Default to allowing delete actions if role is not loaded yet
 const canDelete = !currentUserRole || currentUserRole === 'administrator';

 return (
 <div className="flex flex-col gap-4">
 {/* Bulk Selection Actions */}
 {selectedCount > 0 && (
 <div className="p-4 bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary rounded-lg">
 <div className="flex items-center justify-between">
 <span className="text-sm text-primary dark:text-primary">
 {selectedCount} vendor(s) selected
 </span>
 <div className="flex gap-2">
 <Button 
 variant="outline" 
 size="sm" 
 onClick={onClearSelection}
 >
 Clear Selection
 </Button>
 {canDelete && (
 <Button 
 variant="destructive" 
 size="sm" 
 onClick={onBulkDelete}
 disabled={isDeleting}
 >
 {isDeleting ? "Deleting..." : "Delete Selected"}
 </Button>
 )}
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default VendorPageActions;
