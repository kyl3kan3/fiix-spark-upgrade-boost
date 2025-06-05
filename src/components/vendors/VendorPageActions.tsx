
import React from "react";
import { Link } from "react-router-dom";
import { Plus, UserPlus } from "lucide-react";
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
  const canAdd = currentUserRole === 'administrator' || currentUserRole === 'manager';
  const canDelete = currentUserRole === 'administrator';

  return (
    <div className="flex flex-col gap-4">
      {/* Main Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {canAdd && (
          <Link to="/vendors/new">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" />
              Add Single Vendor
            </Button>
          </Link>
        )}
        
        {canAdd && (
          <Button variant="outline" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Import Multiple Vendors
          </Button>
        )}
      </div>

      {/* Bulk Selection Actions */}
      {canDelete && selectedCount > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800 dark:text-blue-200">
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
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={onBulkDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Selected"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPageActions;
