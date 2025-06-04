
import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";

interface VendorCardActionsProps {
  vendorId: string;
  vendorName: string;
  isDeleting: boolean;
  onDeleteVendor: (vendorId: string) => void;
}

const VendorCardActions: React.FC<VendorCardActionsProps> = ({
  vendorId,
  vendorName,
  isDeleting,
  onDeleteVendor,
}) => {
  const { currentUserRole } = useUserRolePermissions();
  
  // Allow administrators and managers to delete vendors
  const canDelete = currentUserRole === 'administrator' || currentUserRole === 'manager';

  console.log("VendorCardActions - User role:", currentUserRole, "Can delete:", canDelete);

  if (!canDelete) {
    console.log("User cannot delete vendors - hiding delete button");
    return null;
  }

  const handleDelete = () => {
    console.log("Attempting to delete vendor:", vendorId, vendorName);
    onDeleteVendor(vendorId);
  };

  return (
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{vendorName}"? This action cannot be undone and will also remove all associated contracts and relationships.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorCardActions;
